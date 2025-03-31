import { Test, TestingModule } from '@nestjs/testing';
import { StudentExamService } from './student-exam.service';

describe('StudentExamService', () => {
  let service: StudentExamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentExamService],
    }).compile();

    service = module.get<StudentExamService>(StudentExamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
