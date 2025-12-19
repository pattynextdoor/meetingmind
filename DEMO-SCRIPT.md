# MeetingMind Demo Recording Script

## Overview
**Target length:** 100-110 seconds (with processing time)  
**Actual length:** 90-100 seconds (after editing out wait times)  
**Format:** Screen recording with your voiceover  
**Vibe:** Casual, like showing a friend—not a sales pitch  
**Tools needed:** Screen recorder (OBS, QuickTime, or Loom), Obsidian, MeetingMind installed

**Note:** AI processing takes 10-30 seconds per meeting. Either acknowledge this in voiceover or edit it out in post-production (recommended - speed up the import sequence).

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

### Scene 1: The Obsidian Context (10-12 seconds)

**Show:** Obsidian vault with existing notes visible in file explorer:
- `Cadence.md` (project note)
- `People/` folder with participant notes

**Voiceover:**
> "You've got your Obsidian vault—projects, people, ideas all connected."

**Action:** Click on `Cadence.md` to show it's a real note with content

**Optional:** Quick peek at graph view (Cmd+G) - show sparse graph with just a few nodes

> "But your meetings? They're stuck in Otter or Fireflies, disconnected from everything else."

**Action:** Return to file explorer view

---

### Scene 2: The First Import (10-12 seconds)

**Show:** Command palette

**Action:** Cmd+P → "MeetingMind: Import file" → select `01-monday-standup.json`

**Voiceover:**
> "MeetingMind brings them into your vault."

**Action:** Show status bar or processing indicator
> "This takes about 10 seconds..."

**Note:** In post-production, you can speed up or cut the waiting time. The actual processing includes AI enrichment and entity extraction.

---

### Scene 2b: Building the Series (15-18 seconds)

**Show:** File explorer showing the first meeting note created

**Voiceover:**
> "Let me import a few more meetings to show you how it builds..."

**Action:** Quickly import 2-3 more meetings (use speed-up in post):
- `02-feature-discussion.json` (feature discussion)
- `03-wednesday-standup.json` (standup with different attendees)
- `04-launch-retrospective.json` (retrospective)

**Voiceover (while importing):**
> "Different meeting types, different lengths, different people..."

**Action:** Show meetings folder filling up with notes

**Voiceover:**
> "Watch what happens..."

---

### Scene 3: The Connection (20-25 seconds)

**Show:** Open one of the meeting notes (maybe the feature discussion)

**Voiceover:**
> "Now watch this."

**Action:** Scroll to participant section, show `[[Maya Rodriguez]]` and `[[Chris Park]]` links

> "Each meeting automatically links to participant notes."

**Action:** Click `[[Maya Rodriguez]]` → participant note opens

**Show:** Participant note showing multiple meetings linked

**Voiceover:**
> "And look - Maya's note shows all her meetings. Monday standup, feature discussion, Wednesday standup..."

**Action:** Scroll to show the "Related Meetings" section in Maya's note

> "Your people notes track their entire meeting history."

**Action:** Click back, open another meeting note (maybe the retrospective)

**Action:** Show participants section again

> "Different meetings, different combinations of people -"

**Action:** Click `[[Derek Nguyen]]` 

> "But everyone's connected. Your knowledge graph builds itself."

---

### Scene 4: The AI Value (12-15 seconds)

**Scroll through one of the meeting notes (maybe the retrospective):**

**Voiceover:**
> "You get summaries, action items, decisions—"

**Action:** Show summary section, action items section, decisions section

> "—all extracted automatically."

**Action:** Open a different meeting note (standup) - show it's shorter but still has AI extraction

**Voiceover:**
> "Works for quick standups—"

**Action:** Open the feature discussion - show more detailed extraction

> "—and deep dives. The AI adapts to the meeting type."

---

### Scene 5: Entity Extraction - The Magic (20-25 seconds)

**Show:** File explorer, scroll to show entity folders (`Issues/`, `Updates/`, `Topics/`)

**Voiceover:**
> "But here's what makes it powerful—"

**Action:** Expand `Issues/` folder to show notes inside

> "It doesn't just link to existing notes. It creates new ones."

**Action:** Click on an issue note (e.g., "OAuth Integration" or "Payment Flow UX Issue")

> "Issues mentioned across different meetings—"

**Action:** Show the entity note, scroll to "Related Meetings" section showing multiple meeting links

**Voiceover:**
> "—get tracked automatically. Same issue, different meetings, all connected."

**Action:** Open `Topics/` folder, click on a topic note (e.g., "Search Feature")

**Action:** Show topic note with related meetings

> "Topics evolve across meetings. Your knowledge graph builds itself."

---

### Scene 5b: The Graph View - Watch It Grow (12-15 seconds)

**Show:** Switch to Obsidian's Graph View (Cmd+G or click graph icon)

**Voiceover:**
> "But here's the best part—"

**Action:** Show the graph view with all the connections visible

> "Watch your graph grow."

**Action:** Pan/zoom to show the network of connections:
- Meeting notes connected to participant notes
- Participants connected to each other through meetings
- Entity notes (issues, topics) connected to meetings
- The project note (Cadence) connected to meetings

**Voiceover:**
> "Every meeting adds new nodes. Every participant becomes a hub. Every issue, every topic—"

**Action:** Zoom out to show the full graph structure

> "—all connected. Your knowledge graph builds itself, visually."

**Action:** Hover over a node to show it highlights connections

> "Click any node, see everything connected. Your meetings aren't isolated—they're part of a living network."

---

### Scene 6: The Big Picture (8-10 seconds)

**Show:** Pull back to show vault structure - meetings folder, people folder, entity folders

