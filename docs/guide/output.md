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

### Meeting Notes

Every meeting note includes:

**Frontmatter:**
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

**Content:**
- Summary (Pro)
- Action Items (Pro)
- Decisions (Pro)
- Full transcript (collapsible)
- Suggested links (if any)

### Participant Notes (Pro)

When "Auto-create participant notes" is enabled:

```markdown
---
type: person
created: 2024-12-18
---

# Sarah Chen

**Role**: Engineering Lead

## About


## Top of Mind

*Recent active items and current focus*

### Owns
- [[Payment flow]] — *active topic*
- 🔄 OAuth integration — *in-progress 2024-12-15* (from [[Monday Standup]])

### Active Action Items
- [ ] Draft technical spec — from [[Project Kickoff]]

### Recent Wins
- ✅ Completed API architecture — from [[Project Kickoff]]

## Raised Issues
- [[Database timeout issue]]

## Meetings

### [[2024-12-18 Project Kickoff]] (2024-12-18)

**Key Contributions:**
- Led API architecture discussion

*Engaged and collaborative*

## Archive

*Completed items and older meetings*

## Notes

```

### Entity Notes (Pro)

When "Auto-extract entities" is enabled:

**Issue Note:**
```markdown
---
type: issue
created: 2024-12-18
status: blocked
---

# Database Timeout Issue

## Description

Connection timeouts occurring under load.

**Raised by**: [[Sarah Chen]]

## Status

blocked

## Related Meetings
- [[2024-12-18 Project Kickoff]] (2024-12-18)

## Notes

```

**Topic Note:**
```markdown
---
type: topic
created: 2024-12-18
category: technical
---

# Payment Flow

## Description

Payment processing flow for the application.

**Owner**: [[Sarah Chen]]

## Related Meetings
- [[2024-12-18 Project Kickoff]] (2024-12-18)

## Notes

```

## Dataview Compatibility

The frontmatter is designed for Dataview queries:

```dataview
TABLE participants, date
FROM "Meetings"
WHERE date >= date(today) - dur(7 days)
SORT date DESC
```

