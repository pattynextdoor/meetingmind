/**
 * Mock for Obsidian API
 */

export class App {
  vault = new Vault();
  workspace = new Workspace();
  metadataCache = new MetadataCache();
}

export class Vault {
  private files: Map<string, TFile> = new Map();
  private fileContents: Map<string, string> = new Map();

  getMarkdownFiles(): TFile[] {
    return Array.from(this.files.values());
  }

  async read(file: TFile): Promise<string> {
    return this.fileContents.get(file.path) || '';
  }

  async create(path: string, content: string): Promise<TFile> {
    const file = new TFile();
    file.path = path;
    file.basename = path.split('/').pop()?.replace(/\.md$/, '') || '';
    file.extension = 'md';
    file.name = path.split('/').pop() || '';
    this.files.set(path, file);
    this.fileContents.set(path, content);
    return file;
  }

  async modify(file: TFile, content: string): Promise<void> {
    this.fileContents.set(path, content);
  }

  async createFolder(path: string): Promise<void> {
    // Mock folder creation - just log it
    console.log(`Mock: Created folder ${path}`);
  }

  getAbstractFileByPath(path: string): TFile | null {
    return this.files.get(path) || null;
  }

  // Test helper methods
  _setFile(path: string, content: string): TFile {
    const file = new TFile();
    file.path = path;
    file.basename = path.split('/').pop()?.replace(/\.md$/, '') || '';
    file.extension = 'md';
    file.name = path.split('/').pop() || '';
    this.files.set(path, file);
    this.fileContents.set(path, content);
    return file;
  }

  _clear(): void {
    this.files.clear();
    this.fileContents.clear();
  }
}

export class TFile {
  path: string = '';
  basename: string = '';
  extension: string = '';
  name: string = '';
  stat: { mtime: number } = { mtime: Date.now() };
}

export class Workspace {
  getActiveFile(): TFile | null {
    return null;
  }

  openLinkText(linkText: string, sourcePath: string): Promise<void> {
    return Promise.resolve();
  }

  getLeaf(): any {
    return {
      openFile: (file: TFile) => Promise.resolve(),
    };
  }
}

export class MetadataCache {
  private cache: Map<string, any> = new Map();

  getFileCache(file: TFile): any {
    return this.cache.get(file.path);
  }

  // Test helper
  _setCache(path: string, cache: any): void {
    this.cache.set(path, cache);
  }

  _clear(): void {
    this.cache.clear();
  }
}

export class Plugin {
  app: App = new App();
  manifest: any = {};

  addCommand(command: any): void {}
  addSettingTab(tab: any): void {}
  addStatusBarItem(): HTMLElement {
    return document.createElement('div');
  }
  registerEvent(event: any): void {}
  async loadData(): Promise<any> {
    return {};
  }
  async saveData(data: any): Promise<void> {}
}

export class Notice {
  constructor(message: string) {}
}

export class PluginSettingTab {
  constructor(app: App, plugin: Plugin) {}
}

export class Modal {
  constructor(app: App) {}
  open(): void {}
  close(): void {}
}

export function addIcon(id: string, svg: string): void {}
export function setIcon(element: HTMLElement, icon: string): void {}

export class FileSystemAdapter {
  getBasePath(): string {
    return '/mock/vault';
  }
}

