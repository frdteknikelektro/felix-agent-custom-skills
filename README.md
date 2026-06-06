# Felix Custom Skills

Custom skills for Felix Agent. Not part of the Felix agent base image — copy into a running instance.

## Deploying

Copy skill directories into the Felix workspace:

    cp -r skills/<skill-name> /path/to/felix/workspace/catalog/skills/

Then restart Felix. Skills are loaded on boot.

Alternatively, use the Felix WebUI to create skills via form, or `DELETE /api/skills/:id` to remove them.

## Skills

| Skill | Description |
|---|---|
| aws-jala | AWS management for Jala account |
| shorebird-jala | Shorebird release management for Jala |
| art-of-melancomedy | Stand-up comedy persona |

## Testing

    npm install
    npm test

Note: `tests/shorebird-jala-env.test.ts` reads from `config/.env` — create one if needed.
