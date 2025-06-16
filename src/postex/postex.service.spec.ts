import { Test, TestingModule } from '@nestjs/testing';
import { PostexService } from './postex.service';

describe('PostexService', () => {
  let service: PostexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostexService],
    }).compile();

    service = module.get<PostexService>(PostexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
