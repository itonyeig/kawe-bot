import { RecomendationInfoInterface } from "./bot.interface";

export interface Params {
    stringifiedSearchedBooks?: string;
    searchMessageToUser?: string;
    selectedChild?: string;
    createdChild?: string;
    selected_book_id?: string;
    selected_book?: string;
    selected_tier?: number;
    email?: string;
    selected_child_id?: string;
    recommendInfo: RecomendationInfoInterface[]
}
