import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { connect, NatsConnection, StringCodec } from 'nats';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private redisPub: Redis;
  private redisSub: Redis;
  private natsConn: NatsConnection | null = null;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly configService: ConfigService) {
    // Redis
    const redisHost = this.configService.get('REDIS_HOST', '127.0.0.1');
    const redisPort = Number(this.configService.get('REDIS_PORT', 6379));
    this.redisPub = new Redis(redisPort, redisHost);
    this.redisSub = new Redis(redisPort, redisHost);
    this.redisSub.subscribe('graphql-to-gateway', (err, count) => {
      if (err) this.logger.error('Redis subscribe error', err);
      else this.logger.log('Subscribed to graphql-to-gateway');
    });
    this.redisSub.on('message', (channel, message) => {
      if (channel === 'graphql-to-gateway') {
        this.logger.log(`Mensaje de GraphQL por Redis: ${message}`);
        this.server.emit('graphql-message', { content: message });
      }
    });
    this.redisPub.on('error', err => this.logger.error('RedisPub error', err));
    this.redisSub.on('error', err => this.logger.error('RedisSub error', err));

    // NATS
    this.initNats();
  }

  async initNats() {
    try {
      const natsUrl = this.configService.get('NATS_URL', 'nats://localhost:4222');
      this.natsConn = await connect({ servers: natsUrl });
      this.logger.log('Conectado a NATS');
      this.listenToMicroservice();
    } catch (err) {
      this.logger.error('Error conectando a NATS', err);
      setTimeout(() => this.initNats(), 5000); // Reintenta cada 5s
    }
  }

  async listenToMicroservice() {
    if (!this.natsConn) return;
    const sc = StringCodec();
    const sub = this.natsConn.subscribe('microservice-to-gateway');
    this.logger.log('Gateway suscrito a microservice-to-gateway');
    for await (const msg of sub) {
      const data = sc.decode(msg.data);
      this.logger.log(`Respuesta recibida de Microservicio por NATS: ${data}`);
      // Reenviar a todos los clientes WebSocket
      this.server.emit('microservice-message', { content: data });
      // Publicar en Redis para GraphQL
      this.redisPub.publish('gateway-to-graphql', data);
    }
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: string): Promise<void> {
    this.logger.log(`Mensaje recibido de ${client.id}: ${payload}`);
    // Reenvía a todos los clientes WebSocket
    this.server.emit('message', { sender: client.id, content: payload });
    // Publica en Redis para GraphQL
    this.redisPub.publish('gateway-to-graphql', payload);
    // Envía por NATS al microservicio
    if (this.natsConn) {
      const sc = StringCodec();
      try {
        await this.natsConn.publish('gateway-to-microservice', sc.encode(payload));
      } catch (err) {
        this.logger.error('Error enviando mensaje a NATS', err);
      }
    }
  }
}