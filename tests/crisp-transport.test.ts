import { createServer } from "node:http";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

describe("crisp transport script", () => {
  it("builds auth, tier, cookie, extra headers, JSON, query, and workspace-bound paths", async () => {
    let observed: {
      authorization?: string;
      tier?: string;
      cookie?: string;
      trace?: string;
      contentType?: string;
      body?: string;
      url?: string;
    } = {};

    const server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        observed = {
          authorization: request.headers.authorization,
          tier: headerValue(request.headers["x-crisp-tier"]),
          cookie: headerValue(request.headers.cookie),
          trace: headerValue(request.headers["x-trace"]),
          contentType: headerValue(request.headers["content-type"]),
          body: Buffer.concat(chunks).toString("utf8"),
          url: request.url,
        };
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end('{"error":false,"data":{"ok":true}}');
      });
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("test server did not expose a port");

    try {
      const script = new URL("../skills/crisp/scripts/crisp_api.py", import.meta.url).pathname;
      const env = {
        ...process.env,
        CRISP_API_BASE_URL: `http://127.0.0.1:${address.port}`,
        CRISP_TOKEN_ID: "test-id",
        CRISP_TOKEN_KEY: "test-key",
        CRISP_TOKEN_TIER: "website",
        CRISP_WEBSITE_ID: "website-123",
      };

      const result = await execFileAsync(
        "python3",
        [
          script,
          "POST",
          "/v1/website/website-123/conversation/session-456/message",
          "--query",
          "search=hello world",
          "--header",
          "X-Trace: from-cli",
          "--json",
          '{"type":"text","content":"hello"}',
        ],
        { env },
      );

      expect(JSON.parse(result.stdout)).toEqual({ error: false, data: { ok: true } });
      expect(observed.authorization).toBe(
        `Basic ${Buffer.from("test-id:test-key").toString("base64")}`,
      );
      expect(observed.tier).toBe("website");
      expect(observed.cookie).toBe(
        'user_session={"identifier":"test-id","key":"test-key"}',
      );
      expect(observed.trace).toBe("from-cli");
      expect(observed.contentType).toBe("application/json");
      expect(JSON.parse(observed.body ?? "")).toEqual({ type: "text", content: "hello" });
      expect(new URL(observed.url ?? "", "http://127.0.0.1").searchParams.get("search")).toBe("hello world");
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});
