# MeetingMind Engineering Flow Diagram

This document illustrates the engineering flow of how the MeetingMind plugin processes meeting transcripts and creates enriched Obsidian notes.

## High-Level Architecture Flow

```mermaid
flowchart TB
    Start([Plugin Loaded]) --> Init[Initialize Services]
    Init --> BuildIndex[Build Vault Index]
    BuildIndex --> StartServices[Start Background Services]
    
    StartServices --> FolderWatcher[Folder Watcher<br/>Poll every 5s]
    StartServices --> OtterSync[Otter Service<br/>Sync every 15min]
    StartServices --> FirefliesSync[Fireflies Service<br/>Sync on interval]
    
    FolderWatcher -->|New File Detected| ProcessFile[Process Local File]
    OtterSync -->|New Transcripts| ProcessTranscript[Process Transcript]
    FirefliesSync -->|New Transcripts| ProcessTranscript
    ManualImport[Manual Import Command] --> ProcessTranscript
    
    ProcessFile --> Parse[Parse Transcript<br/>VTT/SRT/TXT/JSON]
    ProcessTranscript --> Parse
    
    Parse --> CheckDup{Duplicate<br/>Check}
    CheckDup -->|Duplicate| Skip[Skip Processing]
    CheckDup -->|New| AIEnrich{AI Enabled<br/>& Licensed?}
    
    AIEnrich -->|Yes| AIService[AI Service<br/>Claude/OpenAI]
    AIEnrich -->|No| AutoLink[Auto-Linking]
    
    AIService --> ExtractSummary[Extract Summary]
    AIService --> ExtractActions[Extract Action Items]
    AIService --> ExtractDecisions[Extract Decisions]
    AIService --> ExtractTags[Extract Tags]
    AIService --> ExtractInsights[Extract Participant Insights]
    AIService --> ExtractEntities[Extract Entities<br/>Issues/Updates/Topics]
    
    ExtractSummary --> AutoLink
    ExtractActions --> AutoLink
    ExtractDecisions --> AutoLink
    ExtractTags --> AutoLink
    ExtractInsights --> AutoLink
    ExtractEntities --> AutoLink
    
    AutoLink --> VaultIndex[Vault Index Lookup]
    VaultIndex -->|Exact Match| CreateLink[Create Wiki Link]
    VaultIndex -->|Ambiguous| SuggestLink[Suggest Link]
    VaultIndex -->|No Match| NoLink[No Link]
    
    CreateLink --> GenerateNote
    SuggestLink --> GenerateNote
    NoLink --> GenerateNote
    
    GenerateNote[Generate Note<br/>Markdown + Frontmatter] --> SaveNote[Save to Vault]
    
    SaveNote --> ProcessParticipants{Auto-Create<br/>Participants?}
    ProcessParticipants -->|Yes| ParticipantService[Participant Service<br/>Create/Update Notes]
    ProcessParticipants -->|No| ProcessEntities
    
    ParticipantService --> ProcessEntities{Extract<br/>Entities?}
    ProcessEntities -->|Yes| EntityService[Entity Service<br/>Create/Update Notes]
    ProcessEntities -->|No| UpdateIndex
    
    EntityService --> UpdateIndex[Update Vault Index]
    UpdateIndex --> MarkProcessed[Mark as Processed]
    MarkProcessed --> End([Complete])
    
    Skip --> End
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style AIService fill:#fff3cd
    style AutoLink fill:#d1ecf1
    style GenerateNote fill:#f8d7da
```

## Detailed Component Flow

### 1. Plugin Initialization

```mermaid
flowchart LR
    A[onload] --> B[Load Settings]
    B --> C[Initialize Services]
    C --> D[Register Commands]
    D --> E[Register Event Handlers]
    E --> F[Start Services]
    
    C --> C1[TranscriptParser]
    C --> C2[VaultIndex]
    C --> C3[AutoLinker]
    C --> C4[AIService]
    C --> C5[FolderWatcher]
    C --> C6[OtterService]
    C --> C7[FirefliesService]
    C --> C8[NoteGenerator]
    C --> C9[ParticipantService]
    C --> C10[EntityService]
    C --> C11[LicenseService]
    C --> C12[StatsService]
```

### 2. Transcript Processing Pipeline

