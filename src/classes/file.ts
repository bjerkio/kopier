import * as mime from 'mime-types';
import * as fs from 'fs';
import { Template } from './template';
import { Config } from '../config';

export class File {
  constructor(
    private config: Config,
    private path: string,
    private content: string,
    private mime: string,
  ) {}

  getPath() {
    return this.path;
  }

  getRepoPath() {
    const workspacePath = process.env.GITHUB_WORKSPACE || process.cwd();
    let f = this.path.replace(workspacePath, '');
    if (this.config.basePath) f = f.replace(this.config.basePath, '');
    return f.replace(/^\/+/g, '');
  }

  getContent() {
    return this.content;
  }

  getMime() {
    return this.mime;
  }

  setContent(content: string) {
    this.content = content;
  }

  async parse(tmpl: Template) {
    if (this.mime === 'text/x-handlebars-template') {
      this.content = await tmpl.parse(this.content);
    }

    return {
      path: this.getRepoPath(),
      content: this.getContent(),
      mime: this.getMime(),
    };
  }
}

export async function parseLocalFile(config: Config, path: string) {
  const localFile = fs.readFileSync(path, 'utf-8');
  const m = await mime.lookup(path);
  return new File(config, path, localFile, m || 'application/octet-stream');
}

export function isDirectory(path: string) {
  const s = fs.statSync(path);
  return s.isDirectory();
}
