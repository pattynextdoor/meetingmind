# MeetingMind Demo Recording Script

## Overview
**Target length:** 50-60 seconds  
**Format:** Screen recording with your voiceover  
**Vibe:** Casual, like showing a friend—not a sales pitch  
**Tools needed:** Screen recorder (OBS, QuickTime, or Loom), Obsidian, MeetingMind installed

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

**Demo transcript:** `test-files/demo/transcript.json`

### 2. MeetingMind Settings

Before recording, configure these settings:
- **Output folder:** `Meetings` (will be auto-created on first import)
- **People folder:** `People` (default, will be auto-created on first import)
- **AI enrichment:** Enabled (with your API key)
- **Auto-linking:** Enabled
- **Participant notes:** Enabled

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

### Scene 2: The Import (8 seconds)

**Show:** Command palette

**Action:** Cmd+P → "MeetingMind: Import file" → select transcript

**Voiceover:**
> "MeetingMind brings them into your vault."

**Action:** Brief processing flash

---

### Scene 3: The Connection (15 seconds)

**Show:** The generated meeting note appears

**Voiceover:**
> "Now watch this."

**Action:** Point cursor at `[[Cadence]]` link, hover to show preview

> "The meeting automatically links to your project note."

**Action:** Click `[[Cadence]]` → project note opens showing team members

> "And your people notes..."

**Action:** Navigate back, click `[[Maya Rodriguez]]`

> "All connected. Your meetings become part of your knowledge graph."

---

### Scene 4: The Value (12 seconds)

**Scroll through the meeting note:**

**Voiceover:**
> "You get summaries, action items, decisions—"

**Action:** Show action items section

> "—but more importantly, they're linked to everything else."

**Action:** Show participant links, project links

> "No more siloed meeting notes. Everything connects."

---

### Scene 5: Close (5 seconds)

**Show:** Graph view or vault overview showing the meeting connected

**Voiceover:**
> "That's MeetingMind. Meetings that actually connect to your vault."

**Text overlay:** 
```
MeetingMind for Obsidian
Free core • $25 Pro (one-time)
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
| Scene 4 (Summary) | `🤖 AI-generated summary` |
| Scene 4 (Actions) | `✅ Action items with owners` |
| Scene 4 (Decisions) | `🎯 Decisions captured` |
| Scene 5 (Links) | `🔗 Auto-linked to your vault` |

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

[0:16] Now watch this.

[0:18] The meeting automatically links to your project note.

[0:22] And your people notes...

[0:25] All connected. Your meetings become part of your knowledge graph.

[0:31] You get summaries, action items, decisions—

[0:35] —but more importantly, they're linked to everything else.

[0:40] No more siloed meeting notes. Everything connects.

[0:46] That's MeetingMind. Meetings that actually connect to your vault.
```

**Tips for natural delivery:**
- Talk like you're showing a friend, not presenting
- Emphasize "connected" and "links" - that's the unique value
- Let yourself breathe between sentences  
- It's okay to say "um" once or twice—keeps it human
- Smile while you talk (it comes through in your voice)

---

## Ready to Record?

1. ☐ Test vault set up with sample notes
2. ☐ MeetingMind configured and tested  
3. ☐ Screen recorder ready
4. ☐ Obsidian theme clean and fonts readable
5. ☐ Read through script once
6. ☐ Do a practice run
7. ☐ Hit record!

Good luck! 🎬

