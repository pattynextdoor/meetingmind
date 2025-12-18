# Fireflies.ai Integration

MeetingMind offers **direct API integration** with Fireflies.ai for automatic transcript syncing.

## Option 1: API Sync (Recommended)

Automatically sync transcripts from your Fireflies.ai account.

### Setup

1. **Get your API key:**
   - Go to [app.fireflies.ai](https://app.fireflies.ai)
   - Navigate to **Integrations**
   - Click **Fireflies API**
   - Copy your API key

2. **Configure in MeetingMind:**
   - Open **Settings → MeetingMind → Sources**
   - Enable **Fireflies.ai sync**
   - Paste your API key
   - Click **Test Connection** to verify
   - Set your preferred sync interval

### Features

| Feature | Description |
|---------|-------------|
| **Auto-sync** | New transcripts sync automatically at your chosen interval |
| **Manual sync** | Click "Sync Now" anytime to fetch latest transcripts |
| **Full transcript** | Speaker labels, timestamps, and full text |
| **Participants** | Automatic participant extraction |

### Sync Intervals

| Interval | Best For |
|----------|----------|
| 5 minutes | Frequent meetings, real-time sync |
| 15 minutes | Most users (default) |
| 30 minutes | Occasional meetings |
| 60 minutes | Low-frequency sync |

## Option 2: Manual Export

If you prefer not to use API sync, you can export transcripts manually.

### Export Steps

1. **Go to [Fireflies.ai](https://app.fireflies.ai)** and sign in
2. **Open the meeting** you want to export
3. **Click the download icon** (or "Export" button)
4. **Choose a format:**
   - **TXT** - Simple transcript with speaker labels
   - **SRT** - Includes timestamps (recommended)
   - **JSON** - Full metadata
5. **Save to your watch folder**

## What Gets Imported

From Fireflies.ai, MeetingMind imports:

- Meeting title and date
- Duration
- All participants/speakers
- Full transcript with timestamps
- Speaker labels for each segment

## Tips

- **API sync** is the easiest option—set it and forget it
- **Reprocess anytime**: Use "MeetingMind: Reprocess current note" to add AI enrichment
- **Combine with AI**: Enable Pro features to get summaries on top of Fireflies transcripts
