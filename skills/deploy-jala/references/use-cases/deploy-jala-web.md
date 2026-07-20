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

# build and apply
/usr/bin/php7.3 composer install
/usr/bin/php7.3 artisan app:update --no-downtime

# restart workers
sudo supervisorctl restart jala-staging-long-worker:*
sudo supervisorctl restart jala-staging-worker:*
sudo supervisorctl restart jala-staging-worker-analytic:*
sudo supervisorctl restart jala-staging-worker-campaign:*
sudo supervisorctl restart jala-staging-worker-import:*
sudo supervisorctl restart jala-staging-worker-points:*
sudo supervisorctl restart jala-mqtt
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

# build and apply
/usr/bin/php7.3 composer install --no-dev
/usr/bin/php7.3 artisan app:update --no-downtime --production

# restart workers
sudo supervisorctl restart jala-long-worker:*
sudo supervisorctl restart jala-mqtt-worker:*
sudo supervisorctl restart jala-worker:*
sudo supervisorctl restart jala-worker-analytic:*
sudo supervisorctl restart jala-worker-campaign:*
sudo supervisorctl restart jala-worker-import:*
sudo supervisorctl restart jala-worker-points:*
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@app.jala.tech "cd Code/Web/jala-web && /usr/bin/php7.3 artisan --version"`. If it fails, go to Recovery.

## Verify

After deploy, confirm the application is responding on the deployed server:

- **jala-web**: `ssh ubuntu@<server> "cd Code/Web/jala-web && /usr/bin/php7.3 artisan --version"` — returns a version string if up.
- If the command fails or returns an error, go to Recovery.

## Failure modes

- **SSH connection refused** — check network connectivity and server status. Do not retry without user confirmation.
- **git pull fails** — branch may not exist locally or remote has changed. Check branch name and remote state.
- **composer install fails** — dependency conflict or missing lock file. Report the error output.
- **artisan app:update fails** — migration or cache issue. Report the error; do not retry destructive steps automatically.
- **stash pop conflict** — `git stash pop` has conflicts. Felix will read each conflicted file, understand both sides, and merge intelligently — keep the deployed code for structural changes (config, migrations), keep the stashed changes for business logic. If irreconcilable, save to `/tmp/unstashed.patch` and report.

## Recovery

If deploy fails or verification fails, rollback to the commit hash captured before the deploy. Pass it to the recovery command.

```sh
ssh ubuntu@<server>
cd Code/Web/jala-web

# rollback
git checkout <commit-hash-from-above>
/usr/bin/php7.3 composer install [--no-dev]
/usr/bin/php7.3 artisan app:update --no-downtime [--production]
```

Use the same flags as the original deploy command (with `--no-dev` and `--production` for production).
