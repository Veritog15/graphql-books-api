import { Module } from '@nestjs/common';
import { TimeServerController } from './time-server.controller';

@Module({
  controllers: [TimeServerController],
})
export class TimeServerModule {}