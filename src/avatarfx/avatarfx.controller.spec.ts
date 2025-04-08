import { Test, TestingModule } from '@nestjs/testing';
import { AvatarfxController } from './avatarfx.controller';

describe('AvatarfxController', () => {
  let controller: AvatarfxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarfxController],
    }).compile();

    controller = module.get<AvatarfxController>(AvatarfxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
