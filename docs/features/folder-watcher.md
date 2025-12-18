# Folder Watcher

Automatically import transcripts dropped into a watched folder.

## Setup

1. **Settings → MeetingMind → Sources**
2. Enable **Folder watcher**
3. Set **Watch folder** path (relative to vault root)

Example: `Transcripts/Import`

## Usage

1. Export a transcript from your meeting tool
2. Drop the file into your watch folder
3. MeetingMind detects it and creates a note

## Supported Files

- `.vtt` — WebVTT subtitles
- `.srt` — SubRip subtitles  
- `.txt` — Plain text transcripts
- `.json` — Otter.ai and structured exports

## Behavior

- Files are processed within a few seconds
- Original files are **not deleted** (you can set up auto-cleanup separately)
- Duplicate files are skipped (based on content hash)

## Tips

- Create a **shortcut** to your watch folder on your desktop
- Set up **Hazel/automation** to auto-move exports to the watch folder
- Use **subfolders** if you want to organize by source

