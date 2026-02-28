# Microsoft Teams Transcript Import

MeetingMind supports Microsoft Teams transcripts in `.vtt` format, which is one of the two export formats Teams offers.

## Plan Requirements

Teams transcription requires a **paid Microsoft 365 plan** that includes Teams:

- Microsoft 365 Business Basic and higher
- Microsoft 365 E3/E5
- Office 365 E1/E3/E5

**Not available on:**
- Microsoft Teams (Free)
- Microsoft Teams Essentials

::: info No paid plan?
If you don't have a supported plan, you can use third-party tools like [Otter.ai](/features/otter-sync) or [Fireflies.ai](/features/fireflies) to transcribe your Teams meetings instead.
:::

## Enable Transcription

Your Teams admin needs to enable transcription:

1. Go to **Teams Admin Center → Meetings → Meeting policies**
2. Under **Recording & transcription**, enable **Transcription**
3. The policy applies to users in your organization

### Verify It's Enabled

If you don't see the transcription option during a meeting, ask your IT admin to check the meeting policy settings.

## Transcribe a Meeting

### Start Transcription

1. During a Teams meeting, click **More actions** (⋯) in the meeting toolbar
2. Select **Record and transcribe** → **Start transcription**
3. A banner notifies all participants that transcription is active
4. The live transcript panel appears on the right side

::: tip Recording + Transcription
If you start **recording**, transcription starts automatically. You can also start transcription without recording.
:::

### During the Meeting

- The transcript panel shows real-time text with **speaker names** and **timestamps**
- Participants can toggle the transcript panel on/off without affecting the transcription

### Stop Transcription

- Click **More actions** (⋯) → **Record and transcribe** → **Stop transcription**
- Transcription also stops automatically when the meeting ends

## Download the Transcript

### From the Meeting Chat

1. After the meeting ends, go to the **meeting chat** in Teams
2. The transcript appears as a tab at the top of the chat
3. Click the **⬇ Download** button
4. Choose **Download as .vtt** (recommended for MeetingMind)

::: warning Use .vtt, not .docx
Teams offers both `.docx` and `.vtt` downloads. **Choose `.vtt`** — MeetingMind parses it natively with full timestamp and speaker support. The `.docx` format would need to be converted to `.txt` first.
:::

### From the Calendar Event

1. Open the meeting event in your Teams calendar
2. Click the **Recap** tab
3. Find the transcript and click **Download**
4. Choose **.vtt** format

### From Teams on the Web

1. Go to [teams.microsoft.com](https://teams.microsoft.com)
2. Navigate to **Calendar** → find the meeting → **Recap**
3. Download the transcript as `.vtt`

## Import into MeetingMind

**Option A: Folder watcher (recommended)**
1. Set up a [folder watcher](/features/folder-watcher) pointed at a folder in your vault
2. Move or copy the downloaded `.vtt` file into your watched folder
3. MeetingMind imports it automatically

**Option B: Manual import**
1. Press `Cmd/Ctrl + P`
2. Run **MeetingMind: Import file**
3. Select the `.vtt` transcript file

## What You Get

Teams `.vtt` transcripts include:
- **Speaker names** — automatically mapped to participant notes
- **Timestamps** — accurate meeting duration and timeline
- **Full transcript text** — everything said during the meeting

With **AI Enrichment** (Pro), MeetingMind will generate summaries, extract action items, identify decisions, and auto-link mentions to your existing vault notes.

## Tips

- **Download as `.vtt`** for the best MeetingMind experience — it has structured timestamps and speaker labels
- If you only have a `.docx` transcript, open it in Word, select all text, paste into a plain text file, save as `.txt`, and import that
- Teams transcription supports **36+ languages** — MeetingMind will import transcripts in any language
- For recurring meetings, set up a workflow where you download the `.vtt` after each meeting and drop it in your watched folder

## Troubleshooting

### No "Record and transcribe" option
- Your admin hasn't enabled transcription in the Teams meeting policy
- You're on a Teams plan that doesn't support transcription (Free or Essentials)
- Check with your IT admin

### Speakers showing as "Unknown" or wrong names
- Participants need to be signed into Teams with their organization account
- External guests or phone dial-in participants may not be identified correctly
- Teams uses voice profiles to identify speakers — accuracy improves over time

### Can't download the transcript
- By default, only the **meeting organizer and co-organizers** can download transcripts
- Your admin can change this policy in the Teams Admin Center
- Check that the meeting was recorded to **Microsoft Stream** or **OneDrive/SharePoint** (depending on your org settings)

### Transcript is incomplete
- Transcription must be started before or during the meeting — it doesn't retroactively transcribe
- If someone started and stopped transcription mid-meeting, only the active portions are captured
- Poor audio quality or heavy crosstalk may cause gaps
