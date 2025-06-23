import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BooksModule } from './books/books.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql', // Genera automáticamente el archivo de esquema
      sortSchema: true, // Ordena el esquema para consistencia
      playground: true, // Habilita el GraphQL Playground
    }),
    BooksModule,
    ChatModule,
  ],
})
export class AppModule {}