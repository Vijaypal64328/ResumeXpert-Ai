Handling service account credentials (backend)

1) Never commit service account JSON files into the repository.

2) Development options:
   - Store the JSON file outside the repo and set GOOGLE_APPLICATION_CREDENTIALS to its path.
   - Or set the individual environment variables (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID) and use those at runtime.

3) Production options:
   - Use your cloud provider's secret manager (Azure Key Vault, AWS Secrets Manager, GCP Secret Manager).
   - CI/CD pipelines should inject secrets as environment variables.

4) Purging a leaked secret from git history:
   - Use BFG or git-filter-repo (see scripts/remove-secret-history.sh).
   - After rewrite, rotate the compromised service account immediately.

5) .env.example explains the variables expected; create a local `.env` from it.
