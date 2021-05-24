import * as mime from 'mime-types';
import * as fs from 'fs';
import { invariant } from '../utils';
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
      this.content = tmpl.parse(this.content);
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
  invariant(m, `could not parse mime type on ${path}`);
  return new File(path, localFile, m);
}

export async function isDirectory(path: string) {
  const s = fs.statSync(path);
  return s.isDirectory();
}
