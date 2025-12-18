# Quick Start

Get your first meeting transcript imported in under 2 minutes.

## Step 1: Configure an Import Source

Choose one of these methods:

### Option A: Folder Watcher (Easiest)

1. Go to **Settings → MeetingMind → Sources**
2. Enable **Folder Watcher**
3. Set a **Watch Folder** (e.g., `Transcripts/Import`)
4. Create this folder in your vault

Now any `.vtt`, `.srt`, `.txt`, or `.json` file dropped here will auto-import.

### Option B: Manual Import

No setup needed! Use the command palette:

1. Press `Cmd/Ctrl + P`
2. Type "MeetingMind: Import file"
3. Select your transcript file

## Step 2: Import a Transcript

### Using Folder Watcher
1. Export a transcript from your meeting tool (Zoom, Otter, etc.)
2. Drop the file into your watch folder
3. The note appears in your output folder within seconds

### Using Manual Import
1. Press `Cmd/Ctrl + P`
2. Run "MeetingMind: Import file"
3. Select your transcript file
4. The note opens automatically

## Step 3: Review Your Note

Your imported meeting will have:

```markdown
---
date: 2024-12-18
duration: 45
participants:
  - "[[Sarah Chen]]"
  - "[[Marcus Webb]]"
source: vtt
---

## Transcript
> [!note]- Full transcript (click to expand)
> **Sarah Chen** (00:00): Let's get started...
```

## What's Next?

- [Configure auto-linking](/features/auto-linking) to connect mentions to existing notes
- [Set up AI enrichment](/pro/overview) for summaries and action items (Pro)
- [Enable participant notes](/features/participants) to track people across meetings

