# Zoom Transcript Import

MeetingMind supports Zoom transcripts in both `.vtt` and `.txt` formats. How you get the transcript depends on your Zoom plan.

## Free Plan (Basic)

Zoom's free plan doesn't include cloud recordings or automatic transcription, but you can still get transcripts using live captions.

### Enable Live Captions

1. Sign in to the [Zoom web portal](https://zoom.us/signin)
2. Go to **Settings → Meeting → In Meeting (Advanced)**
3. Enable **Automated captions**
4. Optionally enable **Save captions** to let participants save the transcript

### Save Transcript During a Meeting

1. Start or join a meeting on the **desktop app**
2. Click **Show Captions** (or **CC**) in the toolbar
3. Click the **^** arrow next to the captions button
4. Select **View full transcript** to open the transcript panel
5. At the bottom of the transcript panel, click **Save Transcript**
6. Zoom saves a `.txt` file to your local machine (typically in the meeting's recording folder under `Documents/Zoom`)

::: tip Where's the file?
The saved transcript is usually at:
- **Mac:** `~/Documents/Zoom/[Meeting Name]/[date]/`
- **Windows:** `Documents\Zoom\[Meeting Name]\[date]\`

Look for a file ending in `.txt`.
:::

### Import into MeetingMind

**Option A: Folder watcher (recommended)**
1. Set up a [folder watcher](/features/folder-watcher) pointed at a folder in your vault
2. Copy the `.txt` file into your watched folder
3. MeetingMind imports it automatically

**Option B: Manual import**
1. Press `Cmd/Ctrl + P`
2. Run **MeetingMind: Import file**
3. Select the `.txt` transcript file

---

## Paid Plans (Pro / Business / Enterprise)

Paid Zoom plans include **cloud recording** with **automatic audio transcription**, which generates higher-quality `.vtt` transcript files with timestamps and speaker labels.

### Enable Audio Transcription

1. Sign in to the [Zoom web portal](https://zoom.us/signin)
2. Go to **Settings → Recording**
3. Enable **Cloud recording**
4. Under cloud recording settings, enable **Audio transcript**
5. Meetings you record to the cloud will now be automatically transcribed

### Record Your Meeting

1. During a meeting, click **Record → Record to the Cloud**
2. After the meeting ends, Zoom processes the recording and generates the transcript
3. You'll receive an email when the recording and transcript are ready (usually a few minutes)

### Download the Transcript

1. Go to [zoom.us/recording](https://zoom.us/recording) (or **Recordings** in the Zoom web portal)
2. Find your meeting and click on it
3. Hover over **Audio Transcript** and click the **download** icon (↓)
4. Zoom downloads a `.vtt` file

::: info VTT is the best format
The `.vtt` file from cloud recordings includes **timestamps** and **speaker identification**, which gives MeetingMind more to work with — better participant tracking, accurate duration calculation, and richer auto-linking context.
:::

### Import into MeetingMind

**Option A: Folder watcher (recommended)**
1. Set up a [folder watcher](/features/folder-watcher) pointed at a folder in your vault
2. Move or copy the downloaded `.vtt` file into your watched folder
3. MeetingMind imports it automatically

**Option B: Manual import**
1. Press `Cmd/Ctrl + P`
2. Run **MeetingMind: Import file**
3. Select the `.vtt` transcript file

---

## Comparison

| Feature | Free Plan (`.txt`) | Paid Plan (`.vtt`) |
|---------|-------------------|-------------------|
| Timestamps | ❌ | ✅ |
| Speaker labels | Partial (depends on captions) | ✅ |
| Automatic after meeting | ❌ (manual save required) | ✅ (cloud processing) |
| Quality | Basic (live caption accuracy) | Higher (post-processed) |
| MeetingMind compatibility | ✅ | ✅ (recommended) |

## Tips

- **Name your meetings** in Zoom before recording — MeetingMind uses the filename to extract the meeting title
- **Use the `.vtt` format** whenever possible for the richest import
- For the best experience, pair with **AI Enrichment** (Pro) to get summaries, action items, and vault-aware linking from your Zoom transcripts
- If you use the folder watcher, you can set up a workflow to automatically move Zoom transcripts to your vault's watch folder

## Troubleshooting

### "No transcript found" or empty import
- Make sure captions were enabled **before** the meeting started
- For cloud recordings, wait for the processing email before downloading
- Check that the file isn't empty (open it in a text editor)

### Speakers showing as "Unknown"
- The `.txt` format from live captions may not include speaker names consistently
- For better speaker detection, use cloud recording (`.vtt` format) on a paid plan
- Ensure participants have their display names set in Zoom

### Transcript is missing parts of the meeting
- Live captions only capture audio that Zoom can detect — poor audio quality, crosstalk, or muted microphones will result in gaps
- Cloud transcription is generally more complete than live captions
