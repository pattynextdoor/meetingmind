# MeetingMind Demo Recording Script

> **📝 Marketing-Optimized Version**  
> This script has been optimized for marketing effectiveness with stronger hooks, clearer value props, and better pacing. Key changes: problem-first hook, cut processing time, emphasize "automatically", stronger CTA.

## Overview
**Target length:** 60-90 seconds (optimized for social media sharing)  
**Actual length:** 70-80 seconds (after editing out wait times)  
**Format:** Screen recording with your voiceover  
**Vibe:** Casual, like showing a friend—not a sales pitch  
**Tools needed:** Screen recorder (OBS, QuickTime, or Loom), Obsidian, MeetingMind installed

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

## Demo Script

### Scene 1: The Hook - Problem Statement (5-7 seconds)

**Show:** Obsidian vault with existing notes visible in file explorer (quick pan):
- `Cadence.md` (project note)
- `People/` folder with participant notes

**Voiceover:**
> "Your meetings are full of insights. But they're stuck in Otter or Fireflies, disconnected from your notes."

**Action:** Quick visual - show sparse graph view (Cmd+G) for 1-2 seconds, then return to file explorer

**Voiceover (continues):**
> "MeetingMind fixes that—automatically."

**Text overlay:** `Stop copy-pasting transcripts`

---

### Scene 2: The Import - One Click (6-8 seconds)

**Show:** Command palette

**Action:** Cmd+P → "MeetingMind: Import file" → select `01-monday-standup.json`

**Voiceover:**
> "One click, and MeetingMind brings them into your vault."

**Action:** **CUT TO** - File explorer showing the first meeting note created (edit out processing time entirely)

**Text overlay:** `📥 Import from Otter, Fireflies, Zoom...`

**Note:** In post-production, **cut out all processing time**. Jump directly from file selection to the result. The demo should feel instant and effortless.

---

### Scene 2b: Building the Series (5-7 seconds)

**Show:** File explorer showing the first meeting note created

**Voiceover:**
> "Let me import a few more meetings..."

**Action:** **Time-lapse effect** - Quickly show 2-3 more imports happening (speed up significantly in post):
- `02-feature-discussion.json` (feature discussion)
- `03-wednesday-standup.json` (standup with different attendees)
- `04-launch-retrospective.json` (retrospective)

**Voiceover (while importing):**
> "Different meeting types, different lengths, different people..."

**Action:** Show meetings folder filling up with notes (fast-forward effect)

**Note:** This entire sequence should feel fast—use time-lapse or quick cuts. Total time: 5-7 seconds max.

---

### Scene 3: The Connection - Auto-Linking (12-15 seconds)

**Show:** Open one of the meeting notes (maybe the feature discussion)

**Voiceover:**
> "Now watch this."

**Action:** Scroll to participant section, show `[[Maya Rodriguez]]` and `[[Chris Park]]` links

**Voiceover:**
> "Watch—it automatically links to participant notes."

**Text overlay:** `🔗 Auto-linked to your vault`

**Action:** Click `[[Maya Rodriguez]]` → participant note opens

**Show:** Participant note showing multiple meetings linked

**Voiceover:**
> "Maya's note shows all her meetings—Monday standup, feature discussion, Wednesday standup..."

**Action:** Scroll to show the "Related Meetings" section in Maya's note

**Voiceover:**
> "Your people notes track their entire meeting history automatically."

**Action:** Click back, open another meeting note (maybe the retrospective)

**Action:** Show participants section again, click `[[Derek Nguyen]]` 

**Voiceover:**
> "Different meetings, different people—but everyone's connected. Your knowledge graph builds itself."

---

### Scene 4: The AI Value - Pro Features (8-10 seconds)

**Scroll through one of the meeting notes (maybe the retrospective):**

**Voiceover:**
> "You get summaries, action items, decisions—"

**Action:** Show summary section, action items section, decisions section

**Text overlay:** `🤖 AI-powered summaries (Pro)`

**Voiceover:**
> "—all extracted automatically."

