# Demo Files

This folder contains everything needed to record the MeetingMind demo video.

## Scenario: "The New Hire"

You're Patrick, a senior software engineer starting at a new company. Your team has a lot of moving parts—projects, issues, and people you haven't met yet. You have recordings from your first week of meetings.

## The Cast

| Name | Role |
|------|------|
| **You (Patrick Tumbucon)** | New Senior Engineer |
| **Michael Kim** | Engineering Manager |
| **Sam Chen** | Tech Lead |
| **Priya Sharma** | Frontend Engineer |
| **Marcus Williams** | Backend Engineer |
| **Riley O'Brien** | DevOps |

## Transcript Files

| File | Meeting Type | Duration | Attendees |
|------|--------------|----------|-----------|
| `01-monday-standup.json` | Daily Standup | 12 min | Sam, Priya, Marcus, Riley |
| `02-architecture-review.json` | Technical Review | 35 min | Sam, Marcus, Riley |
| `03-wednesday-standup.json` | Daily Standup | 10 min | Sam, Priya, Marcus |
| `04-manager-1on1.json` | 1:1 | 28 min | Michael, Patrick |

## Key Content Across Meetings

**Projects/Topics:**
- Platform Migration (the big Q2 initiative)
- Checkout Service (being redesigned)
- Metrics Dashboard (Priya's domain)
- Auth Service (has issues)

**Issues:**
- Auth Token Refresh Bug (causes cart abandonment)
- CI Pipeline Slowdown (Riley is fixing)

## Vault Structure

The `vault/` folder contains the initial state for the demo:

```
vault/
├── Platform Migration.md    # Project stub
└── People/                  # Empty (populated by MeetingMind)
```

## Usage

### 1. Reset the Demo Vault

```bash
# Reset to a specific path
./reset-vault.sh /path/to/your/demo-vault

# Or use default path
./reset-vault.sh
```

### 2. Configure MeetingMind

In Obsidian settings:
- **Output folder:** `Meetings`
- **People folder:** `People`
- **AI enrichment:** Enabled
- **Entity extraction:** Enabled

### 3. Import Transcripts

Use `MeetingMind: Import file` command to import each transcript:
1. `01-monday-standup.json`
2. `02-architecture-review.json`
3. `03-wednesday-standup.json`
4. `04-manager-1on1.json`

### 4. Expected Results

After importing all 4 meetings, you should have:

```
Demo Vault/
├── Meetings/
│   ├── Monday Standup.md
│   ├── Architecture Review - Checkout Service.md
│   ├── Wednesday Standup.md
│   └── 1-1 with Michael.md
├── People/
│   ├── Michael Kim.md
│   ├── Patrick Tumbucon.md
│   ├── Sam Chen.md
│   ├── Priya Sharma.md
│   ├── Marcus Williams.md
│   ├── Riley O'Brien.md
│   └── Patrick Tumbucon.md
├── Issues/
│   ├── Auth Token Refresh Bug.md
│   └── CI Pipeline Slowdown.md
├── Topics/
│   ├── Checkout Service.md
│   ├── Metrics Dashboard.md
│   ├── Platform Migration.md (or linked to existing)
│   └── ...
└── Platform Migration.md
```

## Demo Script

See `DEMO-SCRIPT.md` in the `docs/demos/` folder for the full recording script.
