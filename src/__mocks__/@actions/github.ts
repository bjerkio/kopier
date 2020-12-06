import * as faker from 'faker';
export const get = jest.fn(() => ({ data: faker.random.word() }));
export const getOctokit = jest.fn(() => ({
  repos: {
    get,
  },
}));
