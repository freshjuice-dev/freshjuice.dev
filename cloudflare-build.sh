#!/bin/sh

# Exit on errors
set -e

# Define SSH key location
SSH_KEY_PATH="/tmp/cloudflare_pages_key"

echo "🚀 Starting Cloudflare Pages Build"
echo "==============================="

echo "🔑 Setting up SSH authentication..."
export GIT_SSH_COMMAND="ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no -o IdentitiesOnly=yes"

# Save the SSH private key from environment variable
echo "$CLOUDFLARE_SUBMODULE_SSH_KEY" > $SSH_KEY_PATH
chmod 600 $SSH_KEY_PATH

# Force a GitHub auth check to update "Last used" in key info
echo "🔍 Verifying GitHub SSH authentication..."
ssh -T git@github.com || true
echo "=============================="

# Initialize and update submodules
echo "📦 Updating Git submodules..."
git submodule update --init --recursive
git submodule update --remote --merge
echo "=============================="

# Build the project
echo "🏗️ Running the build process..."
npm run build

echo "✅ Build completed successfully!"
