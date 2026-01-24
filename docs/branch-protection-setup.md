# Branch Protection Setup

This document describes how to configure GitHub branch protection rules for the otel-ui repository.

## Branch Strategy

- **main**: Protected production branch (requires PR)
- **develop**: Primary development branch (direct commits allowed)
- **feature/\***: Optional feature branches for large changes

## GitHub Branch Protection Configuration

### Step 1: Navigate to Settings

1. Go to https://github.com/stuartshay/otel-ui
2. Click **Settings** tab
3. Click **Branches** in left sidebar
4. Click **Add branch protection rule**

### Step 2: Configure Protection for `main`

**Branch name pattern**: `main`

**Required settings**:

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `0` (since you're solo developer)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ⬜ Require review from Code Owners (not needed for solo)
  - ⬜ Restrict who can dismiss pull request reviews (not needed)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - ✅ Status checks that are required:
    - `Build and Push / build` (from docker.yml workflow)
    - `Lint / lint` (if you have a lint workflow)

- ✅ **Require conversation resolution before merging**

- ⬜ **Require signed commits** (optional - recommended for security)

- ⬜ **Require linear history** (optional - keeps history clean)

- ⬜ **Require deployments to succeed** (not needed)

- ✅ **Lock branch** (optional - prevents any pushes)
  - ⬜ Leave unchecked to allow PR merges

- ✅ **Do not allow bypassing the above settings**
  - ⬜ Leave unchecked so you can force-push if absolutely needed

- ✅ **Restrict who can push to matching branches**
  - ⬜ Leave empty (no restrictions needed for solo dev)

- ✅ **Allow force pushes**
  - ⬜ Everyone (NOT recommended)
  - ⬜ Specify who can force push (NOT recommended)
  - ✅ Disabled (recommended - prevents accidental force pushes)

- ✅ **Allow deletions**
  - ⬜ Disabled (recommended - prevents accidental branch deletion)

### Step 3: Save Changes

Click **Create** or **Save changes** button at the bottom.

## Workflow After Configuration

### Making Changes

```bash
# Ensure you're on develop
git checkout develop
git pull origin develop

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: Add new feature"
git push origin develop
```

### Creating a Pull Request

**Via GitHub CLI** (recommended):

```bash
# Create PR from develop to main
gh pr create --base main --head develop --title "Release: Description" --body "Changes:
- Feature 1
- Fix 2
- Update 3"
```

**Via GitHub Web UI**:

1. Go to https://github.com/stuartshay/otel-ui
2. Click **Pull requests** tab
3. Click **New pull request**
4. Base: `main` ← Compare: `develop`
5. Click **Create pull request**
6. Add title and description
7. Click **Create pull request**

### Merging Pull Request

**Via GitHub CLI**:

```bash
# List PRs
gh pr list

# Merge PR (squash recommended for clean history)
gh pr merge <PR_NUMBER> --squash --delete-branch
```

**Via GitHub Web UI**:

1. Go to PR page
2. Wait for CI checks to pass (green checkmark)
3. Click **Squash and merge** (recommended) or **Merge pull request**
4. Confirm merge
5. Optionally delete `develop` branch (don't do this - keep develop!)

## CI/CD Pipeline

After merging PR to `main`:

1. GitHub Actions triggers `docker.yml` workflow
2. Version auto-generated: `1.0.<run_number>`
3. `update-version.sh` updates VERSION and package.json
4. Docker image built and pushed to Docker Hub
5. Tagged as `stuartshay/otel-ui:1.0.<run_number>` and `:latest`

## Updating Kubernetes Manifests

After successful Docker build:

```bash
# Get the new version number from GitHub Actions
VERSION="1.0.<run_number>"

# Update k8s manifests
cd ../k8s-gitops/apps/base/otel-ui
./update-version.sh $VERSION

# Commit and push
git add deployment.yaml
git commit -m "chore(otel-ui): Update to version $VERSION"
git push origin main

# Argo CD will auto-sync and deploy
```

## Emergency: Direct Push to Main

If you need to bypass protection (emergency fix):

1. **Temporarily disable branch protection**:
   - Settings → Branches → Edit rule
   - Uncheck "Do not allow bypassing"
   - Add yourself to "Restrict pushes"
   - Save changes

2. **Make emergency fix**:

   ```bash
   git checkout main
   git pull origin main
   # Make critical fix
   git add .
   git commit -m "hotfix: Critical issue"
   git push origin main
   ```

3. **Re-enable protection** immediately after

## Best Practices

1. **Always work on develop** - Never commit directly to main
2. **Small, frequent PRs** - Easier to review and safer to merge
3. **Descriptive PR titles** - Use conventional commits format
4. **Wait for CI** - Never merge with failing checks
5. **Squash merge** - Keeps main history clean
6. **Keep develop in sync** - After merging to main:

   ```bash
   git checkout develop
   git pull origin main
   git push origin develop
   ```

## Troubleshooting

### PR Blocked: "Review required"

- Check Settings → Branches → Edit rule
- Set "Require approvals" to `0` for solo development

### PR Blocked: "Status checks failing"

- Check GitHub Actions tab for errors
- Fix issues in develop branch
- Push fixes - PR will automatically update

### PR Blocked: "Branch is out of date"

```bash
git checkout develop
git pull origin main
git push origin develop
```

### Can't Push to Main

- Expected behavior - protection is working!
- Create PR instead

## Related Documentation

- [Enhancement Workflow Skill](../.github/skills/enhancement-workflow/SKILL.md)
- [Deployment Skill](../.github/skills/otel-ui-deployment/SKILL.md)
- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
