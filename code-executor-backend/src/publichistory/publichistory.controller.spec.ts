import { Test, TestingModule } from '@nestjs/testing';
import { PublichistoryController } from './publichistory.controller';

describe('PublichistoryController', () => {
  let controller: PublichistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublichistoryController],
    }).compile();

    controller = module.get<PublichistoryController>(PublichistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
