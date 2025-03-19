import { Test, TestingModule } from '@nestjs/testing';
import { SalonServicesService } from './salon_service.service';

describe('SalonService', () => {
  let service: SalonServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalonServicesService],
    }).compile();

    service = module.get<SalonServicesService>(SalonServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
