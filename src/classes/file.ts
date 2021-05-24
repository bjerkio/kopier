import * as mime from 'mime-types';
import * as fs from 'fs';
import { Template } from './template';

export class File {
  constructor(
    private path: string,
    private content: string,
    private mime: string,
  ) {}

  getPath() {
    return this.path;
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
      path: this.path,
      content: this.content,
      mime: this.mime,
    };
  }
}

export async function parseLocalFile(path: string) {
  const localFile = fs.readFileSync(path, 'utf-8');
  const m = await mime.lookup(path);
  return new File(path, localFile, m || 'application/octet-stream');
}

export function isDirectory(path: string) {
  const s = fs.statSync(path);
  return s.isDirectory();
}
