# Auto-Linking

MeetingMind automatically creates `[[wiki-links]]` to existing notes mentioned in your transcripts.

## How It Works

1. **Vault Indexing**: MeetingMind builds an index of all notes in your vault
2. **Term Matching**: Transcript text is scanned for matching terms
3. **Link Creation**: Matches are converted to `[[wiki-links]]`

## What Gets Indexed

- **Note titles**: `Project Phoenix.md` → matches "Project Phoenix"
- **Explicit aliases**: Defined in frontmatter `aliases: [Phoenix, PP]`
- **Implicit aliases**: Generated from multi-word titles ("Sarah" from "Sarah Chen")

## Example

**Before:**
```
We discussed the enrollment API with Sarah and Marcus.
```

**After:**
```
We discussed the [[Enrollment API]] with [[Sarah Chen|Sarah]] and [[Marcus Webb|Marcus]].
```

## Configuration

### Settings → MeetingMind → Auto-Linking

| Setting | Description | Default |
|---------|-------------|---------|
| Enable auto-linking | Master toggle | On |
| Generate implicit aliases | Create aliases from multi-word titles | On |
| Maximum matches | Skip linking if term matches too many notes | 3 |
| Exclude folders | Folders to ignore (comma-separated) | templates |

## Disambiguation

When a term matches multiple notes, MeetingMind:

1. **Skips auto-linking** for that term
2. **Adds to suggested links** section at the bottom of the note

Example:
```markdown
## Suggested Links
- "API" could link to: [[Enrollment API]], [[Payments API]], [[API Guidelines]]
```

## Rebuilding the Index

The vault index updates automatically when notes change. To force a rebuild:

1. `Cmd/Ctrl + P`
2. Run "MeetingMind: Rebuild vault index"

## Cleaning Up Orphaned References

If you delete meeting notes, you may want to clean up references to them in participant and entity notes:

1. `Cmd/Ctrl + P`
2. Run "MeetingMind: Cleanup orphaned references"

This removes broken links from participant notes and entity notes, keeping your vault clean.

## Tips

- **Add aliases** to frequently-mentioned notes for better matching
- **Use consistent naming** for people and projects
- **Exclude template folders** to avoid false matches

