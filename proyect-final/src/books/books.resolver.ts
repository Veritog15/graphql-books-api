import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BooksService, Book } from './books.service';
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import Redis from 'ioredis';

@ObjectType()
export class BookType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  author: string;
}

@InputType()
export class CreateBookInput {
  @Field()
  title: string;

  @Field()
  author: string;
}

@Resolver(() => BookType)
export class BooksResolver {
  private redisPub: Redis;
  private redisSub: Redis;
  private lastGatewayMessage: string | null = null;

  constructor(private readonly booksService: BooksService) {
    // Configura Redis
    const redisHost = process.env.REDIS_HOST || '127.0.0.1';
    const redisPort = Number(process.env.REDIS_PORT || 6379);
    this.redisPub = new Redis(redisPort, redisHost);
    this.redisSub = new Redis(redisPort, redisHost);
    this.redisSub.subscribe('gateway-to-graphql', (err, count) => {
      if (!err) {
        // eslint-disable-next-line no-console
        console.log('GraphQL suscrito a gateway-to-graphql');
      }
    });
    this.redisSub.on('message', (channel, message) => {
      if (channel === 'gateway-to-graphql') {
        this.lastGatewayMessage = message;
      }
    });
  }

  @Query(() => [BookType])
  async books() {
    return this.booksService.findAll();
  }

  @Query(() => BookType, { nullable: true })
  async book(@Args('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Mutation(() => BookType)
  async createBook(@Args('input') input: CreateBookInput) {
    // Publica en Redis para que el Gateway lo reciba
    await this.redisPub.publish('graphql-to-gateway', JSON.stringify(input));
    return this.booksService.create(input);
  }

  @Query(() => String, { nullable: true })
  async getLastGatewayMessage() {
    return this.lastGatewayMessage;
  }
}