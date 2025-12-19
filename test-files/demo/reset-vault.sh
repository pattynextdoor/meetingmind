#!/bin/bash

# MeetingMind Demo Vault Reset Script
# Resets the Cadence vault to a clean state for demo recording

VAULT_PATH="/Users/patty/Obsidian/Cadence"
PLUGIN_DATA="$VAULT_PATH/.obsidian/plugins/meetingmind/data.json"

echo "🧹 Resetting Cadence vault for demo..."
echo ""

# Remove all meeting notes
echo "Cleaning Meetings folder..."
rm -f "$VAULT_PATH/Meetings"/*.md 2>/dev/null
echo "  ✓ Meetings cleared"

# Remove all entity notes
echo "Cleaning entity folders..."
rm -f "$VAULT_PATH/Issues"/*.md 2>/dev/null
rm -f "$VAULT_PATH/Updates"/*.md 2>/dev/null
rm -f "$VAULT_PATH/Topics"/*.md 2>/dev/null
echo "  ✓ Issues cleared"
echo "  ✓ Updates cleared"
echo "  ✓ Topics cleared"

# Reset People notes to original state
echo "Resetting People notes..."
cat > "$VAULT_PATH/People/Maya Rodriguez.md" << 'EOF'
# Maya Rodriguez

**Role**: Product Lead

## About
- Runs product for [[Cadence]]
- Previously at Stripe and Notion
- Great at keeping projects on track

## Working Style
- Likes structured meetings with clear outcomes
- Big on documentation
- Prefers async communication when possible

## Top of Mind

*Recent active items and current focus*

## Archive

*Completed items and older meetings*

## Notes

EOF

cat > "$VAULT_PATH/People/Chris Park.md" << 'EOF'
# Chris Park

**Role**: Lead Developer

## About
- Full-stack, leans mobile (React Native)
- Handles iOS and Android builds for [[Cadence]]
- Fast executor, good at estimating timelines

## Tech Stack
- React Native, TypeScript
- Node.js backend
- Firebase, PostgreSQL

## Top of Mind

*Recent active items and current focus*

## Archive

*Completed items and older meetings*

## Notes

EOF

cat > "$VAULT_PATH/People/Aisha Patel.md" << 'EOF'
# Aisha Patel

**Role**: Product Designer

## About
- Owns design for [[Cadence]]
- Background in UX research
- Strong advocate for user onboarding

## Tools
- Figma
- Principle for prototyping
- Maze for user testing

## Top of Mind

*Recent active items and current focus*

## Archive

*Completed items and older meetings*

## Notes

EOF

cat > "$VAULT_PATH/People/Derek Nguyen.md" << 'EOF'
# Derek Nguyen

**Role**: Marketing Lead

## About
- Growth marketing for [[Cadence]]
- Runs paid ads, influencer outreach, content
- Data-driven, always testing

## Channels
- Instagram/TikTok ads
- Newsletter sponsorships  
- Tech YouTuber partnerships

## Top of Mind

*Recent active items and current focus*

## Archive

*Completed items and older meetings*

## Notes

EOF

echo "  ✓ Maya Rodriguez.md reset"
echo "  ✓ Chris Park.md reset"
echo "  ✓ Aisha Patel.md reset"
echo "  ✓ Derek Nguyen.md reset"

# Clear processed hashes so transcript can be re-imported
if [ -f "$PLUGIN_DATA" ]; then
    echo "Clearing import history..."
    # Use Python to safely update JSON
    python3 << 'PYEOF'
import json
import sys

data_file = "/Users/patty/Obsidian/Cadence/.obsidian/plugins/meetingmind/data.json"

try:
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    # Clear processed hashes
    data['processedHashes'] = []
    
    with open(data_file, 'w') as f:
        json.dump(data, f, indent=4)
    
    print("  ✓ Import history cleared (can re-import same transcript)")
except Exception as e:
    print(f"  ⚠ Could not clear import history: {e}")
PYEOF
else
    echo "  ⚠ Plugin data file not found (may not be installed)"
fi

echo ""
echo "✅ Vault reset complete!"
echo ""
echo "Current state:"
echo "  • Meetings/: Empty"
echo "  • Issues/: Empty"
echo "  • Updates/: Empty"
echo "  • Topics/: Empty"
echo "  • People/: Reset to original"
echo "  • Import history: Cleared"
echo ""
echo "Ready for demo recording! 🎬"

