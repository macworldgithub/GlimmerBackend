import { Test, TestingModule } from '@nestjs/testing';
import { ProductSubCategoryController } from './product_sub_category.controller';

describe('ProductSubCategoryController', () => {
  let controller: ProductSubCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSubCategoryController],
    }).compile();

    controller = module.get<ProductSubCategoryController>(ProductSubCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
