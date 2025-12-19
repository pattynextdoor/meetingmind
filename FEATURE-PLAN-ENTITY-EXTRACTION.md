# Entity Extraction Feature - Implementation Plan

## Overview

Extend MeetingMind to automatically extract and create notes for **issues**, **updates**, and **topics** mentioned in meetings, building a richer knowledge graph beyond just people and projects.

## Value Proposition

**Before:** Meetings link to people and projects  
**After:** Meetings automatically create and link to issues, progress updates, and topics, building a comprehensive knowledge graph over time.

## Feature Scope

### Entity Types

1. **Issues** - Blockers, problems, bugs, technical debt
   - Example: "OAuth integration blocker", "Memory leak in dashboard"
   - Folder: `Issues/` (configurable)

2. **Updates** - Progress, milestones, status changes
   - Example: "Component library 90% done", "API v2 migration started"
   - Folder: `Updates/` (configurable)

3. **Topics** - Concepts, systems, initiatives, recurring themes
   - Example: "Design system", "CI/CD pipeline", "User onboarding"
   - Folder: `Topics/` (configurable)

### Pro Feature

This will be a **Pro-only feature** (requires AI enrichment), similar to participant insights.

---

## Technical Implementation

### 1. Extend AI Extraction (`src/services/AIService.ts`)

**New method:** `extractEntities(transcript: RawTranscript): Promise<Entity[] | null>`

**AI Prompt:**
```
Analyze this meeting transcript and extract the following entities:

ISSUES: Technical problems, blockers, bugs, or challenges mentioned. 
Format: { "name": "Issue name", "description": "Brief context", "mentionedBy": "Person who mentioned it" }

UPDATES: Progress updates, milestones, status changes, completion announcements.
Format: { "name": "Update name", "description": "What changed", "status": "in-progress|completed|blocked", "relatedTo": "Project or topic" }

TOPICS: Important concepts, systems, initiatives, or recurring themes discussed.
Format: { "name": "Topic name", "description": "What it is", "category": "technical|process|product" }

Return as JSON array of entities. Only extract clear, substantive mentions. Return empty arrays if none found.
```

**New type in `types.ts`:**
```typescript
export interface Entity {
  type: 'issue' | 'update' | 'topic';
  name: string;
  description?: string;
  mentionedBy?: string;
  status?: 'in-progress' | 'completed' | 'blocked';
  relatedTo?: string;
  category?: string;
}

export interface EntityExtraction {
  issues: Entity[];
  updates: Entity[];
  topics: Entity[];
}
```

### 2. Create EntityService (`src/services/EntityService.ts`)

Similar structure to `ParticipantService.ts`:

**Key methods:**
- `processEntities(entities: EntityExtraction, meetingTitle: string, meetingPath: string, meetingDate: Date)`
- `createEntityNote(entity: Entity, folder: string): Promise<string | null>`
- `updateEntityNote(notePath: string, entity: Entity, meetingTitle: string, meetingPath: string)`
- `findEntityNote(entity: Entity): string | null`

**Note structure:**
```markdown
---
type: issue|update|topic
created: 2025-01-15
---

# OAuth Integration Blocker

## Description
OAuth refresh token handling issue with Google API.

## Related Meetings
- [[2025-01-15 Cadence App Launch Planning]]

## Status
Blocked

## Related To
[[Cadence]]

## Notes
<!-- Add your notes -->
```

### 3. Settings Configuration (`src/types.ts`)

**New settings:**
```typescript
// Entity extraction
autoExtractEntities: boolean;
entityIssuesFolder: string;
entityUpdatesFolder: string;
entityTopicsFolder: string;
enableIssueExtraction: boolean;
enableUpdateExtraction: boolean;
enableTopicExtraction: boolean;
```

**Defaults:**
- `autoExtractEntities: false` (Pro feature, opt-in)
- `entityIssuesFolder: 'Issues'`
- `entityUpdatesFolder: 'Updates'`
- `entityTopicsFolder: 'Topics'`
- All extraction types: `true` (when enabled)

### 4. Settings UI (`src/ui/SettingsTab.ts`)

**New section:** "Entity Extraction" (Pro only)

```typescript
private createEntitySection(containerEl: HTMLElement): void {
  containerEl.createEl('h2', { text: '📊 Entity Extraction (Pro)' });
  
  // Master toggle
  new Setting(containerEl)
    .setName('Auto-extract entities')
    .setDesc('Automatically create notes for issues, updates, and topics mentioned in meetings')
    .addToggle(...)
  
  // Individual toggles for each type
  // Folder paths for each type
  // Info about Pro requirement
}
```

### 5. Integration (`src/main.ts`)

**In `processTranscript()` method:**

```typescript
// After AI enrichment
if (enrichment && this.settings.autoExtractEntities && this.licenseService.hasFeature('aiEnrichment')) {
  const entities = await this.aiService.extractEntities(transcript);
  if (entities) {
    await this.entityService.processEntities(
      entities,
      meetingTitle,
      file.path,
      meetingDate
    );
  }
}
```

### 6. Auto-Linking Enhancement

Entities should also be auto-linked in meeting notes (similar to projects/people):
- When an entity note is created, it should be linked in the meeting note
- Use the same auto-linker logic

---

## Documentation Updates

### 1. New Feature Doc (`docs/pro/entity-extraction.md`)

