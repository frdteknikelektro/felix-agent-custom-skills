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
4. SSH into the server, capture current commit hash for rollback, then execute the deploy.
5. Verify the application is responding after deploy. If verification fails, rollback to the saved commit.
6. On rollback, re-run composer install and artisan with the previous code.

## Commands

### Staging (branch `feature/compile-to-test`)

```sh
ssh ubuntu@db.jala.tech
cd Code/Web/jala-web
git pull
/usr/bin/php7.3 composer install
/usr/bin/php7.3 artisan app:update --no-downtime
```

### Production (branches `release/*` or `master`)

```sh
ssh ubuntu@app.jala.tech
cd Code/Web/jala-web
git pull
/usr/bin/php7.3 composer install --no-dev
/usr/bin/php7.3 artisan app:update --no-downtime --production
```

## Verify

After deploy, confirm the application is responding on the deployed server:

```sh
ssh ubuntu@<server> "cd Code/Web/jala-web && /usr/bin/php7.3 artisan --version"
```

Where `<server>` is `db.jala.tech` for staging or `app.jala.tech` for production. If the command returns a version, the application is up.

## Failure modes

- **SSH connection refused** — check network connectivity and server status. Do not retry without user confirmation.
- **git pull fails** — branch may not exist locally or remote may have changed. Check branch name and remote state.
- **composer install fails** — dependency conflict or missing lock file. Report the error output.
- **artisan app:update fails** — migration or cache issue. Report the error; do not retry destructive steps automatically.

## Recovery

If deploy fails or verification fails, rollback to the commit before the pull:

```sh
ssh ubuntu@<server>
cd Code/Web/jala-web
git checkout <previous-commit-hash>
/usr/bin/php7.3 composer install [--no-dev]
/usr/bin/php7.3 artisan app:update --no-downtime [--production]
```

The previous commit hash is captured before the deploy starts. Use the same flags as the original deploy command (with `--no-dev` and `--production` for production).
