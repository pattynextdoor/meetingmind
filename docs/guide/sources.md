# Import Sources

MeetingMind supports multiple ways to import transcripts.

## Folder Watcher

**Best for:** Manual exports, automation workflows

Drop transcript files into a watched folder for automatic import.

[Learn more →](/features/folder-watcher)

## Otter.ai Export

**Best for:** Otter.ai users

Export transcripts from Otter.ai and drop them in your watched folder.

[Learn more →](/features/otter-sync)

## Manual Import

**Best for:** One-off imports, testing

Import individual files via command palette.

1. Press `Cmd/Ctrl + P`
2. Run "MeetingMind: Import file"
3. Select your transcript

## Comparison

| Method | Auto-Import | Setup Required | Best For |
|--------|-------------|----------------|----------|
| Folder Watcher | ✅ | Minimal | Most users |
| Otter.ai Export | ✅* | Minimal | Otter.ai users |
| Manual Import | ❌ | None | One-off imports |

*Via folder watcher after export

## Supported Formats

All import methods support:

- `.vtt` — WebVTT (Zoom, Google Meet)
- `.srt` — SubRip subtitles
- `.txt` — Plain text
- `.json` — Otter.ai exports, structured data

