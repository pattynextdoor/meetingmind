# MeetingMind Demo Recording Script

> **📝 Marketing-Optimized Version**  
> This script has been optimized for marketing effectiveness with stronger hooks, clearer value props, and better pacing. Key changes: problem-first hook, cut processing time, emphasize "automatically", stronger CTA.

## Overview
**Target length:** 60-90 seconds (optimized for social media sharing)  
**Actual length:** 70-80 seconds (after editing out wait times)  
**Format:** Two-step process: Record actions first, add voiceover in post-production  
**Vibe:** Casual, like showing a friend—not a sales pitch  
**Tools needed:** Screen recorder (OBS, QuickTime, or Loom), Obsidian, MeetingMind installed, video editor (DaVinci Resolve, Final Cut, Premiere, or CapCut)

## Recording Workflow

**Step 1: Record Actions (No Voice)**  
Record all screen actions first—no voiceover needed. Focus on smooth, deliberate movements. Take your time; you can speed up in post-production.

**Step 2: Add Voiceover (Post-Production)**  
After recording, add the voiceover script in your video editor. Match voiceover timing to the recorded actions.

**Note:** AI processing takes 10-30 seconds per meeting. **Edit out processing time in post-production** (recommended - speed up or cut the import sequence entirely). The demo should feel fast and effortless.

---

## Pre-Recording Setup

### 1. Prepare Your Test Vault

Create a fresh vault or use a dedicated demo vault. Copy the demo assets:

```bash
# Copy the vault notes
cp -r test-files/demo/vault/* /path/to/your/demo-vault/
```

Your vault should look like:
```
Demo Vault/
├── Cadence.md              # Project note
└── People/
    ├── Maya Rodriguez.md    # Product Lead
    ├── Chris Park.md        # Lead Developer
    ├── Aisha Patel.md       # Product Designer
    └── Derek Nguyen.md      # Marketing Lead
```

**Note:** The `Meetings/` and `People/` folders will be auto-created when you import your first transcript.

**Demo transcripts:** Series of 4 meetings in `test-files/demo/`:
- `01-monday-standup.json` - Short standup (7 min, 3 people: Maya, Chris, Aisha)
- `02-feature-discussion.json` - Feature deep dive (27 min, 2 people: Maya, Chris)
- `03-wednesday-standup.json` - Longer standup (13 min, 4 people: Maya, Chris, Aisha, Derek)
- `04-launch-retrospective.json` - Retrospective (40 min, 4 people: Maya, Chris, Aisha, Derek)

**Note:** These transcripts show varying meeting types, lengths, and attendee combinations to demonstrate how MeetingMind builds connections across different contexts.

### 2. MeetingMind Settings

Before recording, configure these settings:
- **Output folder:** `Meetings` (will be auto-created on first import)
- **People folder:** `People` (default, will be auto-created on first import)
- **AI enrichment:** Enabled (with your API key)
- **Auto-linking:** Enabled
- **Participant notes:** Enabled
- **Entity extraction:** Enabled (Pro feature - use `transcript-with-entities.json` for demo)

### 3. Screen Setup

- **Resolution:** 1920×1080 or 2560×1440 (crisp on YouTube)
- **Obsidian theme:** Use a clean theme (default light or Minimal)
- **Font size:** Bump up slightly for readability
- **Hide:** Distracting plugins, status bar clutter
- **Show:** File explorer, one note open

---

## Part 1: Action Recording Script

Record these actions first—**no voiceover needed**. Focus on smooth, deliberate movements. Take your time; you can speed up or trim in post-production.

### Scene 1: The Hook - Problem Statement (5-7 seconds)

**Actions to Record:**
1. Show Obsidian vault with existing notes visible in file explorer (quick pan):
   - `Cadence.md` (project note)
   - `People/` folder with participant notes
