# Quick Entity Extraction Test

## Before Testing

Since the Settings UI isn't built yet, you need to enable entity extraction manually:

### Option 1: Edit Settings File Directly

1. Open Obsidian
2. Go to your vault folder: `/Users/patty/Obsidian/Cadence/.obsidian/`
3. Open `plugins/meetingmind/data.json`
4. Add/update these settings:
```json
{
  "autoExtractEntities": true,
  "entityIssuesFolder": "Issues",
  "entityUpdatesFolder": "Updates",
  "entityTopicsFolder": "Topics",
  "enableIssueExtraction": true,
  "enableUpdateExtraction": true,
  "enableTopicExtraction": true
}
```
5. Reload Obsidian (or restart)

### Option 2: Temporarily Change Default

Edit `src/types.ts` line 164:
```typescript
autoExtractEntities: true,  // Change from false to true
```

Then rebuild:
```bash
node esbuild.config.mjs production
cp main.js manifest.json styles.css /Users/patty/Obsidian/Cadence/.obsidian/plugins/meetingmind/
```

## Test Steps

1. **Enable AI Enrichment** (Settings → MeetingMind → AI Enrichment)
   - Enable AI enrichment
   - Enter your API key
   - Activate Pro license (`TEST-PRO`)

2. **Import Test Transcript**
   - `Cmd+P` → "MeetingMind: Import file"
   - Select: `test-files/demo/transcript-with-entities.json`

3. **Check Results**
   - Meeting note created in `Meetings/`
   - Entity notes created in:
     - `Issues/OAuth Integration Blocker.md`
     - `Updates/Notification System.md`
     - `Updates/Onboarding Flow.md`
     - `Updates/Tutorial Overlay.md`
     - `Updates/Landing Page.md`
     - `Topics/Freemium Pricing Model.md`
     - `Topics/Press Kit.md`
     - `Topics/App Store Submission.md`

4. **Verify**
   - Open an entity note
   - Check it links back to the meeting
   - Check frontmatter has `type: issue|update|topic`

## Console Logs

Open Developer Console (`Cmd+Option+I` on Mac) to see:
```
MeetingMind: Extracting entities...
MeetingMind: Created issue note for OAuth Integration Blocker
MeetingMind: Created update note for Notification System
...
```

## Expected Entities

The AI should extract:
- **1 Issue**: OAuth Integration Blocker
- **4 Updates**: Notification System, Onboarding Flow, Tutorial Overlay, Landing Page
- **3 Topics**: Freemium Pricing Model, Press Kit, App Store Submission

Note: The AI might extract slightly different entities based on interpretation. That's okay—the important thing is that it's creating notes and linking them.

