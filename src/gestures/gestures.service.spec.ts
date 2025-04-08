import { Test, TestingModule } from '@nestjs/testing';
import { GesturesService } from './gestures.service';

describe('GesturesService', () => {
  let service: GesturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GesturesService],
    }).compile();

    service = module.get<GesturesService>(GesturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
