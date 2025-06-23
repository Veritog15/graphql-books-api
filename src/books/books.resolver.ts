import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BooksService, Book } from './books.service';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

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
  constructor(private readonly booksService: BooksService) {}

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
    return this.booksService.create(input);
  }
}