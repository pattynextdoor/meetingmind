# Google Meet Transcript Import

MeetingMind can import Google Meet transcripts saved as Google Docs (copy-paste as `.txt`). Google Meet's built-in transcription feature saves transcripts directly to Google Drive.

## Plan Requirements

Google Meet's transcription feature is **not available on the free plan**. You need one of these Google Workspace editions:

- Business Standard or Business Plus
- Enterprise Starter, Standard, or Plus
- Education Plus or Teaching and Learning Upgrade
- Workspace Individual

::: info Free plan workaround
If you're on the free plan, you can still get transcripts using live **captions**. See the [Free Plan section](#free-plan-using-captions) below.
:::

## Paid Plans (Workspace)

### Enable Transcription

Transcription is enabled by default for supported Workspace editions. If it's been disabled:

1. Your Workspace admin goes to **Admin Console → Apps → Google Workspace → Google Meet → Meet settings**
2. Enable **Meeting transcripts**

### Transcribe a Meeting

1. Start or join a meeting on your **computer** (transcription is desktop-only)
2. At the bottom right, click **Meeting tools** (⋮) → **Transcripts** → **Start transcription**
3. Click **Start** to confirm
4. A transcript icon (📝) appears at the top left for all participants
5. The transcript runs until you stop it or the meeting ends

::: tip Auto-start transcription
When creating a calendar event, click **Video call options → Meeting records** and select **Transcribe the meeting** to have it start automatically.
:::

### Find and Download the Transcript

After the meeting:

1. The host, co-hosts, and the person who started transcription receive an **email** with a link
2. The transcript is also **attached to the Google Calendar event**
3. Open the transcript — it's a **Google Doc** saved in the organizer's Google Drive
4. In the Google Doc, go to **File → Download → Plain text (.txt)**

The transcript includes speaker names and timestamps.

### Import into MeetingMind

1. Save or download the Google Doc as a `.txt` file
2. **Folder watcher:** Copy the `.txt` file to your watched folder
3. **Manual import:** `Cmd/Ctrl + P` → **MeetingMind: Import file** → select the file

---

## Free Plan (Using Captions) {#free-plan-using-captions}

Google Meet's free plan includes **live captions** but not downloadable transcripts. You can work around this by manually copying the captions.

### Enable Captions

1. During a meeting, click **CC** (Turn on captions) in the bottom toolbar
2. Captions appear at the bottom of your screen in real-time

### Copy the Transcript

Unfortunately, Google Meet's free plan doesn't offer a "save transcript" button. Your options:

**Option A: Copy from the caption panel**
1. Some browser extensions (like Tactiq or Otter) can capture Google Meet captions automatically
2. These tools typically export as `.txt` which MeetingMind can import

**Option B: Use a third-party transcription tool**
1. Tools like **Otter.ai**, **Fireflies.ai**, or **Tactiq** can join your Google Meet and transcribe
2. Export from those tools and import into MeetingMind
3. See our [Otter.ai](/features/otter-sync) or [Fireflies.ai](/features/fireflies) guides

**Option C: Record and transcribe**
1. Record the meeting audio using any screen recorder
2. Use a transcription service (like Whisper, Otter, or Fireflies) to generate a transcript
3. Import the transcript into MeetingMind

---

## Comparison

| Feature | Free Plan | Workspace (Paid) |
|---------|-----------|-------------------|
| Live captions | ✅ | ✅ |
| Downloadable transcript | ❌ | ✅ |
| Speaker labels | Captions only | ✅ |
| Timestamps | ❌ | ✅ |
| Auto-saved to Drive | ❌ | ✅ |
| MeetingMind compatible | Via workaround | ✅ (`.txt` export) |

## Tips

- **Name your meetings** in Google Calendar — the transcript file inherits the event name, and MeetingMind uses the filename as the meeting title
- Google Meet transcripts are **Google Docs**, so you need to download them as `.txt` before importing
- For the richest import, pair with **AI Enrichment** (Pro) to extract summaries and action items
- If you use multiple meeting tools, the **folder watcher** is the easiest unified workflow — just drop all your exports in one folder

## Troubleshooting

### No "Transcripts" option in Meeting tools
- Your Workspace edition may not support transcription — check with your admin
- Transcription only works on the **desktop web app**, not mobile

### Transcript is missing speakers
- Google Meet identifies speakers based on who is signed into the meeting
- Guests joining without a Google account may appear as "Unknown"
- Phone dial-in participants may not be identified

### Transcript wasn't saved
- Make sure the meeting organizer has enough Google Drive storage
- Transcription must be started **before** the conversation you want captured — it doesn't retroactively transcribe
