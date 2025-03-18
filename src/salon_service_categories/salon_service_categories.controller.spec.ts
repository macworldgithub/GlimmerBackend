import { Test, TestingModule } from '@nestjs/testing';
import { SalonServiceCategoriesController } from './salon_service_categories.controller';

describe('SalonController', () => {
  let controller: SalonServiceCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalonServiceCategoriesController],
    }).compile();

    controller = module.get<SalonServiceCategoriesController>(
      SalonServiceCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
