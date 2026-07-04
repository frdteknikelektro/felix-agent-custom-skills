# Deploy jala-web-next

## When to use

Use this recipe when the user asks to deploy, ship, or release jala-web-next to staging or production.

## Permission

Required permission: `deploy.write`.

## Inputs

Required:
- Environment: `staging` or `production`.

Derived:
- Command order: staging pulls first then sets node; production sets node first then pulls.
- pm2 process name: staging is `next`; production is `jala-web-next`.

## Prerequisites

- SSH access to `ubuntu@db.jala.tech` (staging) or `ubuntu@app.jala.tech` (production)
- Node 20 available via nvm on the server

## Workflow

1. Confirm the environment with the user.
2. Determine the command order and pm2 process name from the environment.
3. Show the full command sequence and get explicit confirmation.
4. SSH into the server and execute the deploy.
5. Verify the application is responding after deploy.

## Commands

### Staging

```sh
ssh ubuntu@db.jala.tech
cd Code/Web/jala-web-next
git pull
nvm use 20
yarn
yarn build
pm2 restart next
```

### Production

```sh
ssh ubuntu@app.jala.tech
cd Code/Web/jala-web-next
nvm use 20
git pull
yarn
yarn build
pm2 restart jala-web-next
```

## Verify

After deploy, confirm the application is responding on the deployed server:

```sh
ssh ubuntu@<server> "pm2 status"
```

Where `<server>` is `db.jala.tech` for staging or `app.jala.tech` for production. Check that the pm2 process is `online`.

## Failure modes

- **SSH connection refused** — check network connectivity and server status. Do not retry without user confirmation.
- **nvm use 20 fails** — Node 20 not installed on server. Report the error.
- **git pull fails** — branch may not exist or remote has changed. Check branch name.
- **yarn install fails** — dependency conflict or lock file mismatch. Report the error output.
- **yarn build fails** — build error. Report the error; do not retry without fixing the underlying issue.
- **pm2 restart fails** — process not found. Check if pm2 is running and the process name is correct.
