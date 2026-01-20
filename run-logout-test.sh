#!/bin/bash
# Run logout flow test

set -e

# Load credentials from .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check credentials
if [ -z "$COGNITO_TEST_USERNAME" ] || [ -z "$COGNITO_TEST_PASSWORD" ]; then
  echo "❌ Error: COGNITO_TEST_USERNAME and COGNITO_TEST_PASSWORD must be set"
  echo "Create a .env file with:"
  echo "COGNITO_TEST_USERNAME=your-username"
  echo "COGNITO_TEST_PASSWORD=your-password"
  exit 1
fi

echo "Running logout flow test..."
echo "Username: $COGNITO_TEST_USERNAME"
echo ""

# Run the logout test
npx playwright test logout.spec.ts
