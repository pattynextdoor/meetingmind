# MeetingMind for Obsidian

**Transform meeting transcripts into connected knowledge.**

MeetingMind is an Obsidian plugin that automatically imports meeting transcripts into your vault with AI-powered enrichment and intelligent auto-linking. Bridge the gap between meeting recording tools and personal knowledge management.

## Features

### 📥 Multi-Source Import
- **Otter.ai Integration**: Sync transcripts directly from your Otter.ai account via OAuth
- **Folder Watcher**: Automatically import transcripts dropped into a watched folder
- **Manual Import**: Import individual files via command palette
- **Supported Formats**: VTT, SRT, TXT, JSON

### 🤖 AI Enrichment
- **Summary Generation**: 2-4 sentence meeting summaries
- **Action Item Extraction**: Automatic task detection formatted as Obsidian tasks
- **Decision Extraction**: Capture key decisions made during meetings
- **Tag Suggestions**: AI-recommended tags based on content
- **BYOK Support**: Use your own Claude or OpenAI API key
- **Cloud Option**: Hosted AI processing (Pro + Cloud tier)

### 🔗 Auto-Linking
- **Intelligent Linking**: Automatically create `[[wiki-links]]` to existing notes
- **Alias Support**: Match note titles, explicit aliases, and implicit aliases
- **Disambiguation**: Handle ambiguous references gracefully
- **Suggested Links**: Surface potential links for manual resolution

### 📝 Smart Formatting
- **Structured Output**: Clean Markdown with YAML frontmatter
- **Collapsible Transcripts**: Full transcript in expandable callout
- **Dataview Compatible**: Frontmatter works with Dataview queries
- **Attendee Links**: Participants linked to people notes

## Installation

### From Obsidian Community Plugins (Coming Soon)
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
   - Set up Otter.ai OAuth, or
   - Enable folder watcher and set a watch folder
3. **Configure AI** (optional):
   - Choose Claude or OpenAI
   - Enter your API key
4. **Import a transcript**:
   - Drop a file in the watched folder, or
   - Use `MeetingMind: Import file` command, or
   - Let Otter.ai sync automatically

## Example Output

```markdown
---
date: 2025-01-15
duration: 47
attendees:
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
| `MeetingMind: Sync now` | Trigger immediate Otter.ai sync |
| `MeetingMind: Import file` | Import a transcript file manually |
| `MeetingMind: Rebuild vault index` | Re-index notes for auto-linking |
| `MeetingMind: Reprocess current note` | Re-run AI and linking on active note |
| `MeetingMind: View sync log` | Show recent sync activity |

## Settings

### Sources
- **Otter.ai Sync**: Enable/disable, connect account, set sync interval
- **Folder Watcher**: Enable/disable, set watch folder path

### Output
- **Destination Folder**: Where meeting notes are saved
- **Filename Template**: Customize naming (supports YYYY, MM, DD, Title)

### AI Enrichment
- **Provider**: Claude, OpenAI, or Cloud
- **API Key**: Your provider API key
- **Features**: Toggle summary, action items, decisions, tags

### Auto-Linking
- **Enable/Disable**: Master toggle
- **Implicit Aliases**: Generate aliases from multi-word titles
- **Max Matches**: Skip linking if too many matches
- **Excluded Folders**: Folders to ignore for linking

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Folder watcher, basic parsing, manual linking |
| Pro | $29 one-time | + AI enrichment (BYOK), auto-linking, Otter.ai, templates |
| Pro + Cloud | $5/month | + Hosted AI processing, priority support |

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

- [Documentation](https://meetingmind.app/docs)
- [GitHub Issues](https://github.com/meetingmind/obsidian-plugin/issues)
- [Discord Community](https://discord.gg/meetingmind)

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ♥ by Patrick

