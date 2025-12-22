/**
 * StatsService - Generate meeting statistics and dashboard
 * Analyzes meeting notes to provide insights without AI
 */

import { App, TFile, normalizePath } from 'obsidian';

export interface MeetingStats {
  // Overview
  totalMeetings: number;
  thisMonth: number;
  thisWeek: number;
  today: number;
  
  // Time
  totalMinutes: number;
  avgDuration: number;
  longestMeeting: { title: string; duration: number } | null;
  shortestMeeting: { title: string; duration: number } | null;
  
  // People
  topCollaborators: { name: string; count: number }[];
  uniqueParticipants: number;
  avgParticipantsPerMeeting: number;
  
  // Patterns
  meetingsByDayOfWeek: { day: string; count: number; avgDuration: number }[];
  meetingsByMonth: { month: string; count: number }[];
  busiestDay: string;
  quietestDay: string;
  
  // Sources
  sourceBreakdown: { source: string; count: number; percentage: number }[];
  
  // Recent
  recentMeetings: { title: string; date: Date; duration: number; participants: string[] }[];
}

interface MeetingNote {
  file: TFile;
  title: string;
  date: Date;
  duration: number;
  participants: string[];
  source: string;
}

export class StatsService {
  private app: App;
  private meetingsFolder: string;
  
  constructor(app: App) {
    this.app = app;
    this.meetingsFolder = 'Meetings';
  }
  
  /**
   * Configure the stats service
   */
  configure(meetingsFolder: string): void {
    this.meetingsFolder = meetingsFolder;
  }
  
  /**
   * Gather all meeting notes from the vault
   */
  private gatherMeetingNotes(): MeetingNote[] {
    const meetings: MeetingNote[] = [];
    const files = this.app.vault.getMarkdownFiles();
    
    for (const file of files) {
      // Check if file is in meetings folder or has meeting frontmatter
      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;
      
      if (!frontmatter) continue;
      
      // Look for meeting-like frontmatter (has date and either duration or participants)
      if (frontmatter.date && (frontmatter.duration !== undefined || frontmatter.participants || frontmatter.attendees)) {
        const participants = this.parseParticipants(frontmatter.participants || frontmatter.attendees || []);
        
        const dateValue = frontmatter.date;
        const date = dateValue instanceof Date 
          ? dateValue 
          : typeof dateValue === 'string' || typeof dateValue === 'number'
          ? new Date(dateValue)
          : new Date();
        
        meetings.push({
          file,
          title: file.basename,
          date,
          duration: frontmatter.duration || 0,
          participants,
          source: frontmatter.source || 'unknown',
        });
      }
    }
    
    return meetings;
  }
  
