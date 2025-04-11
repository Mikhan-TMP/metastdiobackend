import { Test, TestingModule } from '@nestjs/testing';
import { AvatarEffectsController } from './avatar-effects.controller';

describe('AvatarEffectsController', () => {
  let controller: AvatarEffectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarEffectsController],
    }).compile();

    controller = module.get<AvatarEffectsController>(AvatarEffectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
