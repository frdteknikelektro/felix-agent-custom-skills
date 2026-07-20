# Deploy jala-point

## When to use

Use this recipe when the user asks to deploy, ship, or release jala-point to staging or production.

## Permission

Required permission: `deploy.write`.

## Inputs

Required:
- Environment: `staging` or `production`.

Derived:
- Branch: staging uses `develop`; production uses `release/*` or `master`.
- pm2 process name: `jala-points`.

## Prerequisites

- SSH access to `ubuntu@db.jala.tech` (staging) or `ubuntu@app.jala.tech` (production)
- Node 20 available via nvm on the server

## Workflow

1. Confirm the environment with the user.
2. Show the full command sequence and get explicit confirmation.
3. SSH into the server, capture current commit hash for rollback (`ssh ubuntu@<server> "cd Code/Web/jala-point && git rev-parse HEAD"`), then execute the deploy.
4. Verify the application is responding after deploy. If verification fails, rollback to the captured commit.
5. On rollback, rebuild and restart pm2 with the previous code.

## Commands

### Staging

Capture commit hash:

```sh
ssh ubuntu@db.jala.tech "cd Code/Web/jala-point && git rev-parse HEAD"
```

Save the output — it is the rollback target.

Deploy:

```sh
ssh ubuntu@db.jala.tech
cd Code/Web/jala-point

# source nvm for non-interactive SSH
source ~/.nvm/nvm.sh
nvm use 20

# try pull — if uncommitted changes block it, stash first
git pull || {
  git stash push -m "deploy-stash"
  git pull
}

# restore stashed changes if any
git stash list | grep -q deploy-stash && git stash pop

# build and restart
pnpm install
pnpm build
pm2 restart jala-points
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@db.jala.tech "pm2 status"`. If processes are not online, go to Recovery.

### Production

Capture commit hash:

```sh
ssh ubuntu@app.jala.tech "cd Code/Web/jala-point && git rev-parse HEAD"
```

Save the output — it is the rollback target.

Deploy:

```sh
ssh ubuntu@app.jala.tech
cd Code/Web/jala-point

# source nvm for non-interactive SSH
source ~/.nvm/nvm.sh
nvm use 20

# try pull — if uncommitted changes block it, stash first
git pull || {
  git stash push -m "deploy-stash"
  git pull
}

# restore stashed changes if any
git stash list | grep -q deploy-stash && git stash pop

# build and restart
pnpm install
pnpm build
pm2 restart jala-points
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@app.jala.tech "pm2 status"`. If processes are not online, go to Recovery.

## Verify

After deploy, confirm the application is responding on the deployed server:

- **jala-point**: `ssh ubuntu@<server> "pm2 status"` — check that processes are `online`.
- If processes are not online, go to Recovery.

## Failure modes

- **SSH connection refused** — check network connectivity and server status. Do not retry without user confirmation.
- **nvm use 20 fails** — Node 20 not installed on server. Report the error.
- **git pull fails** — branch may not exist or remote has changed. Check branch name.
- **pnpm install fails** — dependency conflict or lock file mismatch. Report the error output.
- **pnpm build fails** — build error. Report the error; do not retry without fixing the underlying issue.
- **pm2 restart fails** — process not found. Check if pm2 is running.
- **stash pop conflict** — `git stash pop` has conflicts. Felix will read each conflicted file, understand both sides, and merge intelligently — keep the deployed code for structural changes (config, lock files), keep the stashed changes for business logic. If irreconcilable, save to `/tmp/unstashed.patch` and report.

## Recovery

If deploy fails or verification fails, rollback to the commit hash captured before the deploy. Pass it to the recovery command.

```sh
ssh ubuntu@<server>
cd Code/Web/jala-point

# rollback
git checkout <commit-hash-from-above>
source ~/.nvm/nvm.sh
nvm use 20
pnpm install
pnpm build
pm2 restart jala-points
```