```mermaid
flowchart TD
    Input[Transcript Input] --> Parse[TranscriptParser.parseFile]
    
    Parse -->|VTT| ParseVTT[Parse WebVTT Format]
    Parse -->|SRT| ParseSRT[Parse SRT Format]
    Parse -->|JSON| ParseJSON[Parse JSON Format<br/>Otter/Fireflies]
    Parse -->|TXT| ParseTXT[Parse Plain Text]
    
    ParseVTT --> Extract[Extract Segments]
    ParseSRT --> Extract
    ParseJSON --> Extract
    ParseTXT --> Extract
    
    Extract --> ExtractMeta[Extract Metadata<br/>Title, Date, Duration, Participants]
    ExtractMeta --> GenerateHash[Generate Content Hash<br/>MD5]
    GenerateHash --> RawTranscript[RawTranscript Object]
    
    style Parse fill:#e1f5ff
    style RawTranscript fill:#d4edda
```

### 3. AI Enrichment Flow

```mermaid
flowchart TD
    Transcript[Raw Transcript] --> CheckLicense{Pro License<br/>Check}
    CheckLicense -->|No License| SkipAI[Skip AI Processing]
    CheckLicense -->|Has License| CheckEnabled{AI Enabled<br/>& Configured?}
    
    CheckEnabled -->|No| SkipAI
    CheckEnabled -->|Yes| Format[Format Transcript<br/>for AI]
    
    Format --> CheckLength{Length Check<br/>Token Limit}
    CheckLength -->|Short| ProcessSingle[Process Single Chunk]
    CheckLength -->|Long| Chunk[Split into Chunks<br/>~30 min each]
    
    Chunk --> ProcessChunk1[Process Chunk 1]
    Chunk --> ProcessChunk2[Process Chunk 2]
    Chunk --> ProcessChunkN[Process Chunk N]
    
    ProcessChunk1 --> Merge[Merge Results]
    ProcessChunk2 --> Merge
    ProcessChunkN --> Merge
    
    ProcessSingle --> CallAPI[Call AI API<br/>Claude/OpenAI]
    ProcessChunk1 --> CallAPI
    ProcessChunk2 --> CallAPI
    ProcessChunkN --> CallAPI
    
    CallAPI --> ParseJSON[Parse JSON Response]
    ParseJSON --> ExtractSummary[Summary]
    ParseJSON --> ExtractActions[Action Items]
    ParseJSON --> ExtractDecisions[Decisions]
    ParseJSON --> ExtractTags[Tag Suggestions]
    
    ExtractSummary --> Enrichment[AIEnrichment Object]
    ExtractActions --> Enrichment
    ExtractDecisions --> Enrichment
    ExtractTags --> Enrichment
    
    Merge --> ExtractSummary
    
    Enrichment --> ParticipantInsights[Generate Participant Insights]
    Enrichment --> EntityExtraction[Extract Entities]
    
    ParticipantInsights --> FinalEnrichment[Final Enrichment]
    EntityExtraction --> FinalEnrichment
    
    SkipAI --> FinalEnrichment
    
    style CheckLicense fill:#fff3cd
    style CallAPI fill:#f8d7da
    style FinalEnrichment fill:#d4edda
```

### 4. Auto-Linking Flow

```mermaid
flowchart TD
    Text[Text Segment] --> GetTerms[Get Sorted Terms<br/>Longest First]
    GetTerms --> Loop[For Each Term]
    
    Loop --> CheckLength{Term Length<br/>> 3 chars?}
    CheckLength -->|No| NextTerm[Next Term]
    CheckLength -->|Yes| CheckCovered{Already<br/>Covered?}
    
    CheckCovered -->|Yes| NextTerm
    CheckCovered -->|No| Match[Find Matches<br/>Word Boundaries]
    
    Match --> CheckLink{Inside<br/>Existing Link?}
    CheckLink -->|Yes| NextTerm
    CheckLink -->|No| CheckOverlap{Overlaps<br/>Existing Match?}
    
    CheckOverlap -->|Yes| NextTerm
    CheckOverlap -->|No| CheckFirst{First<br/>Occurrence?}
    
    CheckFirst -->|No| NextTerm
    CheckFirst -->|Yes| Lookup[Vault Index Lookup]
    
    Lookup --> ExactMatch{Exact<br/>Match?}
    ExactMatch -->|Yes| CreateLink["Create Wiki Link<br/>NoteName"]
    ExactMatch -->|No| Ambiguous{Ambiguous<br/>Matches?}
    
    Ambiguous -->|Yes| CheckCount{Match Count<br/><= Threshold?}
    CheckCount -->|Yes| SuggestLink[Add to Suggestions]
    CheckCount -->|No| NextTerm
    Ambiguous -->|No| NextTerm
    
    CreateLink --> Replace[Replace in Text]
    SuggestLink --> NextTerm
    Replace --> NextTerm
    NextTerm --> MoreTerms{More<br/>Terms?}
    MoreTerms -->|Yes| Loop
    MoreTerms -->|No| Return[Return Linked Text<br/>+ Suggestions]
    
    style Lookup fill:#d1ecf1
    style CreateLink fill:#d4edda
    style SuggestLink fill:#fff3cd
```