**Action:** Open a different meeting note (standup) - show it's shorter but still has AI extraction

**Voiceover:**
> "Quick standups get quick summaries—"

**Action:** Open the feature discussion - show more detailed extraction

**Text overlay:** `✅ Action items with owners`

**Voiceover:**
> "—and deep dives get detailed analysis. The AI adapts to the meeting type."

---

### Scene 5: Entity Extraction - The Magic Moment (15-18 seconds)

**Show:** File explorer, scroll to show entity folders (`Issues/`, `Updates/`, `Topics/`)

**Voiceover:**
> "But here's the magic—MeetingMind doesn't just link to existing notes. It creates new ones."

**Text overlay:** `📊 Entity extraction (Pro)`

**Action:** Expand `Issues/` folder to show notes inside

**Text overlay:** `Issues • Updates • Topics`

**Action:** Click on an issue note (e.g., "OAuth Integration" or "Payment Flow UX Issue")

**Voiceover:**
> "Issues mentioned across different meetings—"

**Action:** Show the entity note, scroll to "Related Meetings" section showing multiple meeting links

**Voiceover:**
> "—get tracked automatically. Same issue, different meetings, all connected."

**Action:** Open `Topics/` folder, click on a topic note (e.g., "Search Feature")

**Action:** Show topic note with related meetings

**Voiceover:**
> "Topics evolve across meetings. Your knowledge graph builds itself automatically."

---

### Scene 5b: The Graph View - Visual Climax (12-15 seconds)

**Show:** Switch to Obsidian's Graph View (Cmd+G or click graph icon)

**Voiceover:**
> "But here's the best part—"

**Action:** **PAUSE for 2 seconds** - Let the graph view sit and make visual impact

**Text overlay:** `🕸️ Watch your graph grow`

**Voiceover:**
> "Watch your graph grow."

**Action:** Pan/zoom slowly to show the network of connections:
- Meeting notes connected to participant notes
- Participants connected to each other through meetings
- Entity notes (issues, topics) connected to meetings
- The project note (Cadence) connected to meetings

**Voiceover:**
> "Every meeting adds new nodes. Every participant becomes a hub. Every issue, every topic—"

**Action:** Zoom out to show the full graph structure

**Text overlay:** `Every meeting adds connections`

**Voiceover:**
> "—all connected. Your knowledge graph builds itself, visually."

**Action:** Hover over a node to show it highlights connections

**Voiceover:**
> "Your meetings aren't isolated—they're part of a living network."

---

### Scene 6: The Big Picture - Call to Action (5-7 seconds)

**Show:** Pull back to show vault structure - meetings folder, people folder, entity folders

**Voiceover:**
> "Four meetings. One click each. A complete knowledge graph."

**Action:** Show file explorer with all the generated notes (quick pan)

**Voiceover:**
> "That's MeetingMind."

**Text overlay:** 
```
MeetingMind for Obsidian
Free core features • $39 Pro (one-time)
Try it free in Obsidian Community Plugins
```

**Voiceover (optional, if time allows):**
> "Get MeetingMind free in Obsidian Community Plugins. Upgrade to Pro for AI features—$39 one-time."

---

## Recording Tips

### Do's ✓
- **Move slowly** - viewers need time to read
- **Pause on key moments** - let the AI sections sink in
- **Use smooth scrolling** - not jerky mouse movements
- **Record at 60fps** if possible for smooth playback
- **Add subtle zoom** in post to highlight sections

### Don'ts ✗
- Don't show loading spinners for too long (edit them shorter)
- Don't include mistakes/retakes (obviously)
- Don't speed up so fast that text is unreadable
- Don't use a cluttered vault with distracting notes

