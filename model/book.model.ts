

import { Book } from '../interface/book.interface';
import { Schema, model, Document } from 'mongoose';

export interface BookModelI extends Book, Document {}

const BookSchema = new Schema<BookModelI>({
  category: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author_name: {
    type: String,
    required: true,
  },
  publish_date: {
    type: String,
  },
  language: {
    type: String,
  },
  page_count: {
    type: Number,
  },
  quantity_available: {
    type: Number,
  },
  about_the_book: {
    type: String,
  },
  buy_price: {
    type: Number,
  },
  is_available_for_purchase: {
    type: Boolean,
  },
  image_url: {
    type: String,
  },
  age_range: {
    type: [String]
  }
}, {
  timestamps: true,
  strict: "throw",
strictQuery: false,
});

export const BookModel = model('Book', BookSchema);
