import { Book } from "../interface/kawe.interface";

export interface Order {
    wa_id: string;
    books: Book | string;
    due_date: Date
}

