import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class TimeServerController {
  @MessagePattern({ cmd: 'get_time' })
  getTime(): string {
    return new Date().toISOString();
  }
}