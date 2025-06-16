import { Test, TestingModule } from '@nestjs/testing';
import { PostexController } from './postex.controller';

describe('PostexController', () => {
  let controller: PostexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostexController],
    }).compile();

    controller = module.get<PostexController>(PostexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
