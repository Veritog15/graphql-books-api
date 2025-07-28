import { Controller, Get } from '@nestjs/common';
import { Client, ClientTCP, Transport } from '@nestjs/microservices';

@Controller('time')
export class TimeClientController {
  @Client({ transport: Transport.TCP, options: { host: 'localhost', port: 3001 } })
  private client: ClientTCP;

  @Get()
  async getTime() {
    return this.client.send({ cmd: 'get_time' }, {});
  }
}