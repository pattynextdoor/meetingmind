#!/bin/bash

# Reset demo vault to initial state
# Usage: ./reset-vault.sh /path/to/demo-vault

VAULT_PATH="${1:-$HOME/obsidian-demo-vault}"

echo "🧹 Resetting demo vault at: $VAULT_PATH"

# Check if vault exists
if [ ! -d "$VAULT_PATH" ]; then
  echo "Creating vault directory..."
  mkdir -p "$VAULT_PATH"
fi

# Remove generated folders (but keep .obsidian)
echo "Removing generated content..."
rm -rf "$VAULT_PATH/Meetings"
rm -rf "$VAULT_PATH/People"
rm -rf "$VAULT_PATH/Issues"
rm -rf "$VAULT_PATH/Topics"

# Copy initial vault state
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Copying initial vault state..."
cp -r "$SCRIPT_DIR/vault/"* "$VAULT_PATH/"

# Create empty People folder
mkdir -p "$VAULT_PATH/People"

echo "✅ Demo vault reset complete!"
echo ""
echo "Vault structure:"
echo "  $VAULT_PATH/"
echo "  ├── Platform Migration.md  (project stub)"
echo "  └── People/                (empty, will be populated)"
echo ""
echo "Demo transcripts available in:"
echo "  $SCRIPT_DIR/"
echo "  ├── 01-monday-standup.json"
echo "  ├── 02-architecture-review.json"
echo "  ├── 03-wednesday-standup.json"
echo "  └── 04-manager-1on1.json"
echo ""
echo "Ready for demo recording! 🎬"
