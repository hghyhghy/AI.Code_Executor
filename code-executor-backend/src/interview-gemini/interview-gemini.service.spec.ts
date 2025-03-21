import { Test, TestingModule } from '@nestjs/testing';
import { InterviewGeminiService } from './interview-gemini.service';

describe('InterviewGeminiService', () => {
  let service: InterviewGeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterviewGeminiService],
    }).compile();

    service = module.get<InterviewGeminiService>(InterviewGeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
