import { Test, TestingModule } from '@nestjs/testing';
import { TimeServerController } from './time-server.controller';

describe('TimeServerController', () => {
  let controller: TimeServerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeServerController],
    }).compile();

    controller = module.get<TimeServerController>(TimeServerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
