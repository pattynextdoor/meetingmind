# Transcript Import

MeetingMind supports multiple transcript formats and import methods.

## Supported Formats

| Format | Extension | Sources |
|--------|-----------|---------|
| WebVTT | `.vtt` | Zoom, Google Meet, most video platforms |
| SubRip | `.srt` | Universal subtitle format |
| Plain Text | `.txt` | Manual transcriptions |
| JSON | `.json` | Otter.ai exports, custom formats |

## Import Methods

### 1. Folder Watcher

Automatically imports files dropped into a watched folder.

**Setup:**
1. Settings → MeetingMind → Sources
2. Enable "Folder watcher"
3. Set "Watch folder" path (relative to vault root)

**Usage:**
- Drop transcript files into the watch folder
- Files are processed within seconds
- Original files remain (not deleted)

### 2. Manual Import

Import individual files via command palette.

**Usage:**
1. `Cmd/Ctrl + P` → "MeetingMind: Import file"
2. Select file from your system
3. Note is created and opened

### 3. Otter.ai Export

Import transcripts exported from Otter.ai.

**Usage:**
1. Open your transcript in Otter.ai
2. Click the "..." menu → Export
3. Choose "Text" or "SRT" format
4. Save to your watched folder (or import manually)

MeetingMind will automatically process the export!

## Reprocessing Notes

Already imported a transcript but want to add AI enrichment or update links?

1. Open the meeting note
2. `Cmd/Ctrl + P` → "MeetingMind: Reprocess current note"

This re-runs AI enrichment and auto-linking with your current settings.

## Cleaning Up After Deleting Meetings

If you delete a meeting note from your Meetings folder, references to it will remain in:
- Participant notes (in the "Meetings" section)
- Entity notes (in the "Related Meetings" section)

To clean up these orphaned references:

1. `Cmd/Ctrl + P` → "MeetingMind: Cleanup orphaned references"

This command will:
- Scan all participant notes and remove references to deleted meetings
- Scan all entity notes (Issues, Updates, Topics) and remove references to deleted meetings
- Clean up empty sections if they become empty after cleanup

**Tip:** Run this command after deleting multiple meeting notes to keep your vault clean.

## Output

Imported transcripts are saved to your configured output folder with:

- Clean Markdown formatting
- YAML frontmatter (date, duration, participants, source)
- Speaker labels with timestamps
- Collapsible transcript section

## Deduplication

MeetingMind tracks imported transcripts by content hash. The same transcript won't be imported twice.

To re-import a transcript:
- Run "MeetingMind: Clear import history" command
- Or manually import (skips duplicate check)

