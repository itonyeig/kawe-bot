import { MachineState } from "../enum/machine.enum";

export interface BotI {
    wa_id: string;
    token: string;
    fullname: string;
    firstname?: string | null;
    currentState?: MachineState;
    previousState?: MachineState;
    stringifiedSearchedBooks?: string;
    searchMessageToUser?: string;

    createdAt?: Date;
    updatedAt?: Date;

}

export interface SearchedBooks{
    num: number;
    title: string;
    author: string;
    id: number
}