# Entity Extraction Testing Guide

## Test Transcript

Use `transcript-with-entities.json` to test entity extraction. This transcript contains:

### Expected Entities

**Issues:**
- OAuth Integration Blocker (mentioned by Chris Park)
  - Description: Refresh token handling issue with Google API
  - Status: Blocked

**Updates:**
- Notification System (completed)
  - Description: Push notifications working on iOS and Android
  - Status: Completed
  - Related To: Cadence

- Onboarding Flow (in progress)
  - Description: About 90% complete
  - Status: In-progress
  - Related To: Cadence

- Tutorial Overlay (planned)
  - Description: Quick tutorial for first-time users
  - Status: In-progress
  - Related To: Cadence

- Landing Page (completed)
  - Description: Landing page is live with 400 waitlist signups
  - Status: Completed
  - Related To: Cadence

**Topics:**
- Freemium Pricing Model
  - Description: Pricing strategy discussion
  - Category: Product

- Press Kit
  - Description: Marketing materials for reviewers
  - Category: Marketing

- App Store Submission
  - Description: Process for submitting to app stores
  - Category: Process

## Testing Steps

### 1. Setup

1. Open Obsidian with your Cadence vault
2. Go to **Settings → MeetingMind**
3. Enable **AI Enrichment** (requires Pro license)
4. Enter your API key (Claude or OpenAI)
5. Scroll to **Entity Extraction** section (if UI exists, otherwise it's in code)
6. Enable **Auto-extract entities**
7. Verify folder paths:
   - Issues folder: `Issues`
   - Updates folder: `Updates`
   - Topics folder: `Topics`

### 2. Import Transcript

1. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
2. Type "MeetingMind: Import file"
3. Select `test-files/demo/transcript-with-entities.json`

### 3. Expected Results

**Meeting Note:**
- Should be created in `Meetings/` folder
- Should have AI summary, action items, decisions
- Should link to `[[Cadence]]` project
- Should link to participant notes

**Entity Notes Created:**
- `Issues/OAuth Integration Blocker.md`
- `Updates/Notification System.md`
- `Updates/Onboarding Flow.md`
- `Updates/Tutorial Overlay.md`
- `Updates/Landing Page.md`
- `Topics/Freemium Pricing Model.md`
- `Topics/Press Kit.md`
- `Topics/App Store Submission.md`

**Entity Note Structure:**
Each entity note should have:
```markdown
---
type: issue|update|topic
created: 2025-01-15
---

# Entity Name

## Description
[Description from transcript]

## Status (for issues/updates)
[in-progress|completed|blocked]

## Related To (if mentioned)
[[Cadence]]

## Related Meetings
- [[2025-01-15 Cadence App Launch Planning]] (2025-01-15)

## Notes
```

### 4. Verify Links

1. Open the meeting note
2. Check that entity names are mentioned (may or may not be auto-linked yet)
3. Open an entity note (e.g., `Issues/OAuth Integration Blocker.md`)
4. Verify it links back to the meeting note
5. Check that `Related To` links to `[[Cadence]]` if applicable

### 5. Test Updates

1. Import the same transcript again (should skip duplicate)
2. Or import a different transcript mentioning the same entity
3. Verify the entity note gets updated with new meeting reference
4. Check that duplicate meeting references aren't added

### 6. Test Settings

1. Disable entity extraction in settings
2. Import a new transcript
3. Verify no entity notes are created
4. Re-enable and verify it works again

## Troubleshooting

### No entities extracted?

- Check that AI enrichment is enabled
- Check that Pro license is active
- Check that `autoExtractEntities` setting is true
- Check console for errors: `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows)
- Verify API key is valid

### Entity notes not created?

- Check that folders are being created (`Issues/`, `Updates/`, `Topics/`)
- Check console for errors
- Verify entity extraction returned results (check console logs)

### Wrong entities extracted?

- The AI might interpret things differently
- Check the AI prompt in `AIService.ts` if needed
- Adjust the prompt if entities are too vague or too specific

## Console Logs to Watch For

```
MeetingMind: Extracting entities...
MeetingMind: Extracted 3 issues, 4 updates, 3 topics
MeetingMind: Created issue note for OAuth Integration Blocker
MeetingMind: Created update note for Notification System
...
```

## Manual Testing Checklist

- [ ] Entity extraction enabled in settings
- [ ] AI enrichment working
- [ ] Transcript imports successfully
- [ ] Entity notes created in correct folders
- [ ] Entity notes have correct frontmatter
- [ ] Entity notes link back to meeting
- [ ] Meeting links to entities (if auto-linking works)
- [ ] Duplicate entities don't create duplicate notes
- [ ] Existing entity notes get updated with new meetings
- [ ] Status fields work correctly for updates/issues
- [ ] Related To links work correctly

