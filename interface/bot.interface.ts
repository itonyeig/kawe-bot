import { MachineStateType } from "../states/machine.state";
import { Params } from './params.interface';


export interface BotI {
    wa_id: string;
    name: string;
    currentState?: MachineStateType;
    previousState?: MachineStateType;
    params: Params;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;

}

export interface SearchedBooks{
    num: number;
    title: string;
    author: string;
    id: number
}