import { Test, TestingModule } from '@nestjs/testing';
import { ExamGeminiService } from './exam-gemini.service';

describe('ExamGeminiService', () => {
  let service: ExamGeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamGeminiService],
    }).compile();

    service = module.get<ExamGeminiService>(ExamGeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
