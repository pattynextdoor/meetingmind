# MeetingMind for Obsidian

**Transform meeting transcripts into connected knowledge.**

MeetingMind is an Obsidian plugin that automatically imports meeting transcripts into your vault with AI-powered enrichment and intelligent auto-linking. Bridge the gap between meeting recording tools and personal knowledge management.

## Features

### 📥 Multi-Source Import
- **Otter.ai Support**: Export transcripts from Otter.ai and drop them in your watched folder
- **Folder Watcher**: Automatically import transcripts dropped into a watched folder
- **Manual Import**: Import individual files via command palette
- **Supported Formats**: VTT, SRT, TXT, JSON

### 🤖 AI Enrichment (Pro)
- **Summary Generation**: 2-4 sentence meeting summaries
- **Action Item Extraction**: Automatic task detection with assigned owners
- **Decision Extraction**: Capture key decisions made during meetings
- **Tag Suggestions**: AI-recommended tags based on your existing vault tags
- **Participant Insights**: AI-generated insights per participant
- **BYOK**: Bring your own Claude or OpenAI API key

### 🔗 Auto-Linking
- **Intelligent Linking**: Automatically create `[[wiki-links]]` to existing notes
- **Alias Support**: Match note titles, explicit aliases, and implicit aliases
- **Disambiguation**: Handle ambiguous references gracefully
- **Suggested Links**: Surface potential links for manual resolution

### 👥 Participant Tracking
- **Auto-Create Notes**: Automatically create notes for meeting participants
- **Meeting History**: Track meetings per person
- **Update Existing**: Add meeting references to existing participant notes

### 📝 Smart Formatting
- **Structured Output**: Clean Markdown with YAML frontmatter
- **Collapsible Transcripts**: Full transcript in expandable callout
- **Dataview Compatible**: Frontmatter works with Dataview queries

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
| `MeetingMind: Rebuild vault index` | Re-index notes for auto-linking |
| `MeetingMind: View sync log` | Show recent sync activity |
| `MeetingMind: Clear import history` | Allow re-importing transcripts |

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Multi-format parsing, auto-linking, folder watcher, participant tracking, Dataview-ready output |
| **Pro** | $25 one-time | + AI summaries, action items, decisions, tag suggestions, participant insights (BYOK) |

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

## Requirements

- Obsidian 1.4.0 or later
- Desktop only (macOS, Windows, Linux)

## Support

- [GitHub Issues](https://github.com/pattynextdoor/meetingmind/issues)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ♥ by [Patrick Tumbucon](https://github.com/pattynextdoor)
