/**
 * VaultIndex - Builds and maintains an index of linkable entities in the vault
 */

import { App } from 'obsidian';
import { VaultIndex as VaultIndexType } from '../types';

export class VaultIndexService {
  private app: App;
  private index: VaultIndexType;
  private excludedFolders: string[];
  private generateImplicitAliases: boolean;
  private updateDebounceTimer: NodeJS.Timeout | null = null;
  
  constructor(app: App) {
    this.app = app;
    this.excludedFolders = [];
    this.generateImplicitAliases = true;
    this.index = {
      exactMatches: new Map(),
      ambiguousMatches: new Map(),
      sortedTerms: [],
      lastUpdated: new Date(),
    };
  }
  
  /**
   * Configure the index settings
   */
  configure(excludedFolders: string[], generateImplicitAliases: boolean): void {
    this.excludedFolders = excludedFolders;
    this.generateImplicitAliases = generateImplicitAliases;
  }
  
  /**
   * Build or rebuild the full vault index
   */
  buildIndex(): void {
    const startTime = Date.now();
    
    // Clear existing index
    this.index.exactMatches.clear();
    this.index.ambiguousMatches.clear();
    this.index.sortedTerms = [];
    
    // Temporary map to collect all aliases -> paths
    const aliasToPathsMap = new Map<string, { paths: Set<string>; isExplicit: boolean }>();
    
    // Get all markdown files
    const files = this.app.vault.getMarkdownFiles();
    
    for (const file of files) {
      // Skip excluded folders
      if (this.isExcluded(file.path)) {
        continue;
      }
      
      // Get file metadata
      const metadata = this.app.metadataCache.getFileCache(file);
      
      // Add note title
      const title = file.basename;
      this.addToAliasMap(aliasToPathsMap, title.toLowerCase(), file.path, true);
      
      // Add explicit aliases from frontmatter
      if (metadata?.frontmatter?.aliases) {
        const aliases: unknown[] = Array.isArray(metadata.frontmatter.aliases) 
          ? metadata.frontmatter.aliases 
          : [metadata.frontmatter.aliases];
        
        for (const alias of aliases) {
          if (typeof alias === 'string' && alias.trim()) {
            this.addToAliasMap(aliasToPathsMap, alias.toLowerCase().trim(), file.path, true);
          }
        }
      }
      
      // Generate implicit aliases for multi-word titles
      if (this.generateImplicitAliases && title.includes(' ')) {
        const words = title.split(/\s+/);
        for (const word of words) {
          // Only index significant words (length > 3)
          if (word.length > 3) {
            this.addToAliasMap(aliasToPathsMap, word.toLowerCase(), file.path, false);
          }
        }
      }
    }
    
    // Process collected aliases into exact and ambiguous matches
    for (const [alias, data] of aliasToPathsMap) {
      const paths: string[] = Array.from(data.paths);
      
      if (paths.length === 1) {
        // Single match - exact
        this.index.exactMatches.set(alias, paths[0]);
      } else if (paths.length > 1) {
        // Multiple matches
        if (data.isExplicit) {
          // If it's an explicit alias that matches multiple notes, still try to use it
          // but mark as ambiguous for manual resolution
          this.index.ambiguousMatches.set(alias, paths);
        } else {
          // Implicit aliases that match multiple notes go to ambiguous
          this.index.ambiguousMatches.set(alias, paths);
        }
      }
    }
    
    // Sort terms by length descending for longest-match-first algorithm
    const allTerms = new Set<string>();
    for (const term of this.index.exactMatches.keys()) {
      allTerms.add(term);
    }
    for (const term of this.index.ambiguousMatches.keys()) {
      allTerms.add(term);
    }
    this.index.sortedTerms = Array.from(allTerms).sort((a, b) => b.length - a.length);
    
    this.index.lastUpdated = new Date();
    
    const elapsed = Date.now() - startTime;
    console.debug(`MeetingMind: vault index built in ${elapsed}ms with ${files.length} files, ${this.index.sortedTerms.length} terms`);
  }
  
  /**
   * Helper to add an alias to the temporary map
   */
  private addToAliasMap(
    map: Map<string, { paths: Set<string>; isExplicit: boolean }>,
    alias: string,
    path: string,
    isExplicit: boolean
  ): void {
    if (!map.has(alias)) {
      map.set(alias, { paths: new Set(), isExplicit: false });
    }
    const entry = map.get(alias)!;
    entry.paths.add(path);
    // Mark as explicit if any instance is explicit
    if (isExplicit) {
      entry.isExplicit = true;
    }
  }
  
  /**
   * Check if a file path is in an excluded folder
   */
  private isExcluded(path: string): boolean {
    for (const folder of this.excludedFolders) {
      if (path.startsWith(folder + '/') || path === folder) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Handle incremental updates when files change
   */
  scheduleIncrementalUpdate(): void {
    // Debounce updates by 500ms
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer);
    }
    
    this.updateDebounceTimer = setTimeout(() => {
      this.buildIndex();
    }, 500);
  }
  
  /**
   * Get the current index
   */
  getIndex(): VaultIndexType {
    return this.index;
  }
  
  /**
   * Look up an alias and return the note path if it's an exact match
   */
  lookupExact(term: string): string | null {
    return this.index.exactMatches.get(term.toLowerCase()) || null;
  }
  
  /**
   * Look up an alias and return all possible paths if ambiguous
   */
  lookupAmbiguous(term: string): string[] {
    return this.index.ambiguousMatches.get(term.toLowerCase()) || [];
  }
  
  /**
   * Check if a term has any matches (exact or ambiguous)
   */
  hasMatches(term: string): boolean {
    const lower = term.toLowerCase();
    return this.index.exactMatches.has(lower) || this.index.ambiguousMatches.has(lower);
  }
  
  /**
   * Get sorted terms for matching (longest first)
   */
  getSortedTerms(): string[] {
    return this.index.sortedTerms;
  }
  
  /**
   * Get note basename from path
   */
  getNoteName(path: string): string {
    return path.replace(/\.md$/, '').split('/').pop() || path;
  }
}

