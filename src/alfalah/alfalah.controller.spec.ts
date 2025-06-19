import { Test, TestingModule } from '@nestjs/testing';
import { AlfalahController } from './alfalah.controller';

describe('AlfalahController', () => {
  let controller: AlfalahController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlfalahController],
    }).compile();

    controller = module.get<AlfalahController>(AlfalahController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
