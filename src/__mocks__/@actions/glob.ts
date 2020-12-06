/* eslint @typescript-eslint/no-explicit-any: 0 */
import * as faker from 'faker';

export const mockedGlob = jest.fn(() => [
  faker.system.filePath(),
  faker.system.filePath(),
  faker.system.filePath(),
  faker.system.filePath(),
  faker.system.filePath(),
  faker.system.filePath(),
  faker.system.filePath(),
]);

export async function create(): Promise<{ glob: jest.Mock<any, any> }> {
  return {
    glob: mockedGlob,
  };
}
