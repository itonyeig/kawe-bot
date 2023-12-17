export interface Book {
  category: string;
  title: string;
  author_name: string;
  publish_date: string;
  language: string;
  page_count: number;
  quantity_available: number;
  about_the_book: string;
  buy_price: number;
  is_available_for_purchase: boolean;
  image_url: string;
  created_at: Date;
  updated_at: Date;
  is_favourite: boolean;
  age_range: string[]
}
