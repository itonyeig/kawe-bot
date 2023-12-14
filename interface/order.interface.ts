import Bot from "../bot";
import { Book } from "../interface/kawe.interface";

export interface OrderI {
    wa_id: Bot | string; // reference bot
    books: Book | string; // reference book
    due_date: Date;
    fulfilled?: boolean;
    returned?: boolean;
}

