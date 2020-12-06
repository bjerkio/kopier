/* eslint @typescript-eslint/no-unused-vars: 0 */
import * as faker from 'faker';

export let config = {
  files: [
    faker.system.directoryPath(),
    faker.system.directoryPath(),
    `${faker.system.directoryPath()}/**`,
  ].join('\n'),
  'github-token': faker.random.uuid(),
  repos: [
    `${faker.random.word()}/${faker.random.word()}`,
    `${faker.random.word()}/${faker.random.word()}`,
    `${faker.random.word()}/${faker.random.word()}`,
  ].join(','),
  'base-path': faker.system.directoryPath(),
};

export const getInput = jest.fn((name: string) => {
  return config[name];
})

export const debug = jest.fn();
export const info = jest.fn();
