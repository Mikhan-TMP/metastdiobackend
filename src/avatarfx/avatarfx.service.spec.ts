import { Test, TestingModule } from '@nestjs/testing';
import { AvatarfxService } from './avatarfx.service';

describe('AvatarfxService', () => {
  let service: AvatarfxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarfxService],
    }).compile();

    service = module.get<AvatarfxService>(AvatarfxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
