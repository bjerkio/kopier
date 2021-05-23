import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import type { Commit } from './git-commit';

// TODO: Convert to @octokit/types@^6
type ReposGetResponseData = any;

export interface TemplateContext {
  github: ReposGetResponseData;
  origin: ReposGetResponseData;
  repo: unknown;
  commit: Commit;
}

export async function parseTemplateFile(
  context: TemplateContext,
  file: string,
): Promise<string> {
  const fileContent = readFileSync(file, 'utf-8');
  return parseTemplate(fileContent, context);
}

export async function parseTemplate(templ: string, context: unknown): Promise<string> {
  const template = Handlebars.compile(templ);
  return template(context);
}
