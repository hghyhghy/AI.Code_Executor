import { Test, TestingModule } from '@nestjs/testing';
import { PublichistoryService } from './publichistory.service';

describe('PublichistoryService', () => {
  let service: PublichistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublichistoryService],
    }).compile();

    service = module.get<PublichistoryService>(PublichistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
