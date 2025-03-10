import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionHistoryService } from './execution-history.service';

describe('ExecutionHistoryService', () => {
  let service: ExecutionHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionHistoryService],
    }).compile();

    service = module.get<ExecutionHistoryService>(ExecutionHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
