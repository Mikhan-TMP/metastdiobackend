import { Test, TestingModule } from '@nestjs/testing';
import { AvatarEffectsService } from './avatar-effects.service';

describe('AvatarEffectsService', () => {
  let service: AvatarEffectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarEffectsService],
    }).compile();

    service = module.get<AvatarEffectsService>(AvatarEffectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
