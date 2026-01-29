#!/bin/bash

# Update otel-ui version across all project files
# Usage: ./scripts/update-version.sh 1.0.29

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "❌ Error: Version required"
  echo "Usage: ./scripts/update-version.sh 1.0.29"
  exit 1
fi

# Validate version format (semantic versioning)
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "❌ Error: Invalid version format. Use semantic versioning (e.g., 1.0.29)"
  exit 1
fi

echo "📝 Updating otel-ui to version $VERSION..."

# Update VERSION file
echo "$VERSION" > VERSION
echo "✓ Updated VERSION"

# Update package.json version
if [ -f "package.json" ]; then
  npm version "$VERSION" --no-git-tag-version > /dev/null 2>&1
  echo "✓ Updated package.json"
fi

# Update README.md deployment status
if [ -f "README.md" ]; then
  sed -i "s/Version [0-9]\+\.[0-9]\+\.[0-9]\+ deployed/Version $VERSION deployed/" README.md
  echo "✓ Updated README.md deployment status"
fi

# Update .env if it exists
if [ -f ".env" ]; then
  if grep -q "^VITE_APP_VERSION=" .env; then
    sed -i "s/^VITE_APP_VERSION=.*/VITE_APP_VERSION=$VERSION/" .env
    echo "✓ Updated .env"
  fi
fi

echo ""
echo "✅ Updated to version $VERSION"
echo ""
echo "Next steps:"
echo "1. Update k8s manifests: cd ../k8s-gitops/apps/base/otel-ui && ./update-version.sh $VERSION"
echo "2. Build Docker image: docker build -t stuartshay/otel-ui:$VERSION ."
echo "3. Commit changes: git add VERSION package.json README.md && git commit -m 'chore: Bump version to $VERSION'"
echo "4. Tag release: git tag v$VERSION && git push origin v$VERSION"
