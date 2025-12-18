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

### 3. Otter.ai Sync

Automatically sync transcripts from Otter.ai.

**Setup:**
1. Settings → MeetingMind → Sources
2. Enable "Otter.ai sync"
3. Click "Connect to Otter.ai"
4. Set sync interval

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

