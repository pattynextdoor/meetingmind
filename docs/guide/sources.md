# Import Sources

MeetingMind supports multiple ways to import transcripts.

## Fireflies.ai Sync ⭐

**Best for:** Fireflies.ai users who want automatic sync

Direct API integration syncs your transcripts automatically.

[Learn more →](/features/fireflies)

## Folder Watcher

**Best for:** Manual exports, automation workflows

Drop transcript files into a watched folder for automatic import.

[Learn more →](/features/folder-watcher)

## Otter.ai Export

**Best for:** Otter.ai users

Export transcripts from Otter.ai and drop them in your watched folder.

[Learn more →](/features/otter-sync)

## Fireflies.ai Export

**Best for:** Fireflies.ai users

Export transcripts from Fireflies.ai and drop them in your watched folder.

[Learn more →](/features/fireflies)

## Fathom Export

**Best for:** Fathom users

Export transcripts from Fathom and drop them in your watched folder.

[Learn more →](/features/fathom)

## Manual Import

**Best for:** One-off imports, testing

Import individual files via command palette.

1. Press `Cmd/Ctrl + P`
2. Run "MeetingMind: Import file"
3. Select your transcript

## Comparison

| Method | Auto-Import | Setup Required | Best For |
|--------|-------------|----------------|----------|
| Fireflies.ai Sync | ✅ | API key | Fireflies.ai users |
| Folder Watcher | ✅ | Minimal | Most users |
| Otter.ai Export | ✅* | Minimal | Otter.ai users |
| Fathom Export | ✅* | Minimal | Fathom users |
| Manual Import | ❌ | None | One-off imports |

*Via folder watcher after export

## Supported Formats

All import methods support:

- `.vtt` — WebVTT (Zoom, Google Meet)
- `.srt` — SubRip subtitles
- `.txt` — Plain text
- `.json` — Otter.ai exports, structured data

