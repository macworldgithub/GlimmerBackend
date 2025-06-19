import { Test, TestingModule } from '@nestjs/testing';
import { AlfalahService } from './alfalah.service';

describe('AlfalahService', () => {
  let service: AlfalahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlfalahService],
    }).compile();

    service = module.get<AlfalahService>(AlfalahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
