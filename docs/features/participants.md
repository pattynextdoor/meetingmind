# Participant Notes

MeetingMind can automatically create and update notes for people mentioned in your meetings.

## How It Works

When a transcript is imported:
1. MeetingMind extracts participant names
2. Checks if a note exists for each person
3. Creates missing notes in your People folder
4. Updates existing notes with meeting references

## Configuration

**Settings → MeetingMind → Participants**

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-create participant notes | Create notes for new participants | Off |
| People folder | Where participant notes are created | People |
| Update existing notes | Add meeting links to existing notes | On |

## Created Note Structure

```markdown
---
type: person
created: 2024-12-18
---

# Sarah Chen

**Role**: Technical Lead

## About


## Top of Mind

*Recent active items and current focus*

### Active Action Items
- [ ] Draft technical spec — from [[2024-12-18 Project Kickoff]]

### Recent Wins
- ✅ Completed API architecture proposal — from [[2024-12-18 Project Kickoff]]

## Meetings

### [[2024-12-18 Project Kickoff]] (2024-12-18)

**Key Contributions:**
- Led API architecture discussion
- Proposed project timeline

## Archive

*Completed items and older meetings*

## Notes

```

## AI Participant Insights (Pro)

With Pro, participant notes include rich AI-generated insights and automatic linking to related work:

```markdown
## Top of Mind

*Recent active items and current focus*

### Owns
- [[Payment flow]] — *active topic*
- 🔄 OAuth integration — *in-progress 2024-12-15* (from [[Monday Standup]])

### Active Action Items
- [ ] Review API dependencies (due: 2024-12-20) — from [[Project Kickoff]]

### Recent Wins
- ✅ Completed architecture proposal — from [[Project Kickoff]]

## Raised Issues
- [[Stripe webhook issue]]
- [[Database connection timeout]]

## Meetings

### [[2024-12-18 Project Kickoff]] (2024-12-18)

**Key Contributions:**
- Led API architecture discussion
- Proposed project timeline

*Engaged and collaborative*
```

### What Gets Linked

**Owns Section:**
- **Topics**: Wiki-links to topic notes the person leads (e.g., `[[Payment flow]]`)
- **Updates**: Plain text with status emoji and date (not separate notes)
  - 🔄 = in-progress
  - ✅ = completed
  - 🚫 = blocked

**Raised Issues Section:**
- Wiki-links to issue notes the person raised
- Issues automatically link back using `**Raised by**: [[Person Name]]`

**Benefits:**
- See what someone owns at a glance
- Track issues they've raised across meetings
- Obsidian's backlinks panel shows all mentions automatically
- Completed items stay visible (never auto-archived)

## Tips

- **Consistent naming**: Use the same name format in meetings for best linking
- **Add aliases**: If someone goes by multiple names, add aliases to their note
- **People folder**: Keep participant notes in a dedicated folder for organization