2. Quick visual - show sparse graph view (Cmd+G) for 1-2 seconds, then return to file explorer
3. Pause briefly (you'll add voiceover here)

**Text overlay to add in post:** `Stop copy-pasting transcripts`

---

### Scene 2: The Import - One Click (6-8 seconds)

**Actions to Record:**
1. Show command palette (Cmd+P)
2. Type "MeetingMind: Import file" and select it
3. Select `01-monday-standup.json` from file picker
4. **Wait for processing to complete** (you'll cut this out in post)
5. Show file explorer with the first meeting note created

**Note:** In post-production, **cut out all processing time**. Jump directly from file selection to the result. The demo should feel instant and effortless.

**Text overlay to add in post:** `📥 Import from Otter, Fireflies, Zoom...`

---

### Scene 2b: Building the Series (5-7 seconds)

**Actions to Record:**
1. Show file explorer with the first meeting note created
2. Import `02-feature-discussion.json` (wait for processing - you'll speed this up in post)
3. Import `03-wednesday-standup.json` (wait for processing - you'll speed this up in post)
4. Import `04-launch-retrospective.json` (wait for processing - you'll speed this up in post)
5. Show meetings folder filling up with notes

**Note:** Record at normal speed. In post-production, speed up these imports significantly (time-lapse effect). Total time should be 5-7 seconds max after editing.

---

### Scene 3: The Connection - Auto-Linking (12-15 seconds)

**Actions to Record:**
1. Open one of the meeting notes (maybe the feature discussion)
2. Scroll to participant section, show `[[Maya Rodriguez]]` and `[[Chris Park]]` links
3. Click `[[Maya Rodriguez]]` → participant note opens
4. Scroll to show the "Related Meetings" section in Maya's note
5. Click back (or use Obsidian back button), open another meeting note (maybe the retrospective)
6. Show participants section again, click `[[Derek Nguyen]]`
7. Show Derek's participant note briefly

**Text overlay to add in post:** `🔗 Auto-linked to your vault`

---

### Scene 4: The AI Value - Pro Features (8-10 seconds)

**Actions to Record:**
1. Scroll through one of the meeting notes (maybe the retrospective)
2. Show summary section
3. Show action items section
4. Show decisions section
5. Open a different meeting note (standup) - show it's shorter but still has AI extraction
6. Open the feature discussion - show more detailed extraction

**Text overlays to add in post:**
- `🤖 AI-powered summaries (Pro)` (when showing AI features)
- `✅ Action items with owners` (when showing action items)

---

### Scene 5: Entity Extraction - The Magic Moment (15-18 seconds)

**Actions to Record:**
1. Show file explorer, scroll to show entity folders (`Issues/`, `Updates/`, `Topics/`)
2. Expand `Issues/` folder to show notes inside
3. Click on an issue note (e.g., "OAuth Integration" or "Payment Flow UX Issue")
4. Show the entity note, scroll to "Related Meetings" section showing multiple meeting links
5. Go back to file explorer
6. Open `Topics/` folder, click on a topic note (e.g., "Search Feature")
7. Show topic note with related meetings

**Text overlays to add in post:**
- `📊 Entity extraction (Pro)` (when showing entity folders)
- `Issues • Updates • Topics` (when expanding folders)

---

### Scene 5b: The Graph View - Visual Climax (12-15 seconds)

**Actions to Record:**
1. Switch to Obsidian's Graph View (Cmd+G or click graph icon)
2. **PAUSE for 2 seconds** - Let the graph view sit and make visual impact
3. Pan/zoom slowly to show the network of connections:
   - Meeting notes connected to participant notes
   - Participants connected to each other through meetings
   - Entity notes (issues, topics) connected to meetings
   - The project note (Cadence) connected to meetings
4. Zoom out to show the full graph structure
5. Hover over a node to show it highlights connections

**Text overlays to add in post:**
- `🕸️ Watch your graph grow` (when graph appears)
- `Every meeting adds connections` (during zoom out)

---

### Scene 6: The Big Picture - Call to Action (5-7 seconds)

**Actions to Record:**
1. Pull back to show vault structure - meetings folder, people folder, entity folders
2. Show file explorer with all the generated notes (quick pan)

**Text overlay to add in post:**
```
MeetingMind for Obsidian
Free core features • $39 Pro (one-time)
Try it free in Obsidian Community Plugins
```

---

## Part 2: Voiceover Script (Add in Post-Production)

Match these voiceover lines to the recorded actions. Read naturally—don't rush. Pauses are your friend.

### Scene 1: The Hook - Problem Statement (5-7 seconds)

**Voiceover:**
> "Your meetings are full of insights. But they're stuck in Otter or Fireflies, disconnected from your notes."

[Pause while showing graph view]

> "MeetingMind fixes that—automatically."

### Scene 2: The Import - One Click (6-8 seconds)

**Voiceover:**
> "One click, and MeetingMind brings them into your vault."

### Scene 2b: Building the Series (5-7 seconds)

**Voiceover:**
> "Let me import a few more meetings..."

[While showing imports]

> "Different meeting types, different lengths, different people..."

### Scene 3: The Connection - Auto-Linking (12-15 seconds)

**Voiceover:**
> "Now watch this."

[When showing participant links]

> "Watch—it automatically links to participant notes."

[When showing Maya's note]

> "Maya's note shows all her meetings—Monday standup, feature discussion, Wednesday standup..."

[When scrolling through meetings]

> "Your people notes track their entire meeting history automatically."

[When showing Derek's note]

> "Different meetings, different people—but everyone's connected. Your knowledge graph builds itself."

### Scene 4: The AI Value - Pro Features (8-10 seconds)

**Voiceover:**
> "You get summaries, action items, decisions—"

[When showing AI sections]

> "—all extracted automatically."

[When showing standup]

> "Quick standups get quick summaries—"

[When showing feature discussion]

> "—and deep dives get detailed analysis. The AI adapts to the meeting type."

### Scene 5: Entity Extraction - The Magic Moment (15-18 seconds)

**Voiceover:**
> "But here's the magic—MeetingMind doesn't just link to existing notes. It creates new ones."

[When showing entity folders]

> "Issues mentioned across different meetings—"

[When showing issue note with related meetings]

> "—get tracked automatically. Same issue, different meetings, all connected."

[When showing topic note]

> "Topics evolve across meetings. Your knowledge graph builds itself automatically."

### Scene 5b: The Graph View - Visual Climax (12-15 seconds)

**Voiceover:**
> "But here's the best part—"

[PAUSE for 2 seconds - let graph view sit]

> "Watch your graph grow."

[While panning/zooming]

> "Every meeting adds new nodes. Every participant becomes a hub. Every issue, every topic—"

[When zooming out]

> "—all connected. Your knowledge graph builds itself, visually."

[When hovering over nodes]

> "Your meetings aren't isolated—they're part of a living network."

### Scene 6: The Big Picture - Call to Action (5-7 seconds)

**Voiceover:**
> "Four meetings. One click each. A complete knowledge graph."

[When showing vault structure]

> "That's MeetingMind."

[Optional, if time allows]

> "Get MeetingMind free in Obsidian Community Plugins. Upgrade to Pro for AI features—$39 one-time."

---

## Recording Tips

### Action Recording Tips ✓
- **Move slowly and deliberately** - viewers need time to read
- **Pause on key moments** - let important sections sit for 1-2 seconds
- **Use smooth scrolling** - not jerky mouse movements
- **Record at 60fps** if possible for smooth playback
- **Take your time** - you can speed up or trim in post-production
- **Record processing time** - you'll cut it out later, but record it so you have options

### Don'ts ✗
- Don't rush through actions - record at comfortable pace
- Don't worry about timing - you'll sync voiceover in post
- Don't include mistakes/retakes - do multiple takes if needed
- Don't use a cluttered vault with distracting notes

### Important Notes ⚠️
- **Processing time**: Record it, but **MUST edit out in post-production** - AI takes 10-30 seconds. Cut or speed up all import sequences. The demo should feel instant and effortless.
- **Target length**: Aim for 60-90 seconds total after editing. Shorter = better for social media sharing.
- **Navigation**: Use Obsidian's back button or click the meeting note tab to return. Don't use browser-style navigation
- **Entity filenames**: Check actual filenames after import - AI might name them slightly differently than expected
- **Practice Scene 5**: Entity extraction is the "wow" moment - practice opening entity notes smoothly
- **Graph View**: Practice navigating the graph view smoothly - pan, zoom, and hover to show connections. This is the visual climax—let it breathe.

---

## Post-Production Workflow

### Step 1: Edit Actions (Video Editing)

**Must-Have Edits:**
1. **Cut all processing time** - Speed up or cut import sequences entirely. Demo should feel instant.
2. **Smooth transitions** - No jarring cuts between scenes
3. **Add cursor highlight** - Make clicks visible (use cursor highlight effect)
4. **Optimize length** - Trim to 60-90 seconds total

**Should-Have:**
5. **Add zoom effects** - Subtle zoom to highlight important sections
6. **Color correction** - Ensure consistent brightness/contrast
7. **Stabilize shaky movements** - Smooth out any jerky mouse movements

### Step 2: Add Voiceover (Audio Editing)

**Voiceover Tips:**
- Record voiceover separately (use a good microphone)
- Match voiceover timing to the edited video actions
- Add pauses where indicated in the script
- Use noise reduction if needed
- Normalize audio levels

**Timing Guide:**
- Total voiceover should be ~70-80 seconds
- Match voiceover to actions - don't rush
- Let key moments breathe (especially graph view)

### Step 3: Add Text Overlays & Graphics

**Must-Have Overlays:**
- Add all text overlays listed in each scene
- Use clean, readable fonts (SF Pro, Inter, or similar)
- Keep overlays subtle—don't block content
- Add subtle animations (fade in/out)

**Should-Have:**
- Add subtle background music - Upbeat but not distracting (instrumental, low volume)
- Ensure music doesn't overpower voiceover

**Nice-to-Have:**
- Before/after comparison - Show sparse graph → connected graph (if time allows)
- Progress indicators - Show "Step 1 of 4" etc. (optional)
- Branding - Subtle logo watermark (optional)

### Step 4: Export

**Export formats:**
- **MP4** (1080p, 60fps) for YouTube/website embed
- **GIF** (15-20 sec version) for README/Reddit
- **MP4** (30 sec teaser) for Twitter/X, Instagram

### Text Overlays to Add

**Must-have overlays (add in post-production):**

| Scene | Overlay Text | Timing |
|-------|--------------|--------|
| Scene 1 (Hook) | `Stop copy-pasting transcripts` | 0-3 seconds |
| Scene 2 (Import) | `📥 Import from Otter, Fireflies, Zoom...` | During import |
| Scene 3 (Links) | `🔗 Auto-linked to your vault` | When showing links |
| Scene 4 (Summary) | `🤖 AI-powered summaries (Pro)` | When showing AI features |
| Scene 4 (Actions) | `✅ Action items with owners` | When showing action items |
| Scene 5 (Entities) | `📊 Entity extraction (Pro)` | When showing entity folders |
| Scene 5 (Folders) | `Issues • Updates • Topics` | When expanding folders |
| Scene 5b (Graph) | `🕸️ Watch your graph grow` | When graph appears |
| Scene 5b (Graph) | `Every meeting adds connections` | During zoom out |
| Scene 6 (CTA) | `Free core • $39 Pro (one-time)` | Final screen |

**Design notes:**
- Use clean, readable fonts (SF Pro, Inter, or similar)
- Keep overlays subtle—don't block content
- Use consistent positioning (e.g., bottom-right for feature labels)
- Add subtle animations (fade in/out)

---

## Alternative: GIF-Only Demo (15-20 seconds)

If you just want a quick GIF for the README:

1. **Start:** File picker selecting transcript
2. **Middle:** Processing indicator
3. **End:** Scroll through generated note showing linked participants and AI sections

Use a tool like [Gifski](https://gif.ski/) or [LICEcap](https://www.cockos.com/licecap/) to record.

---

## Complete Voiceover Script (Timing Reference)

Use this as a reference when recording voiceover. **Don't follow timings exactly** - match your voiceover to the edited video actions instead.

**Total target length:** ~70-80 seconds (after editing out processing time)

```
[0:00] Your meetings are full of insights. But they're stuck in Otter or Fireflies, 
       disconnected from your notes.

[0:05] MeetingMind fixes that—automatically.

[0:08] One click, and MeetingMind brings them into your vault.

[0:12] Let me import a few more meetings...

[0:15] Different meeting types, different lengths, different people...

[0:20] Now watch this.

[0:22] Watch—it automatically links to participant notes.

[0:26] Maya's note shows all her meetings—Monday standup, feature discussion, 
       Wednesday standup...

[0:32] Your people notes track their entire meeting history automatically.

[0:37] Different meetings, different people—but everyone's connected. 
       Your knowledge graph builds itself.

[0:44] You get summaries, action items, decisions—

[0:47] —all extracted automatically.

[0:50] Quick standups get quick summaries—

[0:53] —and deep dives get detailed analysis. The AI adapts to the meeting type.

[0:59] But here's the magic—MeetingMind doesn't just link to existing notes. 
       It creates new ones.

[1:05] Issues mentioned across different meetings—

[1:09] —get tracked automatically. Same issue, different meetings, all connected.

[1:14] Topics evolve across meetings. Your knowledge graph builds itself automatically.

[1:20] But here's the best part—

[1:23] [PAUSE - let graph view sit for 2 seconds]

[1:25] Watch your graph grow.

[1:28] Every meeting adds new nodes. Every participant becomes a hub. 
       Every issue, every topic—

[1:34] —all connected. Your knowledge graph builds itself, visually.

[1:39] Your meetings aren't isolated—they're part of a living network.

[1:44] Four meetings. One click each. A complete knowledge graph.

[1:48] That's MeetingMind.

[1:50] Get MeetingMind free in Obsidian Community Plugins. 
       Upgrade to Pro for AI features—$39 one-time.
```

**Tips for recording voiceover:**
- Record in a quiet room with a good microphone
- Talk like you're showing a friend, not presenting
- Emphasize "creates new ones" and "builds itself" - that's the magic moment
- Pause after "But here's the best part" - let it land
- Let yourself breathe between sentences  
- It's okay to say "um" once or twice—keeps it human
- Smile while you talk (it comes through in your voice)
- Match timing to your edited video, not these timestamps

---

## Ready to Record?

### Pre-Recording Checklist

**Setup:**
1. ☐ Test vault set up with sample notes
2. ☐ MeetingMind configured and tested
3. ☐ Entity extraction enabled in settings (Pro feature)
4. ☐ All 4 demo transcripts ready in `test-files/demo/`
5. ☐ Screen recorder ready (OBS, QuickTime, or Loom)
6. ☐ Obsidian theme clean and fonts readable
7. ☐ Video editor ready (DaVinci Resolve, Final Cut, Premiere, or CapCut)

**Practice:**
8. ☐ Read through action script once
9. ☐ Do a practice run (especially Scene 3 - participant connections, Scene 5 - entity extraction, and Scene 5b - graph view)
10. ☐ Practice the import sequence - record at normal speed, you'll speed this up in post-production
11. ☐ Practice graph view navigation - pan, zoom, hover to show connections smoothly

**Recording:**
12. ☐ Hit record! (Record actions only - no voiceover needed)
13. ☐ Record all scenes in one take if possible (or multiple takes, you'll edit later)
14. ☐ After recording actions, record voiceover separately (match to edited video)

**Pro Tips:**

**Pre-Recording Setup:**
- **Import all 4 meetings BEFORE recording** - This way you can focus on showing results, not waiting for processing
- **Test entity extraction** - Make sure entity extraction creates multiple entity notes across different meetings
- **Verify participant notes** - Check that participant notes show multiple meetings linked (especially Maya and Chris)
- **Practice graph navigation** - Know how to switch to graph view quickly (Cmd+G), practice panning/zooming smoothly
- **Document actual filenames** - Note actual entity filenames after import so you know what to click during recording

**Action Recording Tips:**
- **Move slowly** - Viewers need time to read. Don't rush through key moments.
- **Pause on key moments** - Let important sections sit for 1-2 seconds
- **Smooth navigation** - Practice clicking through participant links and entity notes smoothly
- **Record processing time** - You'll cut it out later, but record it so you have options
- **Take multiple takes** - It's easier to edit if you have options

**Voiceover Recording Tips:**
- **Record separately** - Use a good microphone in a quiet room
- **Match to edited video** - Record voiceover after you've edited the actions
- **Emphasize "automatically"** - This is your key differentiator. Say it clearly.
- **Let graph view breathe** - Pause for 2 seconds when graph appears. It's the visual climax.
- **Natural delivery** - Talk like you're showing a friend, not presenting

**Post-Production:**
- **Cut ALL processing time** - Import sequences should feel instant (speed up or cut entirely)
- **Add text overlays** - Essential for marketing effectiveness (see overlay table)
- **Sync voiceover to actions** - Match voiceover timing to what's happening on screen
- **Optimize length** - Target 60-90 seconds. Shorter = better for sharing
- **Test with strangers** - Show to 3-5 people who don't know the product. Can they explain what it does?

Good luck! 🎬

---

## Key Marketing Improvements Made

This script has been optimized based on marketing best practices:

✅ **Stronger Hook** - Leads with problem statement, not Obsidian context  
✅ **Faster Pacing** - Target 60-90 seconds (down from 100-110)  
✅ **Cut Processing Time** - All import waits edited out in post-production  
✅ **Emphasize "Automatically"** - Key differentiator mentioned throughout  
✅ **Clearer Value Props** - Text overlays highlight features as they appear  
✅ **Stronger CTA** - Clear call-to-action with pricing and next steps  
✅ **Better Flow** - Graph view is the visual climax, entity extraction is the magic moment  
✅ **Pro Feature Clarity** - Clearly distinguishes Free vs Pro features  

**Next Steps:**
1. Practice recording with this script
2. Record 2-3 test runs
3. Edit in post-production (cut processing time, add overlays)
4. Test with 3-5 people who don't know the product
5. Iterate based on feedback


