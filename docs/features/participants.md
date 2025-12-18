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

## Meeting History
- [[2024-12-18 Project Kickoff]]

## Notes
<!-- Add your notes about this person -->
```

## AI Participant Insights (Pro)

With Pro, participant notes also include AI-generated insights:

```markdown
## From Recent Meetings

### 2024-12-18 Project Kickoff
- **Role**: Technical Lead
- **Key Contributions**: Led API architecture discussion, proposed timeline
- **Action Items**: Draft technical spec, review dependencies
```

## Tips

- **Consistent naming**: Use the same name format in meetings for best linking
- **Add aliases**: If someone goes by multiple names, add aliases to their note
- **People folder**: Keep participant notes in a dedicated folder for organization