### Important Notes ⚠️
- **Processing time**: **MUST edit out in post-production** - AI takes 10-30 seconds. Cut or speed up all import sequences. The demo should feel instant and effortless.
- **Target length**: Aim for 60-90 seconds total. Shorter = better for social media sharing.
- **Hook is critical**: First 3 seconds determine if viewers keep watching. Lead with the problem, not Obsidian context.
- **Navigation**: Use Obsidian's back button or click the meeting note tab to return. Don't use browser-style navigation
- **Entity filenames**: Check actual filenames after import - AI might name them slightly differently than expected
- **Practice Scene 5**: Entity extraction is the "wow" moment - practice opening entity notes smoothly
- **Graph View**: Practice navigating the graph view smoothly - pan, zoom, and hover to show connections. This is the visual climax—let it breathe.
- **Text overlays**: Add in post-production. They're essential for marketing effectiveness.

---

## Post-Production

### Recommended Edits (Priority Order)

**Must-Have:**
1. **Cut all processing time** - Speed up or cut import sequences entirely. Demo should feel instant.
2. **Add text overlays** - Label each feature as it appears (see overlay table above)
3. **Add cursor highlight** - Make clicks visible (use cursor highlight effect)
4. **Smooth transitions** - No jarring cuts between scenes

**Should-Have:**
5. **Add subtle background music** - Upbeat but not distracting (instrumental, low volume)
6. **Add zoom effects** - Subtle zoom to highlight important sections
7. **Optimize length** - Trim to 60-90 seconds total

**Nice-to-Have:**
8. **Before/after comparison** - Show sparse graph → connected graph (if time allows)
9. **Progress indicators** - Show "Step 1 of 4" etc. (optional)
10. **Branding** - Subtle logo watermark (optional)

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

## Sample Voiceover Script (Full - Optimized)

Read this naturally—don't rush. Pauses are your friend. **Target: 70-80 seconds total.**

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

**Timing notes:**
- Total length: ~90 seconds (with pauses)
- After editing out processing time: ~70-80 seconds
- Adjust pacing based on your natural speaking speed
- Don't rush—let key moments breathe

**Tips for natural delivery:**
- Talk like you're showing a friend, not presenting
- Emphasize "creates new ones" and "builds itself" - that's the magic moment
- Pause after "But here's what makes it powerful" - let it land
- Let yourself breathe between sentences  
- It's okay to say "um" once or twice—keeps it human
- Smile while you talk (it comes through in your voice)

---

## Ready to Record?

1. ☐ Test vault set up with sample notes
2. ☐ MeetingMind configured and tested
3. ☐ Entity extraction enabled in settings (Pro feature)
4. ☐ All 4 demo transcripts ready in `test-files/demo/`
5. ☐ Screen recorder ready
6. ☐ Obsidian theme clean and fonts readable
7. ☐ Read through script once
8. ☐ Do a practice run (especially Scene 3 - participant connections, Scene 5 - entity extraction, and Scene 5b - graph view)
9. ☐ Practice the import sequence - you'll want to speed this up in post-production
10. ☐ Practice graph view navigation - pan, zoom, hover to show connections smoothly
11. ☐ Hit record!

**Pro Tips:**

**Pre-Recording Setup:**
- **Import all 4 meetings BEFORE recording** - This way you can focus on showing results, not waiting for processing
- **Test entity extraction** - Make sure entity extraction creates multiple entity notes across different meetings
- **Verify participant notes** - Check that participant notes show multiple meetings linked (especially Maya and Chris)
- **Practice graph navigation** - Know how to switch to graph view quickly (Cmd+G), practice panning/zooming smoothly
- **Document actual filenames** - Note actual entity filenames after import so you know what to click during recording

**Recording Tips:**
- **Hook is critical** - First 3 seconds determine if viewers keep watching. Practice the opening line.
- **Emphasize "automatically"** - This is your key differentiator. Say it clearly.
- **Let graph view breathe** - Pause for 2 seconds when graph appears. It's the visual climax.
- **Move slowly** - Viewers need time to read. Don't rush through key moments.
- **Smooth navigation** - Practice clicking through participant links and entity notes smoothly

**Post-Production:**
- **Cut ALL processing time** - Import sequences should feel instant (speed up or cut entirely)
- **Add text overlays** - Essential for marketing effectiveness (see overlay table)
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


