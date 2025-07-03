import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar microservicio TimeServer
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3001 },
  });

  // Iniciar microservicios y servidor HTTP
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();