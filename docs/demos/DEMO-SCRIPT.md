# MeetingMind Demo Recording Script

> **📝 Scenario: The New Hire**  
> You're Alex, a senior software engineer starting at a new company. Your team has a lot of moving parts—ongoing projects, open issues, and people you haven't met yet. You have recordings from your first week: 2 standups, an architecture review, and your 1:1 with your new manager. Let's see how MeetingMind helps you get up to speed.

## Overview

**Target length:** 60-90 seconds  
**Format:** Record actions first, add voiceover in post-production  
**Vibe:** "Getting up to speed on a new team"—relatable, practical  
**Tools needed:** Screen recorder, Obsidian, MeetingMind installed, video editor

---

## The Cast

| Name | Role | Notes |
|------|------|-------|
| **You (Alex)** | New Senior Engineer | The viewer's POV |
| **Jordan Kim** | Engineering Manager | Your new manager |
| **Sam Chen** | Tech Lead | Leads the Platform Migration |
| **Priya Sharma** | Frontend Engineer | Owns the Metrics Dashboard |
| **Marcus Williams** | Backend Engineer | Working on Checkout Service |
| **Riley O'Brien** | DevOps | Handles CI/CD, deployment |

## The Meetings

| File | Type | Duration | Attendees | Key Content |
|------|------|----------|-----------|-------------|
| `monday-standup.json` | Daily Standup | 12 min | Sam, Priya, Marcus, Riley | Platform Migration status, CI slowdown issue |
| `architecture-review.json` | Technical Review | 35 min | Sam, Marcus, Riley | Checkout Service redesign, Auth Service issues |
| `wednesday-standup.json` | Daily Standup | 10 min | Sam, Priya, Marcus | Metrics Dashboard progress, blockers |
| `manager-1on1.json` | 1:1 | 28 min | Jordan | Onboarding, team context, expectations |

---

## Pre-Recording Setup

### 1. Prepare Your Demo Vault

Create a fresh vault with minimal existing notes:

```
Demo Vault/
├── Platform Migration.md     # Project note (just a stub)
└── People/
    └── (empty - will be created by MeetingMind)
```

**Note:** Keep the vault minimal to show the "before" state clearly.

### 2. Demo Transcript Files

The transcript files are in `test-files/demo/`:

| File | Meeting Type |
|------|--------------|
| `01-monday-standup.json` | Monday standup with the team |
| `02-architecture-review.json` | Checkout Service architecture review |
| `03-wednesday-standup.json` | Wednesday standup |
| `04-manager-1on1.json` | 1:1 with your new manager |

To reset the demo vault to a clean state:

```bash
cd test-files/demo
./reset-vault.sh /path/to/your/demo-vault
```

### 3. MeetingMind Settings

- **Output folder:** `Meetings`
- **People folder:** `People`
- **AI enrichment:** Enabled
- **Auto-linking:** Enabled
- **Entity extraction:** Enabled

### 4. Screen Setup

- **Resolution:** 1920×1080 or higher
- **Obsidian theme:** Clean theme (Minimal or default)
- **Font size:** Slightly larger for readability
- **File explorer:** Visible on left

---

## Part 1: Action Recording Script

Record these actions—no voiceover needed. Take your time; you'll edit in post.

### Scene 1: The Problem (5-7 seconds)

**What you're showing:** A new hire overwhelmed by lack of context.

**Actions:**
1. Show an empty/sparse Obsidian vault in the file explorer
   - Just `Platform Migration.md` and empty `People/` folder visible
