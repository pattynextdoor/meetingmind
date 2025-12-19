# AI Participant Insights

Get AI-generated insights for each meeting participant, automatically linked to their work.

## What You Get

Participant notes include rich, structured insights with automatic linking:

```markdown
# Maya Rodriguez

**Role**: Engineering Lead

## Top of Mind

*Recent active items and current focus*

### Owns
- [[Payment flow]] — *active topic*
- 🔄 OAuth integration — *in-progress 2024-12-15* (from [[Monday Standup]])

### Active Action Items
- [ ] Draft technical spec (due: 2024-12-20) — from [[Project Kickoff]]
- [ ] Coordinate with platform team — from [[Project Kickoff]]

### Recent Wins
- ✅ Completed API architecture proposal — from [[Project Kickoff]]

## Raised Issues
- [[Database connection timeout]]
- [[Stripe webhook issue]]

## Meetings

### [[2024-12-18 Project Kickoff]] (2024-12-18)

**Key Contributions:**
- Led API architecture discussion
- Proposed phased rollout approach

*Engaged, solution-oriented*
```

## How It Works

1. **Analyzes contributions**: MeetingMind examines what each person says and does
2. **Identifies ownership**: Determines what topics and updates they own
3. **Tracks issues**: Notes which issues they raise
4. **Creates links**: Automatically links to related entity notes (topics, issues)
5. **Enriches notes**: Adds structured insights to participant notes

## Entity Linking (NEW)

Participant insights now automatically connect people to their work:

### Owns Section
- **Topics they lead**: Linked to topic notes (e.g., `[[Payment flow]]`)
- **Updates they own**: Tracked with status and date
  - 🔄 = in-progress
  - ✅ = completed  
  - 🚫 = blocked

### Raised Issues Section
- **Issues they raised**: Linked to issue notes
- **Bidirectional linking**: Issue notes link back with `**Raised by**: [[Person]]`

### Benefits of Entity Linking
- **See ownership at a glance**: Know who owns what
- **Track accountability**: Issues are connected to who raised them
- **Obsidian graph view**: Visualize relationships between people and work
- **Backlinks panel**: See all mentions automatically

## Requirements

- Pro license
- "Auto-create participant notes" enabled
- AI Enrichment enabled
- Entity Extraction enabled (for Owns/Raised Issues sections)

## Configuration

Participant insights are automatically included when:
- **Settings → Participants → Auto-create participant notes** is ON
- **Settings → AI Enrichment** is enabled
- **Settings → Entity Extraction** is enabled (for entity linking)

## Benefits

- **Track contributions**: See what each person brings to meetings
- **Context for 1:1s**: Review someone's recent meeting activity and current focus
- **Team dynamics**: Understand who drives decisions and owns initiatives
- **Accountability**: Track who raised issues and who owns topics
- **Knowledge graph**: Build a network of people, topics, and issues

