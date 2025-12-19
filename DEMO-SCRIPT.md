# MeetingMind Demo Recording Script

## Overview
**Target length:** 70-80 seconds (with processing time)  
**Actual length:** 65-75 seconds (after editing out wait times)  
**Format:** Screen recording with your voiceover  
**Vibe:** Casual, like showing a friend—not a sales pitch  
**Tools needed:** Screen recorder (OBS, QuickTime, or Loom), Obsidian, MeetingMind installed

**Note:** AI processing takes 10-30 seconds. Either acknowledge this in voiceover or edit it out in post-production.

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

**Demo transcript:** `test-files/demo/transcript-with-entities.json` (includes issues, updates, topics)

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

### Scene 1: The Obsidian Context (8 seconds)

**Show:** Obsidian vault with existing notes visible in file explorer:
- `Cadence.md` (project note)
- `People/` folder with participant notes

**Voiceover:**
> "You've got your Obsidian vault—projects, people, ideas all connected."

**Action:** Click on `Cadence.md` to show it's a real note with content

> "But your meetings? They're stuck in Otter or Fireflies, disconnected from everything else."

---

### Scene 2: The Import (10-12 seconds)

**Show:** Command palette

**Action:** Cmd+P → "MeetingMind: Import file" → select transcript

**Voiceover:**
> "MeetingMind brings them into your vault."

**Action:** Show status bar or processing indicator
> "This takes about 10 seconds..."

**Note:** In post-production, you can speed up or cut the waiting time. The actual processing includes AI enrichment and entity extraction.

---

### Scene 3: The Connection (18-20 seconds)

**Show:** The generated meeting note appears

**Voiceover:**
> "Now watch this."

**Action:** Scroll to participant section, point cursor at `[[Cadence]]` link, hover to show preview

> "The meeting automatically links to your project note."

**Action:** Click `[[Cadence]]` → project note opens showing team members

> "And your people notes..."

**Action:** Click the meeting note tab to return (or use Obsidian's back button), scroll to participant links section

**Action:** Click `[[Maya Rodriguez]]` from the meeting note

> "All connected. Your meetings become part of your knowledge graph."

---

### Scene 4: The AI Value (10 seconds)

**Scroll through the meeting note:**

**Voiceover:**
> "You get summaries, action items, decisions—"

**Action:** Show action items section, decisions section

> "—all extracted automatically."

---

### Scene 5: Entity Extraction - The Magic (18-20 seconds)

**Show:** File explorer, scroll to show entity folders

**Voiceover:**
> "But here's what makes it powerful—"

**Action:** Expand `Issues/` folder to show notes inside (or scroll to see notes)

> "It doesn't just link to existing notes. It creates new ones."

**Action:** Click on the first issue note (check actual filename after import - might be "OAuth integration with Google" or similar)

> "Issues, updates, topics mentioned in meetings—"

**Action:** Show the entity note, scroll to "Related Meetings" section showing the meeting link

> "—automatically become part of your vault. Your knowledge graph builds itself."

---

### Scene 6: Close (5 seconds)

**Show:** Pull back to show vault structure with meetings, people, and entities

**Voiceover:**
> "That's MeetingMind. Meetings that actually connect—and build—your vault."

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

[0:26] Now watch this.

[0:28] The meeting automatically links to your project note.

[0:32] And your people notes...

[0:36] All connected. Your meetings become part of your knowledge graph.

[0:40] You get summaries, action items, decisions—

[0:44] —all extracted automatically.

[0:48] But here's what makes it powerful—

[0:52] It doesn't just link to existing notes. It creates new ones.

[0:58] Issues, updates, topics mentioned in meetings—

[1:03] —automatically become part of your vault. 

[1:08] Your knowledge graph builds itself.

[1:13] That's MeetingMind. Meetings that actually connect—and build—your vault.
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
4. ☐ Use `transcript-with-entities.json` for demo
5. ☐ Screen recorder ready
6. ☐ Obsidian theme clean and fonts readable
7. ☐ Read through script once
8. ☐ Do a practice run (especially Scene 5 - entity extraction)
9. ☐ Hit record!

**Pro Tips:**
- Make sure entity extraction creates at least 2-3 entity notes so the demo looks impressive
- The `transcript-with-entities.json` should generate multiple entities
- **Before recording:** Do a test import and note the actual entity filenames so you know what to click
- **Processing time:** Either acknowledge it in voiceover or plan to edit it out (speeding up or cutting)
- **Navigation practice:** Practice clicking through links and using Obsidian's back button smoothly

Good luck! 🎬