  /**
   * Parse participants from frontmatter (handles various formats)
   */
  private parseParticipants(raw: unknown): string[] {
    if (!raw) return [];
    
    if (Array.isArray(raw)) {
      return raw.map(p => {
        // Handle "[[Name]]" format
        const match = String(p).match(/\[\[([^\]]+\|?)/);
        return match ? match[1] : String(p).replace(/["[\]]/g, '');
      }).filter(p => p);
    }
    
    if (typeof raw === 'string') {
      return raw.split(',').map(p => p.trim()).filter(p => p);
    }
    
    return [];
  }
  
  /**
   * Calculate all statistics from meeting notes
   */
  calculateStats(): MeetingStats {
    const meetings = this.gatherMeetingNotes();
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Basic counts
    const thisWeek = meetings.filter(m => m.date >= startOfWeek).length;
    const thisMonth = meetings.filter(m => m.date >= startOfMonth).length;
    const today = meetings.filter(m => m.date >= startOfToday).length;
    
    // Time stats
    const totalMinutes = meetings.reduce((sum, m) => sum + m.duration, 0);
    const avgDuration = meetings.length > 0 ? Math.round(totalMinutes / meetings.length) : 0;
    
    const sortedByDuration = [...meetings].sort((a, b) => b.duration - a.duration);
    const longestMeeting = sortedByDuration[0] 
      ? { title: sortedByDuration[0].title, duration: sortedByDuration[0].duration }
      : null;
    const shortestMeeting = sortedByDuration[sortedByDuration.length - 1]
      ? { title: sortedByDuration[sortedByDuration.length - 1].title, duration: sortedByDuration[sortedByDuration.length - 1].duration }
      : null;
    
    // People stats
    const participantCounts = new Map<string, number>();
    for (const meeting of meetings) {
      for (const participant of meeting.participants) {
        participantCounts.set(participant, (participantCounts.get(participant) || 0) + 1);
      }
    }
    
    const topCollaborators = Array.from(participantCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    const uniqueParticipants = participantCounts.size;
    const totalParticipants = meetings.reduce((sum, m) => sum + m.participants.length, 0);
    const avgParticipantsPerMeeting = meetings.length > 0 
      ? Math.round((totalParticipants / meetings.length) * 10) / 10 
      : 0;
    
    // Day of week patterns
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = dayNames.map(day => ({ day, count: 0, totalDuration: 0 }));
    
    for (const meeting of meetings) {
      const dayIndex = meeting.date.getDay();
      dayStats[dayIndex].count++;
      dayStats[dayIndex].totalDuration += meeting.duration;
    }
    
    const meetingsByDayOfWeek = dayStats.map(d => ({
      day: d.day,
      count: d.count,
      avgDuration: d.count > 0 ? Math.round(d.totalDuration / d.count) : 0,
    }));
    
    const sortedDays = [...meetingsByDayOfWeek].sort((a, b) => b.count - a.count);
    const busiestDay = sortedDays[0]?.day || 'N/A';
    const quietestDay = sortedDays.filter(d => d.count > 0).pop()?.day || 'N/A';
    
    // Monthly breakdown (last 6 months)
    const monthlyStats = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyStats.set(key, 0);
    }
    
    for (const meeting of meetings) {
      const key = meeting.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyStats.has(key)) {
        monthlyStats.set(key, (monthlyStats.get(key) || 0) + 1);
      }
    }
    
    const meetingsByMonth = Array.from(monthlyStats.entries()).map(([month, count]) => ({ month, count }));
    
    // Source breakdown
    const sourceCounts = new Map<string, number>();
    for (const meeting of meetings) {
      const source = meeting.source || 'unknown';
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    }
    
    const sourceBreakdown = Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({
        source,
        count,
        percentage: meetings.length > 0 ? Math.round((count / meetings.length) * 100) : 0,
      }));
    
    // Recent meetings
    const recentMeetings = [...meetings]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(m => ({
        title: m.title,
        date: m.date,
        duration: m.duration,
        participants: m.participants,
      }));
    
    return {
      totalMeetings: meetings.length,
      thisMonth,
      thisWeek,
      today,
      totalMinutes,
      avgDuration,
      longestMeeting,
      shortestMeeting,
      topCollaborators,
      uniqueParticipants,
      avgParticipantsPerMeeting,
      meetingsByDayOfWeek,
      meetingsByMonth,
      busiestDay,
      quietestDay,
      sourceBreakdown,
      recentMeetings,
    };
  }
  
  /**
   * Generate dashboard Markdown content
   */
  generateDashboard(stats: MeetingStats): string {
    const now = new Date();
    const sections: string[] = [];
    
    // Header
    sections.push(`# 📊 Meeting Dashboard`);
    sections.push(`\n*Last updated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}*\n`);
    
    // Overview Cards
    sections.push(`## Overview\n`);
    sections.push(`| Metric | Value |`);
    sections.push(`|--------|-------|`);
    sections.push(`| **Total Meetings** | ${stats.totalMeetings} |`);
    sections.push(`| **This Month** | ${stats.thisMonth} |`);
    sections.push(`| **This Week** | ${stats.thisWeek} |`);
    sections.push(`| **Today** | ${stats.today} |`);
    
    // Time Investment
    sections.push(`\n## ⏱️ Time Investment\n`);
    const totalHours = Math.floor(stats.totalMinutes / 60);
    const remainingMins = stats.totalMinutes % 60;
    sections.push(`| Metric | Value |`);
    sections.push(`|--------|-------|`);
    sections.push(`| **Total Time** | ${totalHours}h ${remainingMins}m |`);
    sections.push(`| **Average Duration** | ${stats.avgDuration} min |`);
    if (stats.longestMeeting) {
      sections.push(`| **Longest Meeting** | ${stats.longestMeeting.duration} min (${stats.longestMeeting.title}) |`);
    }
    if (stats.shortestMeeting && stats.shortestMeeting.duration > 0) {
      sections.push(`| **Shortest Meeting** | ${stats.shortestMeeting.duration} min (${stats.shortestMeeting.title}) |`);
    }
    
    // Top Collaborators
    if (stats.topCollaborators.length > 0) {
      sections.push(`\n## 👥 Top Collaborators\n`);
      sections.push(`| Person | Meetings |`);
      sections.push(`|--------|----------|`);
      for (const collab of stats.topCollaborators.slice(0, 10)) {
        sections.push(`| [[${collab.name}]] | ${collab.count} |`);
      }
      sections.push(`\n*${stats.uniqueParticipants} unique participants • ${stats.avgParticipantsPerMeeting} avg per meeting*`);
    }
    
    // Meeting Patterns
    sections.push(`\n## 📅 Meeting Patterns\n`);
    sections.push(`**Busiest Day:** ${stats.busiestDay}`);
    sections.push(`**Quietest Day:** ${stats.quietestDay}\n`);
    
    sections.push(`| Day | Meetings | Avg Duration |`);
    sections.push(`|-----|----------|--------------|`);
    for (const day of stats.meetingsByDayOfWeek) {
      const bar = '█'.repeat(Math.min(day.count, 10));
      sections.push(`| ${day.day} | ${day.count} ${bar} | ${day.avgDuration}m |`);
    }
    
    // Monthly Trend
    sections.push(`\n## 📈 Monthly Trend\n`);
    sections.push(`| Month | Meetings |`);
    sections.push(`|-------|----------|`);
    for (const month of stats.meetingsByMonth) {
      const bar = '█'.repeat(Math.min(month.count, 15));
      sections.push(`| ${month.month} | ${month.count} ${bar} |`);
    }
    
    // Import Sources
    if (stats.sourceBreakdown.length > 0) {
      sections.push(`\n## 📥 Import Sources\n`);
      sections.push(`| Source | Count | % |`);
      sections.push(`|--------|-------|---|`);
      for (const source of stats.sourceBreakdown) {
        const displayName = this.formatSourceName(source.source);
        sections.push(`| ${displayName} | ${source.count} | ${source.percentage}% |`);
      }
    }
    
    // Recent Meetings
    if (stats.recentMeetings.length > 0) {
      sections.push(`\n## 🕐 Recent Meetings\n`);
      for (const meeting of stats.recentMeetings) {
        const dateStr = meeting.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const participants = meeting.participants.slice(0, 3).map(p => `[[${p}]]`).join(', ');
        const more = meeting.participants.length > 3 ? ` +${meeting.participants.length - 3} more` : '';
        sections.push(`- **[[${meeting.title}]]** (${dateStr}, ${meeting.duration}m) — ${participants}${more}`);
      }
    }
    
    // Footer
    sections.push(`\n---\n`);
    sections.push(`*Generated by MeetingMind • Run \`MeetingMind: update dashboard\` to refresh*`);
    
    return sections.join('\n');
  }
  
  /**
   * Format source name for display
   */
  private formatSourceName(source: string): string {
    const names: Record<string, string> = {
      'fireflies': 'Fireflies.ai',
      'otter': 'Otter.ai',
      'local': 'Folder Watch',
      'vtt': 'VTT Import',
      'srt': 'SRT Import',
      'txt': 'Text Import',
      'json': 'JSON Import',
      'unknown': 'Unknown',
    };
    return names[source.toLowerCase()] || source;
  }
  
  /**
   * Generate and save the dashboard note
   */
  async generateDashboardNote(outputPath: string = 'Meeting Dashboard.md'): Promise<TFile> {
    const stats = this.calculateStats();
    const content = this.generateDashboard(stats);
    
    const normalizedPath = normalizePath(outputPath);
    
    // Check if file exists
    const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);
    
    if (existingFile instanceof TFile) {
      // Update existing file
      await this.app.vault.modify(existingFile, content);
      return existingFile;
    } else {
      // Create new file
      return await this.app.vault.create(normalizedPath, content);
    }
  }
}

