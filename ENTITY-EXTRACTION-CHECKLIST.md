# Entity Extraction - Quick Implementation Checklist

## Phase 1: Core Types & AI Extraction

- [ ] **Extend `types.ts`**
  - Add `Entity` interface
  - Add `EntityExtraction` interface
  - Add entity settings to `MeetingMindSettings`

- [ ] **Extend `AIService.ts`**
  - Add `extractEntities()` method
  - Create AI prompt for entity extraction
  - Parse JSON response into `EntityExtraction`

- [ ] **Test AI extraction**
  - Test with demo transcript
  - Verify JSON parsing
  - Handle edge cases (no entities, malformed JSON)

## Phase 2: EntityService

- [ ] **Create `src/services/EntityService.ts`**
  - Copy structure from `ParticipantService.ts`
  - Implement `processEntities()`
  - Implement `createEntityNote()`
  - Implement `updateEntityNote()`
  - Implement `findEntityNote()`
  - Implement `ensureFolder()`

- [ ] **Entity note templates**
  - Issue note template
  - Update note template
  - Topic note template

- [ ] **Test entity creation**
  - Create issue note
  - Create update note
  - Create topic note
  - Handle duplicates

## Phase 3: Integration

- [ ] **Update `main.ts`**
  - Import EntityService
  - Initialize in `onload()`
  - Call in `processTranscript()` after AI enrichment
  - Pass entities to EntityService

- [ ] **Update `NoteGenerator.ts`**
  - Link to entity notes in meeting notes (if needed)
  - Or rely on auto-linker

- [ ] **Test full pipeline**
  - Import transcript
  - Verify entities extracted
  - Verify notes created
  - Verify links work

## Phase 4: Settings UI

- [ ] **Update `SettingsTab.ts`**
  - Add `createEntitySection()` method
  - Master toggle for entity extraction
  - Toggles for each entity type
  - Folder path inputs
  - Pro license check

- [ ] **Test settings**
  - Enable/disable extraction
  - Change folder paths
  - Toggle individual types

## Phase 5: Documentation

- [ ] **Create `docs/pro/entity-extraction.md`**
  - Feature overview
  - Configuration guide
  - Examples

- [ ] **Update `docs/pro/overview.md`**
  - Add entity extraction to features table
  - Add to pricing section

- [ ] **Update `README.md`**
  - Add to Pro features list
  - Add to feature descriptions

## Phase 6: Marketing

- [ ] **Update `frontend/App.tsx`**
  - Add entity extraction feature section
  - Update Pro pricing card
  - Add visual/mockup

- [ ] **Update `DEMO-SCRIPT.md`**
  - Add entity extraction scene
  - Update voiceover script
  - Show entity notes being created

- [ ] **Create demo assets**
  - Vault with entity notes
  - Screenshots of entity notes
  - Example transcript that generates entities

## Phase 7: Testing & Polish

- [ ] **End-to-end testing**
  - Full workflow test
  - Edge cases
  - Error handling

- [ ] **Performance**
  - Check AI API costs
  - Optimize if needed

- [ ] **User experience**
  - Clear folder structure
  - Helpful note templates
  - Good defaults

---

## Quick Reference: File Changes

### New Files
- `src/services/EntityService.ts`
- `docs/pro/entity-extraction.md`

### Modified Files
- `src/types.ts` - Add Entity types and settings
- `src/services/AIService.ts` - Add extractEntities()
- `src/main.ts` - Integrate EntityService
- `src/ui/SettingsTab.ts` - Add entity settings UI
- `docs/pro/overview.md` - Add feature
- `README.md` - Add feature
- `frontend/App.tsx` - Add marketing section
- `DEMO-SCRIPT.md` - Update demo

### Estimated Time
- Phase 1-2: 4-6 hours (core functionality)
- Phase 3-4: 2-3 hours (integration & UI)
- Phase 5-6: 2-3 hours (docs & marketing)
- Phase 7: 1-2 hours (testing)
- **Total: ~10-14 hours**

