<div align="center">
  <img src="logo.svg" alt="MeetingMind Logo" width="120" height="120" />
  <h1>MeetingMind for Obsidian</h1>
  <p><strong>Stop copy-pasting transcripts. MeetingMind turns your raw meeting transcripts into linked, actionable Obsidian notes automatically.</strong></p>
</div>

MeetingMind is an Obsidian plugin that automatically imports meeting transcripts into your vault with AI-powered enrichment and intelligent auto-linking. Bridge the gap between meeting recording tools and personal knowledge management.

## Features

### 📥 Multi-Source Import
- **Fireflies.ai Sync**: Direct API integration - automatically sync transcripts
- **Meeting Tool Exports**: Export from Otter.ai, Fathom, Zoom, and more
- **Folder Watcher**: Automatically import transcripts dropped into a watched folder
- **Manual Import**: Import individual files via command palette
- **Supported Formats**: VTT, SRT, TXT, JSON

### 🤖 Context-Aware AI Enrichment (Pro)
*MeetingMind's AI understands your vault structure and creates notes that integrate seamlessly with your existing knowledge base.*

- **Vault-Aware Summaries**: 2-4 sentence meeting summaries that reference your existing notes (e.g., "Discussed timeline for the [[Enrollment API]] v2 migration")
- **Action Item Extraction**: Automatic task detection with assigned owners, ready for task management plugins
- **Decision Extraction**: Capture key decisions made during meetings
- **Smart Tag Suggestions**: AI-recommended tags based on your existing vault tags—learns from your tagging patterns
- **Participant Insights**: AI-generated insights per participant, automatically linked to their notes
- **Entity Extraction**: Auto-create notes for issues, updates, and topics mentioned—builds your knowledge graph automatically
- **Your Data, Your Keys**: Use your own API keys (Claude or OpenAI) for full privacy control

### 🔗 Auto-Linking
*Automatically connects meeting content to your existing notes—no manual linking required.*

- **Intelligent Linking**: Automatically creates `[[wiki-links]]` to existing notes in your vault
  - *Example*: "Sarah mentioned the Phoenix Project" → `[[Sarah]] mentioned the [[Phoenix Project]]` (if those notes exist)
- **Alias Support**: Matches note titles, explicit aliases, and implicit aliases
- **Disambiguation**: Handles ambiguous references gracefully
- **Suggested Links**: Surfaces potential links for manual resolution when confidence is low

### 👥 Participant Tracking
- **Auto-Create Notes**: Automatically create notes for meeting participants
- **Meeting History**: Track meetings per person
- **Update Existing**: Add meeting references to existing participant notes

### 📝 Smart Formatting
- **Structured Output**: Clean Markdown with YAML frontmatter
- **Collapsible Transcripts**: Full transcript in expandable callout
- **Dataview Compatible**: Frontmatter works with Dataview queries

### 📊 Meeting Dashboard
- **Visual Insights**: Generate a stats dashboard showing meeting frequency, participant activity, and open action items
- **At-a-Glance Overview**: See your meeting patterns and track follow-ups across all meetings

## Installation

### From Obsidian Community Plugins
1. Open Settings → Community Plugins
2. Search for "MeetingMind"
3. Install and enable

### Manual Installation
1. Download the latest release from GitHub
2. Extract to `.obsidian/plugins/meetingmind/`
3. Enable in Settings → Community Plugins

## Quick Start

1. **Enable the plugin** in Obsidian settings
2. **Configure a source**:
   - Enable folder watcher and set a watch folder
   - Export transcripts from Otter.ai (or other tools) to your watched folder
3. **Configure AI** (optional, requires Pro):
   - Choose Claude or OpenAI
   - Enter your API key
4. **Import a transcript**:
   - Drop a file in the watched folder, or
   - Use `MeetingMind: Import file` command

## Example Output

```markdown
---
date: 2025-01-15
duration: 47
participants:
  - "[[Sarah Chen]]"
  - "[[Marcus Webb]]"
  - "[[Patrick]]"
source: otter
tags: [engineering, api, migration]
---

## Summary
Discussed timeline for the [[Enrollment API]] v2 migration.
Team decided to maintain backward compatibility through Q1.

## Action Items
- [ ] Draft deprecation timeline (@Patrick, due: Jan 20)
- [ ] Audit downstream consumers (@Marcus)
- [ ] Schedule partner communication sync (@Sarah)

## Decisions
- Keep v1 API available through end of Q1
- Prioritize mobile clients for v2 migration support

## Transcript
> [!note]- Full transcript (click to expand)
> 
> **Sarah Chen** (00:00): Alright, let's get started...
```

## Commands

| Command | Description |
|---------|-------------|
| `MeetingMind: Import file` | Import a transcript file manually |
| `MeetingMind: Reprocess current note` | Re-run AI enrichment and auto-linking on the active meeting note |
| `MeetingMind: Generate meeting dashboard` | Create/update a visual stats dashboard with meeting insights, recent meetings, and open action items |
| `MeetingMind: Update dashboard` | Refresh the meeting dashboard |
| `MeetingMind: Rebuild vault index` | Re-index notes for auto-linking |
| `MeetingMind: Cleanup orphaned references` | Remove references to deleted meeting files from participant and entity notes |
| `MeetingMind: View sync log` | Show recent sync activity |
| `MeetingMind: Clear import history` | Allow re-importing transcripts |

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Multi-format parsing, auto-linking, folder watcher, participant tracking, meeting dashboard, Dataview-ready output |
| **Pro** | $39 one-time | + Context-aware AI summaries, action items, decisions, vault-aware tag suggestions, participant insights, entity extraction. Uses your own API keys for full privacy control. |

[Get Pro License](https://tumbucon.gumroad.com/l/meetingmind-pro)

## Development

```bash
# Install dependencies
npm install

# Build for development (watch mode)
npm run dev

# Build for production
npm run build
```

## Network Usage & Privacy

This plugin connects to the following external services:

| Service | URL | Purpose |
|---------|-----|---------|
| **Fireflies.ai API** | `api.fireflies.ai` | Sync transcripts (when enabled) |
| **Gumroad API** | `api.gumroad.com` | Validates Pro license keys |
| **Anthropic API** | `api.anthropic.com` | AI processing when Claude is selected (Pro) |
| **OpenAI API** | `api.openai.com` | AI processing when GPT-4 is selected (Pro) |

**Privacy First**: Your transcript content is sent to AI providers (OpenAI/Anthropic) only when AI enrichment is enabled, and only using your own API keys. No data is collected or stored by MeetingMind itself—your vault stays private.

## Requirements

- Obsidian 1.4.0 or later
- Desktop only (macOS, Windows, Linux)

## Support

- [GitHub Issues](https://github.com/pattynextdoor/meetingmind/issues)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ♥ by [Patrick Tumbucon](https://github.com/pattynextdoor)
