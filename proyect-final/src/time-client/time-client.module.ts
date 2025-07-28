import { Module } from '@nestjs/common';
import { TimeClientController } from './time-client.controller';

@Module({
  controllers: [TimeClientController],
})
export class TimeClientModule {}