```markdown
# Entity Extraction

Automatically extract and create notes for issues, updates, and topics from your meetings.

## What You Get

- **Issues**: Blockers, problems, bugs automatically tracked
- **Updates**: Progress and milestones captured
- **Topics**: Concepts and systems documented

## How It Works

MeetingMind analyzes transcripts and identifies:
- Technical problems or blockers
- Progress updates and status changes
- Important concepts or recurring themes

Notes are automatically created in your configured folders.

## Configuration

Settings → MeetingMind → Entity Extraction

- Enable/disable extraction
- Configure folder paths
- Choose which entity types to extract

## Example

Meeting mentions: "OAuth integration is blocked"

Creates: `Issues/OAuth Integration Blocker.md`

Links back to: The meeting note
```

### 2. Update Pro Overview (`docs/pro/overview.md`)

Add entity extraction to the features table.

### 3. Update README.md

Add to Pro features list:
- Entity extraction (issues, updates, topics)

---

## Marketing Updates

### 1. Landing Page (`frontend/App.tsx`)

**New feature section:**

```tsx
{/* Feature: Entity Extraction */}
<div className="grid md:grid-cols-2 gap-16 items-center">
  <div className="space-y-6">
    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mb-4">
      <Icons.Network size={24} />
    </div>
    <h2 className="font-serif text-4xl text-stone-900">Build your knowledge graph automatically</h2>
    <p className="font-sans text-lg text-stone-600 leading-relaxed">
      MeetingMind doesn't just link to existing notes—it creates new ones. 
      Issues, progress updates, and topics mentioned in meetings automatically 
      become part of your vault.
    </p>
    <ul className="space-y-3 text-stone-600 font-sans text-sm">
      <li className="flex items-center gap-3">
        <Icons.Check className="text-emerald-700" size={16} />
        <span>Auto-create notes for blockers and issues</span>
      </li>
      <li className="flex items-center gap-3">
        <Icons.Check className="text-emerald-700" size={16} />
        <span>Track progress updates automatically</span>
      </li>
      <li className="flex items-center gap-3">
        <Icons.Check className="text-emerald-700" size={16} />
        <span>Document topics and concepts as they're discussed</span>
      </li>
    </ul>
    <div className="inline-block px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded">
      ⭐ Pro License Required
    </div>
  </div>
  <div className="relative group">
    {/* Visual showing entity notes being created */}
  </div>
</div>
```

**Update pricing card:**
Add "Entity extraction" to Pro features list.

### 2. Demo Script (`DEMO-SCRIPT.md`)

**New scene or enhanced existing:**

**Option A: Add to Scene 4 (The Value)**
```
**Action:** Show Issues/ folder in file explorer
> "And it creates notes for issues mentioned—like this OAuth blocker."

**Action:** Click on issue note, show it links back to meeting
> "Everything connects. Your knowledge graph builds itself."
```

**Option B: New Scene 5 (Entity Creation)**
```
### Scene 5: Entity Auto-Creation (10 seconds)

**Show:** File explorer with Issues/ folder appearing

**Voiceover:**
> "But here's what makes it powerful—it doesn't just link to existing notes."

**Action:** Open Issues/ folder, show "OAuth Integration Blocker.md"

> "It creates new ones. Issues, updates, topics mentioned in meetings 
   automatically become part of your vault."

**Action:** Click issue note, show it links back to meeting

> "Your knowledge graph builds itself, meeting by meeting."
```

---

## Implementation Order

### Phase 1: Core Functionality
1. ✅ Extend AI extraction types
2. ✅ Create EntityService
3. ✅ Add settings configuration
4. ✅ Integrate into processing pipeline

### Phase 2: UI & Settings
5. ✅ Add settings UI
6. ✅ Test entity creation
7. ✅ Test auto-linking

### Phase 3: Documentation
8. ✅ Create feature docs
9. ✅ Update Pro overview
10. ✅ Update README

### Phase 4: Marketing
11. ✅ Update landing page
12. ✅ Update demo script
13. ✅ Create demo assets (vault with entity notes)

---

## Testing Considerations

### Test Cases

1. **Entity Extraction**
   - Extract issue from transcript
   - Extract update from transcript
   - Extract topic from transcript
   - Handle no entities found

2. **Note Creation**
   - Create issue note in Issues/ folder
   - Create update note in Updates/ folder
   - Create topic note in Topics/ folder
   - Handle duplicate entities (don't create duplicate notes)

3. **Note Updates**
   - Update existing entity note with new meeting reference
   - Don't duplicate meeting references

4. **Auto-Linking**
   - Entity notes link back to meeting
   - Meeting links to entity notes
   - Works with existing auto-linker

5. **Settings**
   - Enable/disable extraction
   - Change folder paths
   - Toggle individual entity types

---

## Future Enhancements (Post-Launch)

1. **Entity Relationships**
   - Link issues to projects
   - Link updates to issues
   - Link topics to projects

2. **Entity Insights**
   - AI-generated insights per entity (similar to participant insights)
   - Status tracking over time

3. **Entity Dashboard**
   - View all issues/updates/topics
   - Filter by status, date, related project

4. **Smart Folders**
   - Auto-organize by project: `Issues/Cadence/OAuth Blocker.md`
   - Auto-organize by date: `Issues/2025-01/OAuth Blocker.md`

---

## Success Metrics

- **Adoption:** % of Pro users enabling entity extraction
- **Usage:** Average entities extracted per meeting
- **Value:** User feedback on knowledge graph richness

---

## Notes

- This is a **Pro-only feature** (requires AI)
- Should be opt-in (default: disabled) to avoid overwhelming users
- Folder paths should be configurable
- Entity notes should follow same structure as participant notes (frontmatter, meeting history, etc.)

