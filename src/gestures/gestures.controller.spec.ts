import { Test, TestingModule } from '@nestjs/testing';
import { GesturesController } from './gestures.controller';

describe('GesturesController', () => {
  let controller: GesturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GesturesController],
    }).compile();

    controller = module.get<GesturesController>(GesturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
