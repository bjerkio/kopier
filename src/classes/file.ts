import * as mime from 'mime-types';
import * as fs from 'fs/promises';
import { invariant } from '../utils';
import { Template } from './template';

export class File {
  constructor(
    private path: string,
    private content: string,
    private mime: string,
  ) {}

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
  const localFile = await fs.readFile(path, 'utf-8');
  const m = await mime.lookup(path);
  invariant(m, `could not parse mime type on ${path}`);
  return new File(path, localFile, m);
}
