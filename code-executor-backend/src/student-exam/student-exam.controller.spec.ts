import { Test, TestingModule } from '@nestjs/testing';
import { StudentExamController } from './student-exam.controller';

describe('StudentExamController', () => {
  let controller: StudentExamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentExamController],
    }).compile();

    controller = module.get<StudentExamController>(StudentExamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
