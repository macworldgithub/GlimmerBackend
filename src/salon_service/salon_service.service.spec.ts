import { Test, TestingModule } from '@nestjs/testing';
import { SalonServiceService } from './salon_service.service';

describe('SalonService', () => {
  let service: SalonServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalonServiceService],
    }).compile();

    service = module.get<SalonServiceService>(SalonServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
