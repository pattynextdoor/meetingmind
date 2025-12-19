# Demo Assets

Ready-to-use artifacts for recording the MeetingMind demo video.

## Scenario

A small startup team planning the launch of **Cadence**, a mobile productivity app. The meeting covers:
- Feature status updates
- Blocker discussion (OAuth integration)
- New feature proposal (onboarding tutorial)
- Marketing/waitlist update
- Pricing decision (freemium model)
- Action item assignment

## Files

```
demo/
├── transcript.json          # The meeting transcript to import
├── vault/                   # Pre-made vault notes
│   ├── Cadence.md           # Project note (will be auto-linked)
│   └── People/              # Participant notes
│       ├── Maya Rodriguez.md    # Product Lead
│       ├── Chris Park.md        # Lead Developer
│       ├── Aisha Patel.md       # Product Designer
│       └── Derek Nguyen.md      # Marketing Lead
└── README.md                # This file
```

## Setup

1. Create a fresh Obsidian vault for the demo
2. Copy everything from `vault/` into the vault:
   ```bash
   cp -r vault/* /path/to/demo-vault/
   ```
   This will copy:
   - `Cadence.md` to the vault root
   - `People/` folder with all participant notes
3. Install and configure MeetingMind
4. Import `transcript.json`

## What the AI Should Extract

**Summary:** Team meeting to plan Cadence app launch in 3 weeks. Discussed feature progress, OAuth blocker, adding an onboarding tutorial, marketing waitlist traction, and decided on freemium pricing model.

**Action Items:**
- Chris: Finish OAuth by Friday
- Chris: Tutorial feature by Wednesday
- Chris: Release candidate by Tuesday
- Chris: Set up in-app purchases
- Aisha: Tutorial designs by Monday
- Aisha: Press kit by Thursday
- Aisha: App store screenshots by Friday
- Derek: Ramp up ads next week
- Derek: Start reviewer outreach

**Decisions:**
- Freemium model: free basic tier, $5/month or $40/year for premium
- Tutorial overlay will be added for first-time users
- Press kit to be created for reviewer outreach

## Auto-Link Targets

The transcript mentions these, which should link to vault notes:
- "Cadence app" → `[[Cadence]]`
- All four participant names → their respective notes

