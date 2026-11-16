# Deploy jala-web

## When to use

Use this recipe when the user asks to deploy, ship, or release jala-web to staging or production.

## Permission

Required permission: `deploy.write`.

## Inputs

Required:
- Environment: `staging` or `production`.

Derived:
- Branch: staging uses `feature/compile-to-test`; production uses `release/*` or `master`.
- Composer runner: staging uses `/usr/bin/php7.3 /usr/local/bin/composer`; production must resolve its binary dynamically (below) — `/home/ubuntu/bin/composer` is not reliably present on prod.
- Composer flags: staging installs with dev dependencies; production uses `--no-dev`.
- Artisan flags: staging runs `--no-downtime`; production runs `--no-downtime --production`.

## Prerequisites

- SSH access to `ubuntu@db.jala.tech` (staging) or `ubuntu@app.jala.tech` (production)
- The target branch must exist and be pushed

## Workflow

1. Confirm the environment with the user.
2. Determine the branch and command flags from the environment.
3. Show the full command sequence and get explicit confirmation.
4. SSH into the server, capture current commit hash for rollback (`ssh ubuntu@<server> "cd Code/Web/jala-web && git rev-parse HEAD"`), then execute the deploy.
5. Verify the application is responding after deploy. If verification fails, rollback to the captured commit.
6. On rollback, re-run composer install and artisan with the previous code.

## Commands

### Staging (branch `feature/compile-to-test`)

Capture commit hash:

```sh
ssh ubuntu@db.jala.tech "cd Code/Web/jala-web && git rev-parse HEAD"
```

Save the output — it is the rollback target.

Deploy:

```sh
ssh ubuntu@db.jala.tech
cd Code/Web/jala-web

# try pull — if uncommitted changes block it, stash first
git pull || {
  git stash push -m "deploy-stash"
  git pull
}

# restore stashed changes if any
git stash list | grep -q deploy-stash && git stash pop

# build and apply — resolve composer binary dynamically; do not assume a fixed path
COMPOSER_BIN="$(command -v composer || ls /usr/local/bin/composer /home/ubuntu/bin/composer 2>/dev/null | head -n 1)"
if [ -z "$COMPOSER_BIN" ]; then
  echo "composer binary not found on server; check lock changes before continuing" >&2
  git diff HEAD~1 --exit-code -- composer.lock && echo "composer.lock unchanged — continuing without install" || exit 1
fi
[ -n "$COMPOSER_BIN" ] && /usr/bin/php7.3 "$COMPOSER_BIN" install || true
/usr/bin/php7.3 artisan app:update --no-downtime

# restart ALL jala-staging queue workers — includes jala-staging-worker-push:*,
# which is easy to miss if enumerating groups manually
sudo supervisorctl restart jala-staging-long-worker:* jala-staging-worker:* jala-staging-worker-analytic:* jala-staging-worker-campaign:* jala-staging-worker-import:* jala-staging-worker-points:* jala-staging-worker-push:*
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@db.jala.tech "cd Code/Web/jala-web && /usr/bin/php7.3 artisan --version"`. If it fails, go to Recovery.

### Production (branches `release/*` or `master`)

Capture commit hash:

```sh
ssh ubuntu@app.jala.tech "cd Code/Web/jala-web && git rev-parse HEAD"
```

Save the output — it is the rollback target.

Deploy:

```sh
ssh ubuntu@app.jala.tech
cd Code/Web/jala-web

# try pull — if uncommitted changes block it, stash first
git pull || {
  git stash push -m "deploy-stash"
  git pull
}

# restore stashed changes if any
git stash list | grep -q deploy-stash && git stash pop

# build and apply — resolve composer binary dynamically; `/home/ubuntu/bin/composer`
# is not reliably present on prod (observed missing 2026-11-16), so locate it first
COMPOSER_BIN="$(command -v composer || ls /usr/local/bin/composer /home/ubuntu/bin/composer 2>/dev/null | head -n 1)"
if [ -z "$COMPOSER_BIN" ]; then
  echo "composer binary not found on server; check lock changes before continuing" >&2
  git diff HEAD~1 --exit-code -- composer.lock && echo "composer.lock unchanged — continuing without install" || exit 1
fi
[ -n "$COMPOSER_BIN" ] && /usr/bin/php7.3 "$COMPOSER_BIN" install --no-dev || true
/usr/bin/php7.3 artisan app:update --no-downtime --production

# restart ALL jala queue workers — includes jala-worker-push:*,
# which is easy to miss if enumerating groups manually
sudo supervisorctl restart jala-long-worker:* jala-worker:* jala-worker-analytic:* jala-worker-campaign:* jala-worker-import:* jala-worker-points:* jala-worker-push:*
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@app.jala.tech "cd Code/Web/jala-web && /usr/bin/php7.3 artisan --version"`. If it fails, go to Recovery.

## Worker restarts — `queue:restart` vs `supervisorctl restart`

`php artisan queue:restart` only writes a restart signal that `artisan queue:work` workers notice and exit after their current job; Supervisor then revives them. It therefore covers `artisan queue:work` processes (including push if it runs `queue:work`), but it does **not**:
- reload non-queue processes (php-fpm/web, mqtt/reverb),
- run `composer install` / `artisan app:update`,
- guarantee hung/stuck workers die promptly.

Keep the `supervisorctl restart <each group>:*` list as the canonical deploy step (it is deterministic and proves every process cycled). `queue:restart` may be run additionally as a graceful signal, not as a replacement for the supervisor restart.

## Verify

After deploy, confirm the application is responding on the deployed server:

- **jala-web**: `ssh ubuntu@<server> "cd Code/Web/jala-web && /usr/bin/php7.3 artisan --version"` — returns a version string if up.
- If the command fails or returns an error, go to Recovery.

## Failure modes

- **SSH connection refused** — check network connectivity and server status. Do not retry without user confirmation.
- **git pull fails** — branch may not exist locally or remote has changed. Check branch name and remote state.
- **composer install fails** — stop before `artisan` or worker restart. For staging, verify the command is `/usr/bin/php7.3 /usr/local/bin/composer install`; report the dependency or runtime error output.
- **artisan app:update fails** — migration or cache issue. Report the error; do not retry destructive steps automatically.
- **stash pop conflict** — `git stash pop` has conflicts. Read each conflicted file, understand both sides, and merge intelligently — keep the deployed code for structural changes (config, migrations), keep the stashed changes for business logic. If irreconcilable, save to `/tmp/unstashed.patch` and report.

## Recovery

If deploy fails or verification fails, rollback to the commit hash captured before the deploy. Pass it to the recovery command.

```sh
ssh ubuntu@<server>
cd Code/Web/jala-web
```

### Staging rollback

```sh
git checkout <commit-hash-from-above>
COMPOSER_BIN="$(command -v composer || ls /usr/local/bin/composer 2>/dev/null | head -n 1)"
[ -n "$COMPOSER_BIN" ] && /usr/bin/php7.3 "$COMPOSER_BIN" install
/usr/bin/php7.3 artisan app:update --no-downtime
```

### Production rollback

```sh
git checkout <commit-hash-from-above>
COMPOSER_BIN="$(command -v composer || ls /usr/local/bin/composer /home/ubuntu/bin/composer 2>/dev/null | head -n 1)"
[ -n "$COMPOSER_BIN" ] && /usr/bin/php7.3 "$COMPOSER_BIN" install --no-dev
/usr/bin/php7.3 artisan app:update --no-downtime --production
```

Use the staging or production block matching the original deploy command.
