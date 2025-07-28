import { Test, TestingModule } from '@nestjs/testing';
import { TimeClientController } from './time-client.controller';

describe('TimeClientController', () => {
  let controller: TimeClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeClientController],
    }).compile();

    controller = module.get<TimeClientController>(TimeClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