**Voiceover:**
> "Four meetings. Different types, different people, different lengths."

**Action:** Show file explorer with all the generated notes

> "But look what you get—"

**Action:** Count or highlight: multiple meeting notes, participant notes with histories, entity notes tracking issues and topics

> "A complete knowledge graph. Meetings that actually connect—and build—your vault."

**Text overlay:** 
```
MeetingMind for Obsidian
Free core • $39 Pro (one-time)
```

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
- **Processing time**: AI takes 10-30 seconds. Either acknowledge it ("This takes about 10 seconds...") or edit it out in post
- **Navigation**: Use Obsidian's back button or click the meeting note tab to return. Don't use browser-style navigation
- **Entity filenames**: Check actual filenames after import - AI might name them slightly differently than expected
- **Practice Scene 5**: Entity extraction is the "wow" moment - practice opening entity notes smoothly
- **Graph View**: Practice navigating the graph view smoothly - pan, zoom, and hover to show connections. This is a powerful visual moment

---

## Post-Production

### Recommended Edits

1. **Trim loading time** - Cut or speed up any waiting
2. **Add text overlays** - Label each feature as it appears
3. **Add subtle background music** - Upbeat but not distracting
4. **Add cursor highlight** - Make clicks visible
5. **Export as:**
   - MP4 for YouTube/website embed
   - GIF (15-20 sec version) for README/Reddit

### Text Overlays to Add

| Scene | Overlay Text |
|-------|--------------|
| Scene 2 (Import) | `📥 Import from Otter, Fireflies, Zoom...` |
| Scene 3 (Result) | `📝 Clean Markdown with frontmatter` |
| Scene 3 (Links) | `🔗 Auto-linked to your vault` |
| Scene 4 (Summary) | `🤖 AI-generated summary` |
| Scene 4 (Actions) | `✅ Action items with owners` |
| Scene 5 (Entities) | `📊 Entity extraction (Pro)` |
| Scene 5 (Folders) | `Issues • Updates • Topics` |
| Scene 5b (Graph) | `🕸️ Watch your graph grow` |
| Scene 5b (Graph) | `Every meeting adds connections` |
| Scene 6 (Close) | `Your knowledge graph builds itself` |

---

## Alternative: GIF-Only Demo (15-20 seconds)

If you just want a quick GIF for the README:

1. **Start:** File picker selecting transcript
2. **Middle:** Processing indicator
3. **End:** Scroll through generated note showing linked participants and AI sections

Use a tool like [Gifski](https://gif.ski/) or [LICEcap](https://www.cockos.com/licecap/) to record.

---

## Sample Voiceover Script (Full)

Read this naturally—don't rush. Pauses are your friend.

```
[0:00] You've got your Obsidian vault—projects, people, ideas all connected.

[0:05] But your meetings? They're stuck in Otter or Fireflies, 
       disconnected from everything else.

[0:12] MeetingMind brings them into your vault.

[0:16] This takes about 10 seconds...

[0:26] Let me import a few more meetings to show you how it builds...

[0:30] Different meeting types, different lengths, different people...

[0:35] Watch what happens.

[0:38] Now watch this.

[0:40] Each meeting automatically links to participant notes.

[0:45] And look - Maya's note shows all her meetings. Monday standup, 
       feature discussion, Wednesday standup...

[0:52] Your people notes track their entire meeting history.

[0:56] Different meetings, different combinations of people -

[1:00] But everyone's connected. Your knowledge graph builds itself.

[1:05] You get summaries, action items, decisions—

[1:09] —all extracted automatically.

[1:12] Works for quick standups—

[1:15] —and deep dives. The AI adapts to the meeting type.

[1:20] But here's what makes it powerful—

[1:24] It doesn't just link to existing notes. It creates new ones.

[1:30] Issues mentioned across different meetings—

[1:34] —get tracked automatically. Same issue, different meetings, all connected.

[1:40] Topics evolve across meetings. Your knowledge graph builds itself.

[1:45] But here's the best part—

[1:48] Watch your graph grow.

[1:51] Every meeting adds new nodes. Every participant becomes a hub. Every issue, every topic—

[1:57] —all connected. Your knowledge graph builds itself, visually.

[2:02] Click any node, see everything connected. Your meetings aren't isolated—they're part of a living network.

[2:08] Four meetings. Different types, different people, different lengths.

[2:12] But look what you get—

[2:15] A complete knowledge graph. Meetings that actually connect—and build—your vault.
```

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
- **Import sequence:** Import all 4 meetings before recording, or plan to speed up the import sequence significantly in post-production
- **Entity extraction:** Make sure entity extraction creates multiple entity notes across the different meetings so the demo looks impressive
- **Participant notes:** Before recording, verify that participant notes show multiple meetings linked (especially Maya and Chris who appear in multiple meetings)
- **Graph view:** Practice navigating the graph view smoothly:
  - Know how to switch to graph view quickly (Cmd+G)
  - Practice panning and zooming to show different parts of the graph
  - Test hovering over nodes to highlight connections
  - Consider using graph view filters to highlight specific node types (meetings, people, entities)
- **Before recording:** Do a test import of all 4 meetings and note:
  - Actual entity filenames so you know what to click
  - Which participants appear in which meetings
  - Which entities are mentioned across multiple meetings
  - How the graph looks after all imports - identify good nodes to hover/click
- **Processing time:** Plan to edit out or speed up the import sequence - showing 4 imports in real-time would be too long
- **Navigation practice:** Practice clicking through participant links and entity notes smoothly - this is the key demo moment
- **Graph view timing:** The graph view scene (5b) is a powerful visual moment - make sure it's smooth and shows the connections clearly

Good luck! 🎬

