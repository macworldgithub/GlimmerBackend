import { Test, TestingModule } from '@nestjs/testing';
import { SalonServiceCategoriesService } from './salon_service_categories.service';

describe('SalonService', () => {
  let service: SalonServiceCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalonServiceCategoriesService],
    }).compile();

    service = module.get<SalonServiceCategoriesService>(
      SalonServiceCategoriesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
