import { Test, TestingModule } from '@nestjs/testing';
import { AvatarGenService } from './avatargen.service';

describe('AvatarGenService', () => {
  let service: AvatarGenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarGenService],
    }).compile();

    service = module.get<AvatarGenService>(AvatarGenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
