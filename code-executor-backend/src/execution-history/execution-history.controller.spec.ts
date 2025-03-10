import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionHistoryController } from './execution-history.controller';

describe('ExecutionHistoryController', () => {
  let controller: ExecutionHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionHistoryController],
    }).compile();

    controller = module.get<ExecutionHistoryController>(ExecutionHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
