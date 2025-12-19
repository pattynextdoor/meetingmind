# Settings Overview

All MeetingMind settings are in **Settings → MeetingMind**.

## Sections

### 📥 Sources
Configure where transcripts come from:
- [Otter.ai sync](/features/otter-sync)
- [Folder watcher](/features/folder-watcher)

### 📁 Output
Control where and how notes are saved:
- Destination folder
- Filename template

### 🤖 AI Enrichment (Pro)
Configure AI-powered features:
- Provider selection (Claude/OpenAI)
- API key
- Feature toggles

### 🔗 Auto-Linking
Control automatic wiki-linking:
- Enable/disable
- Implicit aliases
- Exclusions

### 👥 Participants
Manage participant note creation:
- Auto-create toggle
- People folder
- Update existing notes

### 🏷️ Entity Extraction (Pro)
Configure automatic entity extraction:
- Issues, topics, and updates
- Folder locations
- Auto-archive settings

### 🔑 License
Manage your Pro license:
- Enter license key
- View status
- Upgrade link

## Quick Reference

| Setting | Location | Default |
|---------|----------|---------|
| Watch folder | Sources | (empty) |
| Output folder | Output | Meetings |
| AI Provider | AI Enrichment | Claude |
| Auto-linking | Auto-Linking | On |
| People folder | Participants | People |
| Extract entities | Entity Extraction | Off |
| Issues folder | Entity Extraction | Issues |
| Topics folder | Entity Extraction | Topics |
| Issue archive days | Entity Extraction | 30 |

## Detailed Settings

### Entity Extraction (Pro)

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-extract entities | Master toggle for entity extraction | Off |
| Extract issues | Create notes for blockers and problems | On |
| Extract updates | Extract updates for participant notes | On |
| Extract topics | Create notes for concepts and themes | On |
| Issues folder | Where issue notes are created | `Issues` |
| Topics folder | Where topic notes are created | `Topics` |
| Issue archive days | Days before archiving resolved issues | 30 |

**Notes:**
- Requires Pro license and AI enrichment enabled
- Updates are tracked on participant notes (no separate notes created)
- Resolved issues are automatically archived after the configured days
- Use command `MeetingMind: Archive resolved issues` to manually trigger archiving

