import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Leer el tipo de transporte desde el .env
  const transportType = (configService.get('TRANSPORT', 'tcp') as string).toLowerCase();
  let microserviceOptions: MicroserviceOptions;

  switch (transportType) {
    case 'tcp':
      microserviceOptions = {
        transport: Transport.TCP,
        options: {
          host: configService.get('TCP_HOST', '127.0.0.1'),
          port: Number(configService.get('TCP_PORT', 6001)),
        },
      };
      break;
    case 'nats':
      microserviceOptions = {
        transport: Transport.NATS,
        options: {
          servers: [configService.get('NATS_URL', 'nats://localhost:4222')],
        },
      };
      break;
    case 'redis':
      microserviceOptions = {
        transport: Transport.REDIS,
        options: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: Number(configService.get('REDIS_PORT', 6379)),
        },
      };
      break;
    default:
      throw new Error(`Transporte no soportado: ${transportType}`);
  }

  // Conectar microservicio con el transporte seleccionado
  app.connectMicroservice(microserviceOptions);

  // Iniciar microservicios y servidor HTTP
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();