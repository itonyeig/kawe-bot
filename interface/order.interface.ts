import Bot from "../bot";
import { Book } from "./book.interface";
import { Tier } from "./payment-interface";

export interface OrderI {
    wa_id: Bot | string; // reference bot
    books: Book | string; // reference book
    due_date: Date;
    child: string;
    fulfilled?: boolean;
    returned?: boolean;
    tier?: Tier
}

