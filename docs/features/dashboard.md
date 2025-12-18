# Meeting Dashboard

Generate a comprehensive statistics dashboard to understand your meeting patterns.

## Quick Start

Run `MeetingMind: Generate meeting dashboard` from the command palette (Cmd/Ctrl + P).

This creates (or updates) a `Meeting Dashboard.md` file in your Meetings folder.

## What's Included

### 📊 Overview
- Total meetings (all time)
- Meetings this month, week, and today
- At-a-glance activity summary

### ⏱️ Time Investment
- Total time spent in meetings
- Average meeting duration
- Longest and shortest meetings

### 👥 Top Collaborators
- People you meet with most frequently
- Unique participant count
- Average participants per meeting
- All names are wiki-linked for easy navigation

### 📅 Meeting Patterns
- Busiest and quietest days of the week
- Meeting count by day with visual bars
- Average duration per day

### 📈 Monthly Trend
- Last 6 months of meeting activity
- Visual chart showing trends over time

### 📥 Import Sources
- Breakdown by source (Fireflies.ai, folder watch, etc.)
- Percentage of meetings from each source

### 🕐 Recent Meetings
- Last 5 meetings with quick links
- Date, duration, and participants at a glance

## Example Dashboard

```markdown
# 📊 Meeting Dashboard

*Last updated: Thursday, December 18, 2025 at 2:30 PM*

## Overview

| Metric | Value |
|--------|-------|
| **Total Meetings** | 147 |
| **This Month** | 23 |
| **This Week** | 6 |
| **Today** | 2 |

## ⏱️ Time Investment

| Metric | Value |
|--------|-------|
| **Total Time** | 89h 30m |
| **Average Duration** | 36 min |
| **Longest Meeting** | 135 min (Q4 Planning) |

## 👥 Top Collaborators

| Person | Meetings |
|--------|----------|
| [[Sarah Chen]] | 12 |
| [[Marcus Webb]] | 8 |
| [[Engineering Team]] | 6 |

*24 unique participants • 3.2 avg per meeting*

## 📅 Meeting Patterns

**Busiest Day:** Tuesday
**Quietest Day:** Friday

| Day | Meetings | Avg Duration |
|-----|----------|--------------|
| Monday | 18 ██████ | 42m |
| Tuesday | 34 ██████████ | 38m |
| Wednesday | 28 ████████ | 35m |
| Thursday | 25 ███████ | 40m |
| Friday | 12 ████ | 30m |
```

## Keeping It Updated

The dashboard doesn't auto-update. Run either command to refresh:

- `MeetingMind: Generate meeting dashboard`
- `MeetingMind: Update dashboard`

Both commands do the same thing—regenerate the dashboard with current data.

## Tips

- **Pin the dashboard** - Right-click the tab → Pin for quick access
- **Add to favorites** - Star it in your file explorer
- **Use with Dataview** - The dashboard complements Dataview queries; use both for different views
- **Schedule updates** - Run the command weekly or after importing new meetings

## Requirements

The dashboard analyzes notes that have meeting-like frontmatter:

```yaml
---
date: 2025-12-18
duration: 45
participants:
  - "[[Sarah Chen]]"
  - "[[Marcus Webb]]"
source: fireflies
---
```

Notes without this frontmatter won't be included in statistics.