### 5. Note Generation Flow

```mermaid
flowchart TD
    ProcessedMeeting[ProcessedMeeting Object] --> BuildFrontmatter[Build YAML Frontmatter<br/>Date, Duration, Participants, Tags]
    
    BuildFrontmatter --> BuildSummary{Has<br/>Summary?}
    BuildSummary -->|Yes| SummarySection["Summary Section"]
    BuildSummary -->|No| BuildActions
    
    SummarySection --> BuildActions{Has Action<br/>Items?}
    BuildActions -->|Yes| ActionsSection["Action Items Section<br/>Task with assignee and due date"]
    BuildActions -->|No| BuildDecisions
    
    ActionsSection --> BuildDecisions{Has<br/>Decisions?}
    BuildDecisions -->|Yes| DecisionsSection["Decisions Section<br/>Decision text"]
    BuildDecisions -->|No| BuildTranscript
    
    DecisionsSection --> BuildTranscript["Transcript Section<br/>Collapsible Callout"]
    BuildTranscript --> BuildSuggestions{Has Suggested<br/>Links?}
    
    BuildSuggestions -->|Yes| SuggestionsSection["Suggested Links Section<br/>Manual resolution needed"]
    BuildSuggestions -->|No| Combine[Combine All Sections]
    
    SuggestionsSection --> Combine
    
    Combine --> GenerateFilename["Generate Filename<br/>Template: YYYY-MM-DD Title"]
    GenerateFilename --> CheckCollision{Filename<br/>Collision?}
    
    CheckCollision -->|Yes| ResolveCollision["Append Number<br/>Title with number suffix"]
    CheckCollision -->|No| CreateFile[Create File in Vault]
    
    ResolveCollision --> CreateFile
    CreateFile --> NoteCreated[Note Created]
    
    style BuildFrontmatter fill:#e1f5ff
    style CreateFile fill:#d4edda
```

### 6. Participant & Entity Processing Flow

```mermaid
flowchart TD
    NoteCreated[Note Created] --> CheckParticipants{Auto-Create<br/>Participants?}
    
    CheckParticipants -->|Yes| ParticipantService[Participant Service]
    CheckParticipants -->|No| CheckEntities
    
    ParticipantService --> GetInsights[Get Participant Insights<br/>from AI Enrichment]
    GetInsights --> ForEachParticipant[For Each Participant]
    
    ForEachParticipant --> CheckExists{Note<br/>Exists?}
    CheckExists -->|No| CreateParticipantNote[Create Participant Note<br/>People/Name.md]
    CheckExists -->|Yes| UpdateParticipantNote[Update Participant Note<br/>Add Meeting Reference]
    
    CreateParticipantNote --> AddMetadata[Add Metadata<br/>Role, Key Points, Wins]
    UpdateParticipantNote --> AddMetadata
    
    AddMetadata --> CheckEntities{Extract<br/>Entities?}
    
    CheckEntities -->|Yes| EntityService[Entity Service]
    CheckEntities -->|No| UpdateIndex
    
    EntityService --> AnalyzeStatus[Analyze Status Changes<br/>for Existing Entities]
    AnalyzeStatus --> UpdateStatus[Update Entity Status<br/>resolved/completed/stale]
    
    UpdateStatus --> ExtractNew[Extract New Entities<br/>Issues/Updates/Topics]
    ExtractNew --> ForEachEntity[For Each Entity]
    
    ForEachEntity --> CheckEntityExists{Entity Note<br/>Exists?}
    CheckEntityExists -->|No| CreateEntityNote[Create Entity Note<br/>Issues/Name.md]
    CheckEntityExists -->|Yes| UpdateEntityNote[Update Entity Note<br/>Add Meeting Reference]
    
    CreateEntityNote --> AddEntityMetadata[Add Metadata<br/>Description, Status, Related To]
    UpdateEntityNote --> AddEntityMetadata
    
    AddEntityMetadata --> UpdateIndex[Update Vault Index<br/>Schedule Incremental Update]
    UpdateIndex --> Complete[Processing Complete]
    
    style ParticipantService fill:#d1ecf1
    style EntityService fill:#fff3cd
    style Complete fill:#d4edda
```

