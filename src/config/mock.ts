import { BaseRepository } from '../user/models/base';

export class MockRepository extends BaseRepository {
  constructor(T:any) {
    super(T);
  }
}