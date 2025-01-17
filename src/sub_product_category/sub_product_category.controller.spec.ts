import { Test, TestingModule } from '@nestjs/testing';
import { SubProductCategoryController } from './sub_product_category.controller';

describe('SubProductCategoryController', () => {
  let controller: SubProductCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubProductCategoryController],
    }).compile();

    controller = module.get<SubProductCategoryController>(
      SubProductCategoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
