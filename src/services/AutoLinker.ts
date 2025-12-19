/**
 * AutoLinker - Automatically create [[wiki-links]] to existing notes
 */

import { SuggestedLink } from '../types';
import { VaultIndexService } from './VaultIndex';

interface LinkMatch {
  term: string;
  start: number;
  end: number;
  notePath: string;
  originalText: string;
}

export class AutoLinker {
  private vaultIndex: VaultIndexService;
  private maxMatchesBeforeSkip: number;
  
  constructor(vaultIndex: VaultIndexService, maxMatchesBeforeSkip: number = 3) {
    this.vaultIndex = vaultIndex;
    this.maxMatchesBeforeSkip = maxMatchesBeforeSkip;
  }
  
  /**
   * Process text and add auto-links
   * Returns the linked text and any suggested links that couldn't be auto-linked
   */
  processText(text: string): { linkedText: string; suggestedLinks: SuggestedLink[] } {
    const matches: LinkMatch[] = [];
    const suggestedLinks: SuggestedLink[] = [];
    const linkedTerms = new Set<string>(); // Track terms already linked (for first-occurrence-only)
    
    // Get sorted terms (longest first)
    const sortedTerms = this.vaultIndex.getSortedTerms();
    
    // Find all potential matches in the text
    for (const term of sortedTerms) {
      // Skip very short terms (less than 3 chars) - common words
      if (term.length < 3) continue;
      
      // Skip if we already linked a longer term containing this one
      if (this.isAlreadyCovered(term, matches)) continue;
      
      // Create word boundary regex for matching
      // Using regex with word boundaries to ensure we match complete words
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // For terms with special characters, word boundary \b doesn't work well
      // Use negative lookbehind/lookahead instead
      const hasSpecialChars = /[+*?^${}()|[\]\\-]/.test(term);
      const boundaryPattern = hasSpecialChars 
        ? `(?<!\\w)${escapedTerm}(?!\\w)` // Negative lookbehind/lookahead for word boundaries
        : `\\b${escapedTerm}\\b`; // Standard word boundary for normal terms
      const regex = new RegExp(boundaryPattern, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const originalText = text.substring(start, end);
        
        // Check if this position is inside an existing link
        if (this.isInsideExistingLink(text, start, end)) {
          continue;
        }
        
        // Check if this position overlaps with an existing match
        if (this.overlapsWithExistingMatch(start, end, matches)) {
          continue;
        }
        
        // Only link first occurrence of each term
        if (linkedTerms.has(term.toLowerCase())) {
          continue;
        }
        
        // Try to get exact match
        const exactPath = this.vaultIndex.lookupExact(term);
        
        if (exactPath) {
          matches.push({
            term: term.toLowerCase(),
            start,
            end,
            notePath: exactPath,
            originalText,
          });
          linkedTerms.add(term.toLowerCase());
        } else {
          // Check for ambiguous matches
          const ambiguousPaths = this.vaultIndex.lookupAmbiguous(term);
          
          if (ambiguousPaths.length > 0 && ambiguousPaths.length <= this.maxMatchesBeforeSkip) {
            // Add to suggested links
            const existingSuggestion = suggestedLinks.find(s => s.term.toLowerCase() === term.toLowerCase());
            if (!existingSuggestion) {
              suggestedLinks.push({
                term: originalText,
                candidates: ambiguousPaths.map(p => this.vaultIndex.getNoteName(p)),
              });
            }
          }
        }
        
        // Break after first match (first occurrence only)
        break;
      }
    }
    
    // Sort matches by position (reverse order for replacement)
    matches.sort((a, b) => b.start - a.start);
    
    // Apply replacements
    let linkedText = text;
    for (const match of matches) {
      const noteName = this.vaultIndex.getNoteName(match.notePath);
      const link = this.createLink(noteName, match.originalText);
      linkedText = linkedText.substring(0, match.start) + link + linkedText.substring(match.end);
    }
    
    return { linkedText, suggestedLinks };
  }
  
  /**
   * Check if a term is already covered by a longer match
   */
  private isAlreadyCovered(term: string, matches: LinkMatch[]): boolean {
    for (const match of matches) {
      if (match.term.includes(term) && match.term !== term) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if a position is inside an existing [[link]] or [link](url)
   */
  private isInsideExistingLink(text: string, start: number, end: number): boolean {
    // Check for [[wiki-links]]
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);
    
    // Count unclosed [[ before position
    const openBrackets = (beforeText.match(/\[\[/g) || []).length;
    const closeBrackets = (beforeText.match(/\]\]/g) || []).length;
    
    if (openBrackets > closeBrackets) {
      return true;
    }
    
    // Check for markdown links [text](url)
    // Simple check: if we're between [ and ]( or between ]( and )
    const lastOpenBracket = beforeText.lastIndexOf('[');
    const lastCloseBracket = beforeText.lastIndexOf(']');
    const lastOpenParen = beforeText.lastIndexOf('](');
    const lastCloseParen = beforeText.lastIndexOf(')');
    
    // Inside link text [text]
    if (lastOpenBracket > lastCloseBracket && lastOpenBracket > lastCloseParen) {
      const closeIdx = text.indexOf(']', start);
      if (closeIdx !== -1 && closeIdx >= end) {
        return true;
      }
    }
    
    // Inside link URL ](url)
    if (lastOpenParen > lastCloseParen) {
      const closeIdx = text.indexOf(')', start);
      if (closeIdx !== -1 && closeIdx >= end) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if a position overlaps with an existing match
   */
  private overlapsWithExistingMatch(start: number, end: number, matches: LinkMatch[]): boolean {
    for (const match of matches) {
      if (start < match.end && end > match.start) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Create a wiki-link, using display text if different from note name
   */
  private createLink(noteName: string, originalText: string): string {
    // If the original text matches the note name exactly (case-sensitive), just use [[noteName]]
    if (originalText === noteName) {
      return `[[${noteName}]]`;
    }
    // Otherwise use [[noteName|displayText]] format
    return `[[${noteName}|${originalText}]]`;
  }
  
  /**
   * Set the maximum matches threshold
   */
  setMaxMatches(max: number): void {
    this.maxMatchesBeforeSkip = max;
  }
}

