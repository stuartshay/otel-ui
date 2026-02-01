# Version Management Workflow

## How Versioning Works

otel-ui uses **semantic versioning** with manual version control via the `VERSION` file.

### Version Format

```text
1.0.X
```

- **Major.Minor**: Currently `1.0` (changed for breaking changes)
- **Patch**: Incremented for each release (e.g., 82, 83, 84)

### Version Bump Process

**All version bumps happen in PRs before merging to main:**

1. **Create/checkout feature branch**:

   ```bash
   git checkout develop  # or create feature/my-feature
   ```

2. **Make your changes** (code, features, fixes)

3. **Bump the version** using the update script:

   ```bash
   # From repository root
   ./scripts/update-version.sh 1.0.X
   ```

   This updates:
   - `VERSION` file
   - `package.json` version field
   - `README.md` deployment status

4. **Commit version with your changes**:

   ```bash
   git add -A
   git commit -m "feat: Add awesome feature - bump to v1.0.X"
   git push origin HEAD  # pushes current branch (develop or feature/*)
   ```

5. **Create PR** to `main` on GitHub

6. **Merge PR** - GitHub Actions will:
   - Read version from `VERSION` file
   - Build Docker image with that version tag
   - Push to Docker Hub as `stuartshay/otel-ui:1.0.X`
   - Trigger k8s-gitops update (if configured)

## Important Rules

### ✅ DO

- **Bump version in your PR** before requesting merge
- Use the `update-version.sh` script (updates VERSION, package.json, README.md consistently)
- Follow semantic versioning (patch for fixes, minor for features)
- Test the build locally before pushing: `docker build -t otel-ui:test .`

### ❌ DON'T

- **Don't rely on auto-versioning** - we removed GitHub Actions auto-commit
- Don't manually edit version numbers (use the script)
- Don't skip version bumps for production changes
- Don't commit different versions in `VERSION`, `package.json`, and `README.md`

## Examples

### Feature Release (v1.0.82 → v1.0.83)

```bash
# On feature branch
git checkout develop
git pull origin develop

# Make changes...
vim src/components/NewFeature.tsx

# Bump version
./scripts/update-version.sh 1.0.83

# Commit everything
git add -A
git commit -m "feat: Add new feature - bump to v1.0.83"
git push origin HEAD

# Create PR on GitHub: develop → main
# After merge, GitHub Actions builds stuartshay/otel-ui:1.0.83
```

### Hotfix (v1.0.83 → v1.0.84)

```bash
# Create hotfix branch
git checkout main
git pull origin main
git checkout -b feature/critical-fix

# Fix the issue
vim src/services/api.ts

# Bump version
./scripts/update-version.sh 1.0.84

# Commit
git add -A
git commit -m "fix: Critical auth token bug - bump to v1.0.84"
git push origin feature/critical-fix

# Create PR on GitHub: feature/critical-fix → main
# After merge, GitHub Actions builds stuartshay/otel-ui:1.0.84
```

## Troubleshooting

### "Version mismatch between files"

Run the update script to sync all files:

```bash
./scripts/update-version.sh $(cat VERSION)
```

### "Docker tag not found after merge"

Check GitHub Actions workflow:

- Go to: https://github.com/stuartshay/otel-ui/actions
- Look for the "Build and Push Docker Image" workflow
- Check for errors in the build process

### "I forgot to bump the version"

Before merging:

```bash
# On your feature branch
./scripts/update-version.sh 1.0.X
git add VERSION package.json README.md
git commit -m "chore: Bump version to 1.0.X"
git push origin <your-branch>
```

After merging (requires new PR):

```bash
git checkout main
git pull origin main
git checkout -b fix/update-version

./scripts/update-version.sh 1.0.X
git add VERSION package.json README.md
git commit -m "chore: Update version to 1.0.X"
git push origin fix/update-version

# Create PR: fix/update-version → main
```

## CI/CD Pipeline

### Workflow: `.github/workflows/docker.yml`

**Triggers**:

- Push to `main` → Builds and pushes Docker image
- PR to `main` → Builds (but doesn't push)

**Steps**:

1. Checkout code
2. Read version from `VERSION` file
3. Install dependencies and build React app
4. Build multi-arch Docker image (amd64, arm64)
5. Push to Docker Hub (main branch only)
6. Trigger k8s-gitops update (main branch only)

**Key Variables**:

- `IMAGE_NAME`: `stuartshay/otel-ui`
- `version`: Read from `VERSION` file (no auto-generation)

## Related Files

- `VERSION` - Single source of truth for version number
- `package.json` - NPM package version (synced by script)
- `README.md` - Deployment status line (synced by script)
- `scripts/update-version.sh` - Version update script
- `.github/workflows/docker.yml` - CI/CD pipeline

## Version History

| Version | Date       | Description                            |
| ------- | ---------- | -------------------------------------- |
| 1.0.82  | 2026-02-01 | Prometheus metrics + branch protection |
| 1.0.81  | 2026-02-01 | Rollback after 1.1.0 failure           |
| 1.0.80  | 2026-01-29 | Production deployment                  |
