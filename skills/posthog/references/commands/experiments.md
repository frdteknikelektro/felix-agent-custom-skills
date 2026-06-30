# Experiments

**List experiments** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/experiments/"
```

**Get experiment detail** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/experiments/{experiment_id}/"
```

Returns name, feature flag key, metrics, variant configurations, exposure, and results (if available).

**Create experiment** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Checkout A/B Test","feature_flag_key":"new_checkout_flow","parameters":{"recommended_running_time":14,"minimum_detectable_effect":5}}' \
  "https://app.posthog.com/api/projects/{project_id}/experiments/"
```

Experiments require an existing feature flag. The referenced flag must exist in the same project before creating the experiment.

**Update experiment** (`posthog.write`):

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  "https://app.posthog.com/api/projects/{project_id}/experiments/{experiment_id}/"
```

**Launch experiment** (`posthog.write`):

```bash
curl -s -X POST \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/experiments/{experiment_id}/launch/"
```

**Get experiment results** (`posthog.read`):

```bash
curl -s -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/experiments/{experiment_id}/results/"
```

**Delete experiment** (`posthog.write`, DESTRUCTIVE):

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_KEY" \
  "https://app.posthog.com/api/projects/{project_id}/experiments/{experiment_id}/"
```