### 7. Vault Index Maintenance

```mermaid
flowchart TD
    Start[Vault Change Event] --> Debounce[Debounce 500ms]
    Debounce --> BuildIndex[Build Vault Index]
    
    BuildIndex --> GetFiles[Get All Markdown Files]
    GetFiles --> Filter[Filter Excluded Folders]
    
    Filter --> ForEachFile[For Each File]
    ForEachFile --> GetTitle[Get Note Title<br/>basename]
    ForEachFile --> GetAliases[Get Explicit Aliases<br/>from frontmatter]
    ForEachFile --> GenerateImplicit[Generate Implicit Aliases<br/>from multi-word titles]
    
    GetTitle --> AddToMap[Add to Alias Map<br/>alias → paths]
    GetAliases --> AddToMap
    GenerateImplicit --> AddToMap
    
    AddToMap --> ProcessMap[Process Alias Map]
    ProcessMap --> CheckCount{Path Count<br/>for Alias}
    
    CheckCount -->|1 Path| ExactMatch[Add to Exact Matches]
    CheckCount -->|>1 Path| AmbiguousMatch[Add to Ambiguous Matches]
    
    ExactMatch --> SortTerms[Sort Terms by Length<br/>Longest First]
    AmbiguousMatch --> SortTerms
    
    SortTerms --> IndexComplete[Index Complete<br/>Ready for Lookups]
    
    style BuildIndex fill:#e1f5ff
    style IndexComplete fill:#d4edda
```

## Data Flow Summary

```mermaid
flowchart LR
    Sources[Input Sources] --> Parser[Transcript Parser]
    Parser --> Raw[Raw Transcript]
    
    Raw --> AI[AI Service]
    Raw --> Linker[Auto Linker]
    
    AI --> Enriched[Enriched Data]
    Linker --> Linked[Linked Text]
    
    Enriched --> Generator[Note Generator]
    Linked --> Generator
    
    Generator --> Note[Markdown Note]
    
    Note --> Participants[Participant Notes]
    Note --> Entities[Entity Notes]
    
    Participants --> Vault[(Obsidian Vault)]
    Entities --> Vault
    Note --> Vault
    
    Vault --> Index[Vault Index]
    Index --> Linker
    
    style Sources fill:#e1f5ff
    style Vault fill:#d4edda
    style Index fill:#fff3cd
```

## Service Dependencies

```mermaid
graph TD
    Plugin[MeetingMind Plugin] --> Parser[TranscriptParser]
    Plugin --> Index[VaultIndex]
    Plugin --> Linker[AutoLinker]
    Plugin --> AI[AIService]
    Plugin --> Generator[NoteGenerator]
    Plugin --> Participants[ParticipantService]
    Plugin --> Entities[EntityService]
    Plugin --> Watcher[FolderWatcher]
    Plugin --> Otter[OtterService]
    Plugin --> Fireflies[FirefliesService]
    Plugin --> License[LicenseService]
    Plugin --> Stats[StatsService]
    
    Linker --> Index
    Generator --> Parser
    Participants --> Index
    Entities --> Index
    AI --> License
    
    style Plugin fill:#e1f5ff
    style Index fill:#fff3cd
```

## Key Processing Steps

1. **Input Acquisition**: Multiple sources (folder watcher, Otter sync, Fireflies sync, manual import)
2. **Parsing**: Convert various formats (VTT, SRT, TXT, JSON) into standardized `RawTranscript`
3. **Deduplication**: Hash-based duplicate detection to prevent reprocessing
4. **AI Enrichment**: Optional Pro feature for summaries, action items, decisions, tags, insights
5. **Auto-Linking**: Intelligent linking to existing vault notes using vault index
6. **Note Generation**: Create formatted Markdown notes with frontmatter
7. **Entity Processing**: Auto-create/update participant and entity notes
8. **Index Maintenance**: Keep vault index updated for accurate linking

## Error Handling

- All services handle errors gracefully and continue processing
- Failed AI enrichment doesn't block note creation
- Duplicate transcripts are skipped with logging
- Invalid transcripts are logged but don't crash the plugin
- Network errors in sync services use exponential backoff retry

