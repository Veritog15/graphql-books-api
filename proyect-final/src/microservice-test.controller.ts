import { Controller, Get } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('test-ms')
export class MicroserviceTestController {
  private client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    // Selecciona el transporte y opciones según el .env
    const transportType = (this.configService.get('TRANSPORT', 'tcp') as string).toLowerCase();
    let options: any;
    switch (transportType) {
      case 'tcp':
        options = {
          transport: Transport.TCP,
          options: {
            host: this.configService.get('TCP_HOST', '127.0.0.1'),
            port: Number(this.configService.get('TCP_PORT', 4001)),
          },
        };
        break;
      case 'nats':
        options = {
          transport: Transport.NATS,
          options: {
            servers: [this.configService.get('NATS_URL', 'nats://localhost:4222')],
          },
        };
        break;
      case 'redis':
        options = {
          transport: Transport.REDIS,
          options: {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: Number(this.configService.get('REDIS_PORT', 6379)),
          },
        };
        break;
      default:
        throw new Error(`Transporte no soportado: ${transportType}`);
    }
    this.client = ClientProxyFactory.create(options);
  }

  @Get()
  async testMicroservice() {
    // Envía el mensaje 'ping' al microservicio y espera la respuesta
    const result = await firstValueFrom(this.client.send('ping', {}));
    return { result };
  }
} 