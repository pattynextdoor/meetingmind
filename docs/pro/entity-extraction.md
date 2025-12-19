# Entity Extraction

Automatically extract and create notes for **issues** and **topics** mentioned in your meetings. **Updates** are tracked on participant notes.

## What You Get

MeetingMind analyzes transcripts and identifies:

- **Issues**: Technical problems, blockers, bugs, or challenges → Creates separate notes
- **Topics**: Important concepts, systems, initiatives, or recurring themes → Creates separate notes
- **Updates**: Progress updates, milestones, status changes → Tracked on participant notes (no separate notes)

Entity notes are automatically created in your configured folders and linked to people and meetings.

## How It Works

1. MeetingMind processes your transcript with AI
2. Extracts entities (issues, topics, updates) mentioned
3. **Creates notes** for issues and topics in `Issues/` and `Topics/` folders
4. **Enriches participant notes** with updates they own
5. **Links entities** to people who raised/own them
6. Updates existing entity notes with new meeting references
7. **Auto-archives** resolved issues after 30 days (configurable)

## Configuration

**Settings → MeetingMind → Entity Extraction (Pro)**

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-extract entities | Master toggle for entity extraction | Off |
| Extract issues | Create notes for blockers and problems | On |
| Extract updates | Extract updates for participant notes | On |
| Extract topics | Create notes for concepts and themes | On |
| Issues folder | Where issue notes are created | `Issues` |
| Topics folder | Where topic notes are created | `Topics` |
| Issue archive days | Days before archiving resolved issues | 30 |

**Note**: The "Updates folder" setting is deprecated. Updates are now tracked on participant notes instead of separate files.

## Example

**Meeting mentions:**
> "The OAuth integration is blocked. The refresh token handling isn't working with Google's API."

**Creates:**
- `Issues/OAuth Integration Blocker.md`

**Note content:**
```markdown
---
type: issue
created: 2025-01-15
status: blocked
---

# OAuth Integration Blocker

## Description
Refresh token handling issue with Google API. Documentation says one thing, actual behavior is different.

**Raised by**: [[Chris Park]]

## Status
blocked

## Related Meetings
- [[2025-01-15 Cadence App Launch Planning]] (2025-01-15)

## Notes
```

## Entity Note Structure

### Issue Notes

- **Frontmatter**: Type, creation date, status, resolved_date
- **Description**: Context from the meeting
- **Raised by**: Wiki-link to the person who raised it
- **Status**: Current status (in-progress, blocked, resolved)
- **Related Meetings**: All meetings where this issue was discussed
- **Notes**: Your personal notes section

### Topic Notes

- **Frontmatter**: Type, creation date, category
- **Description**: What this topic is about
- **Owner**: Wiki-link to the person who leads/owns it
- **Related Meetings**: All meetings where this topic was discussed
- **Notes**: Your personal notes section

### Updates (No Separate Notes)

Updates are tracked on participant notes in the "Owns" section:
- `🔄 OAuth integration — *in-progress 2024-12-15* (from [[Monday Standup]])`
- Includes status emoji, name, status, date, and source meeting
- Stays on the person's note permanently for historical record

## Requirements

- **Pro license** (entity extraction requires AI)
- **AI Enrichment enabled** in settings
- **Valid API key** (Claude or OpenAI)

## Auto-Archive (NEW)

Resolved issues are automatically archived to keep your workspace clean:

- **When**: After 30 days of being marked "resolved" (configurable)
- **Where**: Moved to `Issues/Archive/YYYY-MM/` (organized by month)
- **Links**: Automatically updated in participant notes and other references
- **Manual trigger**: Run `MeetingMind: Archive resolved issues` from command palette

**Example:**
- Issue resolved on 2024-12-15
- After 30 days (2025-01-14), automatically moved to `Issues/Archive/2024-12/`
- All links updated: `[[Archive/Issues/2024-12/Issue name|Issue name]]`

## Linking to People

Entities automatically link to the people involved:

- **Issues**: `**Raised by**: [[Person Name]]` creates bidirectional link
- **Topics**: `**Owner**: [[Person Name]]` shows who leads it
- **Participant notes**: Include "Raised Issues" and "Owns" sections with reverse links

This creates a rich knowledge graph in Obsidian's graph view.

## Tips

- **Consistent naming**: The AI extracts based on how things are mentioned—consistent terminology helps
- **Review extracted entities**: Check that entities make sense and adjust folder paths if needed
- **Use the graph view**: Visualize relationships between people, issues, and topics
- **Archive regularly**: Run the archive command periodically to keep your Issues folder clean
- **Build your knowledge graph**: Over time, entity notes create a comprehensive map of issues and topics

## Benefits

- **Track blockers automatically**: Never lose track of issues mentioned in meetings
- **Document progress**: Updates tracked on participant notes for accountability
- **Build topic index**: Important concepts get documented as they're discussed
- **Connect everything**: Entities link to meetings and people automatically
- **Clean workspace**: Auto-archive keeps resolved issues organized
- **Accountability**: See who raised issues and who owns topics

