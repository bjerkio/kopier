/* eslint @typescript-eslint/no-unused-vars: 0 */
import * as faker from 'faker';

export const config = {
  files: [
    faker.system.directoryPath(),
    faker.system.directoryPath(),
    `${faker.system.directoryPath()}/**`,
  ].join('\n'),
  'github-token': '0000000000000000000000000000000000000001',
  repos: [
    'octokit-fixture-org/hello-world',
    'octokit-fixture-org/hello-world',
    'octokit-fixture-org/hello-world',
  ].join(','),
  'base-path': faker.system.directoryPath(),
};

export const getInput = jest.fn((name: string) => {
  return config[name];
})

export const debug = jest.fn();
export const info = jest.fn();
