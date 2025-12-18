# Output Options

Control where and how MeetingMind saves your meeting notes.

## Destination Folder

**Settings → MeetingMind → Output → Destination folder**

Default: `Meetings`

All imported meeting notes are saved to this folder.

## Filename Template

**Settings → MeetingMind → Output → Filename template**

Default: `YYYY-MM-DD Title`

### Available Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `YYYY` | 2024 | Full year |
| `MM` | 12 | Month (zero-padded) |
| `DD` | 18 | Day (zero-padded) |
| `Title` | Weekly Sync | Meeting title |

### Examples

| Template | Result |
|----------|--------|
| `YYYY-MM-DD Title` | `2024-12-18 Weekly Sync.md` |
| `Title - YYYY-MM-DD` | `Weekly Sync - 2024-12-18.md` |
| `Meetings/YYYY/MM/Title` | `Meetings/2024/12/Weekly Sync.md` |

## Note Structure

Every meeting note includes:

### Frontmatter
```yaml
---
date: 2024-12-18
duration: 45
participants:
  - "[[Sarah Chen]]"
  - "[[Marcus Webb]]"
source: vtt
tags: []
---
```

### Content
- Summary (Pro)
- Action Items (Pro)
- Decisions (Pro)
- Full transcript (collapsible)
- Suggested links (if any)

## Dataview Compatibility

The frontmatter is designed for Dataview queries:

```dataview
TABLE participants, date
FROM "Meetings"
WHERE date >= date(today) - dur(7 days)
SORT date DESC
```

