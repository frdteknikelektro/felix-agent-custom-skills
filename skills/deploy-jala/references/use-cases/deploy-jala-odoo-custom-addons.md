# Deploy jala-odoo-custom-addons

## When to use

Use this recipe when the user asks to deploy, ship, or release jala-odoo-custom-addons (or odoo-custom-addons) to staging or production.

## Permission

Required permission: `deploy.write`.

## Inputs

Required:
- Environment: `staging` or `production`.

Derived:
- Server: staging is `staging-odoo.jala.tech`; production is `odoo.jala.tech`.
- Service name: staging is `odoo`; production is `odoo16`.
- Branch: staging is `16.0-staging`; production is `release/*` or `16-develop`.

## Prerequisites

- SSH access to `ubuntu@staging-odoo.jala.tech` (staging) or `ubuntu@odoo.jala.tech` (production)
- Odoo user accessible via `sudo su odoo`

## Workflow

1. Confirm the environment with the user.
2. Determine the server, branch, and service name from the environment.
3. Show the full command sequence and get explicit confirmation.
4. SSH into the server, capture current commit hash for rollback (`ssh ubuntu@<server> "sudo su odoo -c 'cd ~/custom-addons/jala && git rev-parse HEAD'"`), then execute the deploy.
5. Verify the service is running after deploy. If verification fails, rollback to the captured commit.
6. On rollback, checkout the previous commit and restart the service.

## Commands

### Staging

Capture commit hash:

```sh
ssh ubuntu@staging-odoo.jala.tech "sudo su odoo -c 'cd ~/custom-addons/jala && git rev-parse HEAD'"
```

Save the output — it is the rollback target.

Deploy:

```sh
ssh ubuntu@staging-odoo.jala.tech
sudo su odoo
cd ~/custom-addons/jala

# try pull — if uncommitted changes block it, stash first
git pull || {
  git stash push -m "deploy-stash"
  git pull
}

# restore stashed changes if any
git stash list | grep -q deploy-stash && git stash pop

exit
sudo service odoo restart
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@staging-odoo.jala.tech "sudo service odoo status"`. If the service is not active, go to Recovery.

### Production

Capture commit hash:

```sh
ssh ubuntu@odoo.jala.tech "sudo su odoo -c 'cd ~/custom-addons/jala && git rev-parse HEAD'"
```

Save the output — it is the rollback target.

Deploy:

```sh
ssh ubuntu@odoo.jala.tech
sudo su odoo
cd ~/custom-addons/jala

# try pull — if uncommitted changes block it, stash first
git pull || {
  git stash push -m "deploy-stash"
  git pull
}

# restore stashed changes if any
git stash list | grep -q deploy-stash && git stash pop

exit
sudo service odoo16 restart
```

If `git stash pop` has conflicts, resolve by reading each conflicted file and merging both sides.

Verify — run `ssh ubuntu@odoo.jala.tech "sudo service odoo16 status"`. If the service is not active, go to Recovery.

## Verify

After deploy, confirm the Odoo service is running on the deployed server:

- **Staging**: `ssh ubuntu@staging-odoo.jala.tech "sudo service odoo status"` — check that the service is `active (running)`.
- **Production**: `ssh ubuntu@odoo.jala.tech "sudo service odoo16 status"` — check that the service is `active (running)`.
- If the service is not running, go to Recovery.

## Failure modes

- **SSH connection refused** — check network connectivity and server status. Do not retry without user confirmation.
- **sudo su odoo fails** — odoo user may not exist or sudo permissions issue. Report the error.
- **git pull fails** — branch may not exist or remote has changed. Check branch name.
- **service restart fails** — service name may be wrong or Odoo config has errors. Report the error output.
- **stash pop conflict** — `git stash pop` has conflicts. Felix will read each conflicted file, understand both sides, and merge intelligently — keep the deployed code for structural changes (config), keep the stashed changes for business logic. If irreconcilable, save to `/tmp/unstashed.patch` and report.

## Recovery

If deploy fails or verification fails, rollback to the commit hash captured before the deploy. Pass it to the recovery command.

```sh
ssh ubuntu@<server>
sudo su odoo
cd ~/custom-addons/jala

# rollback
git checkout <commit-hash-from-above>

exit
sudo service <service-name> restart
```

Use the same service name as the original deploy (`odoo` for staging, `odoo16` for production).
