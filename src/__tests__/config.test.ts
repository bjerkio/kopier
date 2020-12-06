/* eslint @typescript-eslint/ban-ts-comment: 0 */
import * as core from '@actions/core';
import { githubActionConfig } from "../config"

describe('config', () => {
  it('should default to templates/**', () => {
    // @ts-ignore
    core.getInput = jest.fn((name: string) => {
      if (name === 'files') return undefined;
      // @ts-ignore
      return core.config[name];
    });
    const { files } = githubActionConfig();
    expect(files).toStrictEqual(['templates/**']);
  })
})
