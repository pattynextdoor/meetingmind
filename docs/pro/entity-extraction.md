# Entity Extraction

Automatically extract and create notes for **issues**, **updates**, and **topics** mentioned in your meetings.

## What You Get

MeetingMind analyzes transcripts and identifies:

- **Issues**: Technical problems, blockers, bugs, or challenges
- **Updates**: Progress updates, milestones, status changes
- **Topics**: Important concepts, systems, initiatives, or recurring themes

Notes are automatically created in your configured folders and linked back to the meeting.

## How It Works

1. MeetingMind processes your transcript with AI
2. Extracts entities (issues, updates, topics) mentioned
3. Creates notes in `Issues/`, `Updates/`, or `Topics/` folders
4. Links entities back to the meeting note
5. Updates existing entity notes with new meeting references

## Configuration

**Settings → MeetingMind → Entity Extraction (Pro)**

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-extract entities | Master toggle for entity extraction | Off |
| Extract issues | Create notes for blockers and problems | On |
| Extract updates | Create notes for progress and milestones | On |
| Extract topics | Create notes for concepts and themes | On |
| Issues folder | Where issue notes are created | `Issues` |
| Updates folder | Where update notes are created | `Updates` |
| Topics folder | Where topic notes are created | `Topics` |

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
---

# OAuth Integration Blocker

## Description
Refresh token handling issue with Google API. Documentation says one thing, actual behavior is different.

## Status
blocked

## Related Meetings
- [[2025-01-15 Cadence App Launch Planning]] (2025-01-15)

## Notes
```

## Entity Note Structure

Each entity note includes:

- **Frontmatter**: Type, creation date
- **Description**: Context from the meeting
- **Status**: For issues/updates (in-progress, completed, blocked)
- **Related To**: Links to projects or topics mentioned
- **Related Meetings**: All meetings where this entity was discussed
- **Notes**: Your personal notes section

## Requirements

- **Pro license** (entity extraction requires AI)
- **AI Enrichment enabled** in settings
- **Valid API key** (Claude or OpenAI)

## Tips

- **Consistent naming**: The AI extracts based on how things are mentioned—consistent terminology helps
- **Review extracted entities**: Check that entities make sense and adjust folder paths if needed
- **Link to projects**: Entities automatically link to projects when mentioned (e.g., "OAuth blocker for Cadence")
- **Build your knowledge graph**: Over time, entity notes create a comprehensive map of issues, progress, and topics

## Benefits

- **Track blockers automatically**: Never lose track of issues mentioned in meetings
- **Document progress**: Updates become part of your knowledge base
- **Build topic index**: Important concepts get documented as they're discussed
- **Connect everything**: Entities link to meetings, projects, and people automatically

