# Fireflies.ai Support

Import transcripts from Fireflies.ai using their export feature.

## How It Works

Fireflies.ai automatically joins your meetings and creates transcripts. Export your transcripts and drop them in your watched folder for MeetingMind to process.

## Export Steps

1. **Go to [Fireflies.ai](https://app.fireflies.ai)** and sign in
2. **Open the meeting** you want to export
3. **Click the download icon** (or "Export" button)
4. **Choose a format:**
   - **TXT** - Simple transcript with speaker labels
   - **SRT** - Includes timestamps (recommended)
   - **JSON** - Full metadata
5. **Save to your watch folder**

MeetingMind will automatically import and process it within seconds.

## Supported Export Formats

| Format | Extension | Features |
|--------|-----------|----------|
| Text | `.txt` | Speaker labels, paragraphs |
| SRT | `.srt` | Timestamps, speaker labels |
| JSON | `.json` | Full metadata, action items |
| DOCX | `.docx` | Convert to TXT first |

## Tips

- **SRT format** works best for preserving timestamps
- **Batch export**: Download multiple meetings and drop them all at once
- **Action items**: Fireflies extracts action items—these appear in the JSON export
- **Reprocess**: Use "MeetingMind: Reprocess current note" to add AI enrichment later

## Fireflies.ai Features

Fireflies.ai includes its own AI features:
- Meeting summaries
- Action items
- Topic detection

MeetingMind can add value on top by:
- **Auto-linking** mentions to your Obsidian vault
- **Connecting participants** to people notes
- **Re-processing** with your preferred AI (Claude/GPT-4)
- **Dataview integration** for queries across all meetings

