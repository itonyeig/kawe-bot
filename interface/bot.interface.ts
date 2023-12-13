import { MachineStateType } from "../states/machine.state";

export interface BotI {
    wa_id: string;
    token: string;
    fullname: string;
    firstname?: string | null;
    currentState?: MachineStateType;
    previousState?: MachineStateType;
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