import { BaseRepository } from '../user/models/base';

class MockRepository extends BaseRepository {
  constructor(T:any) {
    super(T);
  }
}

const mockBcrypt = {
    hash: jest.fn().mockImplementation(),
    compare: jest.fn().mockImplementation(),
}

export {
  MockRepository,
  mockBcrypt
};