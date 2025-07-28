import { Injectable } from '@nestjs/common';

export interface Book {
  id: string;
  title: string;
  author: string;
}

@Injectable()
export class BooksService {
  private books: Book[] = [
    { id: '1', title: 'El Quijote', author: 'Miguel de Cervantes' },
    { id: '2', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez' },
  ];

  findAll(): Book[] {
    return this.books;
  }

  findOne(id: string): Book | undefined {
    return this.books.find((book) => book.id === id);
  }

  create(book: Omit<Book, 'id'>): Book {
    const newBook: Book = {
      id: (this.books.length + 1).toString(),
      ...book,
    };
    this.books.push(newBook);
    return newBook;
  }
}