2. Open `Platform Migration.md`—it's just a stub with minimal info
3. Pause briefly (you'll add voiceover here about being lost)

**Text overlay to add in post:** `Week 1 at a new job...`

---

### Scene 2: The Import (8-10 seconds)

**What you're showing:** Bulk importing your first week of meetings.

**Actions:**
1. Open command palette (Cmd+P)
2. Type "MeetingMind: Import file"
3. Navigate to `test-files/demo/` and select all 4 meeting files (or import them rapidly one-by-one):
   - `01-monday-standup.json`
   - `02-architecture-review.json`
   - `03-wednesday-standup.json`
   - `04-manager-1on1.json`
4. **Cut out processing time** in post—jump to results
5. Show file explorer: `Meetings/` folder now has 4 notes

**Text overlays to add in post:**
- `📥 Import your meetings`
- `Otter • Fireflies • Zoom • Fathom`

---

### Scene 3: Understanding the Team (12-15 seconds)

**What you're showing:** MeetingMind auto-creates participant notes.

**Actions:**
1. Open the `1:1 with Jordan` meeting note
2. Scroll to show AI-generated summary—it mentions the Platform Migration and your role
3. Show participant link: `[[Jordan Kim]]`
4. Click `[[Jordan Kim]]` → Jordan's participant note opens
5. Show Jordan's note structure:
   - "Meetings" section with the 1:1 linked
6. Click back, open `Monday Standup` meeting note
7. Show participants: `[[Sam Chen]]`, `[[Priya Sharma]]`, `[[Marcus Williams]]`, `[[Riley O'Brien]]`
8. Click `[[Sam Chen]]` → Sam's participant note opens
9. Scroll to show "Meetings" section—multiple standups and the architecture review

**Text overlay to add in post:** `👥 Know your team instantly`

---

### Scene 4: Tracking Issues (15-18 seconds)

**What you're showing:** Entity extraction finds issues mentioned across meetings.

**Actions:**
1. Show file explorer—scroll to reveal `Issues/` folder
2. Expand `Issues/` folder—show notes inside:
   - `Auth Token Refresh Bug.md`
   - `CI Pipeline Slowdown.md`
3. Click `Auth Token Refresh Bug.md`
4. Show the issue note:
   - "Raised by" field linking to `[[Marcus Williams]]`
   - "Related Meetings" section showing multiple meetings where it was discussed
5. **Click `[[Marcus Williams]]`** to jump to his participant note
6. Scroll to "Raised Issues" section—show the Auth Token Refresh Bug is listed
7. Click back to the issue note
8. Go back to file explorer
9. Open `Topics/` folder, click a topic (e.g., `Checkout Service.md` or `Platform Migration.md`)
10. Show "Owner" field and related meetings

**Text overlays to add in post:**
- `📊 Issues tracked automatically`
- `Bidirectional links to people`

---

### Scene 5: The Knowledge Graph (12-15 seconds)

**What you're showing:** The visual payoff—a connected knowledge graph.

**Actions:**
1. Open Graph View (Cmd+G)
2. **PAUSE for 2 seconds**—let the graph sit
3. Pan/zoom slowly to show the network:
   - Meeting notes at the center
   - Participant notes clustered around meetings
   - Issue and topic notes connected to both
   - The `Platform Migration.md` note connected to multiple meetings
4. Hover over a node to highlight its connections
5. Zoom out to show the full structure

**Text overlays to add in post:**
- `🕸️ Your context, visualized`
- `Built from 4 meetings`

---

### Scene 6: The Payoff (5-7 seconds)

**What you're showing:** You now understand the team.

**Actions:**
1. Switch back to note view
2. In file explorer, collapse/expand folders to show structure:
   - `Meetings/` (4 notes)
   - `People/` (5 notes: Jordan, Sam, Priya, Marcus, Riley)
   - `Issues/` (2 notes)
   - `Topics/` (several notes)
3. Quick visual scan showing all the auto-generated notes
4. End on a clean view of the organized vault

**Text overlay to add in post:**
```
MeetingMind for Obsidian
Free core • $39 Pro (one-time)
```

---

## Part 2: Voiceover Script

Record this separately and sync to edited video.

### Scene 1: The Problem

> "First week at a new job. There's a platform migration, something called the Checkout Service, and a bug everyone keeps mentioning."

[Pause while showing sparse vault]

> "I have four meetings recorded. Let's see what I can learn."

### Scene 2: The Import

> "One click to import."

[During import sequence]

> "Standups, architecture reviews, my 1:1—all in."

### Scene 3: Understanding the Team

> "My manager Jordan explains the team structure—"

[When showing Jordan's note]

> "—and MeetingMind links everything automatically."

[When showing Sam's note with multiple meetings]

> "Sam's the tech lead. He's in every meeting. Now I know who to ask."

### Scene 4: Tracking Issues

> "But here's what I really needed—"

[When showing Issues folder]

> "Every issue mentioned across my meetings, pulled out automatically."

[When showing Auth Token Refresh Bug]

> "The auth bug everyone's talking about. Marcus raised it—"

[When clicking to Marcus's note]

> "—and I can see it from his perspective too. The links go both ways."

[When showing Topics]

> "Topics, owners, all connected."

### Scene 5: The Knowledge Graph

> "And here's the best part—"

[PAUSE while graph appears]

> "Four meetings. One week. And I already have a map of the team."

[While panning/zooming]

> "Who's working on what. What issues are open. How everything connects."

### Scene 6: The Payoff

> "I went from lost—"

[When showing organized vault]

> "—to knowing my team in one afternoon."

[Final beat]

> "That's MeetingMind."

---

## Part 3: Post-Production

### Editing Checklist

1. **Cut all processing time**—imports should feel instant
2. **Add text overlays** at each scene
3. **Smooth transitions** between scenes
4. **Sync voiceover** to edited actions
5. **Add subtle background music** (optional)

### Text Overlays

| Scene | Overlay | Timing |
|-------|---------|--------|
| 1 | `Week 1 at a new job...` | Opening |
| 2 | `📥 Import your meetings` | During import |
| 2 | `Otter • Fireflies • Zoom • Fathom` | Under import |
| 3 | `👥 Know your team instantly` | When showing participants |
| 4 | `📊 Issues tracked automatically` | When showing Issues folder |
| 4 | `Bidirectional links to people` | When clicking through |
| 5 | `🕸️ Your context, visualized` | When graph appears |
| 5 | `Built from 4 meetings` | During zoom out |
| 6 | CTA: `Free core • $39 Pro` | Final screen |

### Timing Guide

| Scene | Target Length | Notes |
|-------|--------------|-------|
| Scene 1 | 5-7 sec | Quick problem setup |
| Scene 2 | 8-10 sec | Fast imports (cut processing) |
| Scene 3 | 12-15 sec | Key demo moment—understanding people |
| Scene 4 | 15-18 sec | Magic moment—issues and bidirectional links |
| Scene 5 | 12-15 sec | Visual climax—let it breathe |
| Scene 6 | 5-7 sec | Quick CTA |
| **Total** | **60-75 sec** | Ideal for social sharing |

---

## Complete Voiceover Script (Timing Reference)

```
[0:00] First week at a new job. There's a platform migration, 
       something called the Checkout Service, and a bug everyone keeps mentioning.

[0:07] I have four meetings recorded. Let's see what I can learn.

[0:10] One click to import.

[0:12] Standups, architecture reviews, my 1:1—all in.

[0:16] My manager Jordan explains the team structure—

[0:19] —and MeetingMind links everything automatically.

[0:22] Sam's the tech lead. He's in every meeting. Now I know who to ask.

[0:27] But here's what I really needed—

[0:29] Every issue mentioned across my meetings, pulled out automatically.

[0:33] The auth bug everyone's talking about. Marcus raised it—

[0:37] —and I can see it from his perspective too. The links go both ways.

[0:42] Topics, owners, all connected.

[0:45] And here's the best part—

[0:48] [PAUSE - let graph sit]

[0:50] Four meetings. One week. And I already have a map of the team.

[0:55] Who's working on what. What issues are open. How everything connects.

[1:00] I went from lost—

[1:02] —to knowing my team in one afternoon.

[1:05] That's MeetingMind.
```

---

## Recording Tips

### Before Recording

- [ ] Create demo vault with minimal notes
- [ ] Create all 4 transcript JSON files
- [ ] Configure MeetingMind settings
- [ ] **Pre-import all meetings** (recommended)—record the import action, but have results ready to show
- [ ] Test entity extraction creates expected notes

### During Recording

- **Move slowly**—viewers need time to read
- **Pause on key moments**—participant links, issue notes, graph view
- **Smooth scrolling**—avoid jerky mouse movements
- **Multiple takes**—it's easier to edit with options

### Voiceover Tips

- **Conversational tone**—like telling a friend about your first week
- **Emphasize the transformation**—"lost → knowing my team"
- **Let graph view breathe**—pause for 2 seconds when it appears
- **Smile while talking**—it comes through in your voice

---

## Why This Scenario Works

1. **Relatable**: Everyone's been the new person on a team
2. **Practical**: Shows real use case—getting up to speed
3. **Story arc**: Problem (lost) → Solution (import) → Payoff (understanding)
4. **Variety**: Different meeting types show MeetingMind's flexibility
5. **Emotional**: The relief of finally understanding your new team
6. **Concise**: Four meetings tell a complete story

---

## Alternative: 30-Second Cut

For Twitter/TikTok, cut to essentials:

```
[0:00] First week at a new job. Four meetings. Let's get up to speed.

[0:05] [Import sequence—rapid fire]

[0:08] MeetingMind builds participant notes automatically.

[0:12] [Show Sam's note with multiple meetings]

[0:15] It finds issues mentioned across meetings—

[0:18] [Show Auth Token Refresh Bug with "Raised by" link]

[0:20] —and connects them to people.

[0:23] [Graph view appears]

[0:25] Four meetings. A complete map of the team.

[0:28] MeetingMind for Obsidian.
```

---

## Ready to Record?

### Pre-Recording Checklist

**Setup:**
- [ ] Demo vault created with minimal notes
- [ ] All 4 transcript files ready
- [ ] MeetingMind configured (AI, auto-linking, entities)
- [ ] Screen recorder ready
- [ ] Obsidian theme clean, fonts readable

**Practice:**
- [ ] Do a practice run through all 6 scenes
- [ ] Practice the entity flow: Issue → Person → back to Issue
- [ ] Practice graph view navigation
- [ ] Time your practice run (target: 60-75 seconds)

**Recording:**
- [ ] Record actions (no voiceover)
- [ ] Take multiple takes if needed
- [ ] Record voiceover separately

Good luck! 🎬
