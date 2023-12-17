import { MachineStateType } from "../states/machine.state";
import { Params } from './params.interface';
import { Tier } from "./payment-interface";


export interface BotI {
    wa_id: string;
    name: string;
    currentState?: MachineStateType;
    previousState?: MachineStateType;
    params: Params;
    active: boolean;
    recommendationInfoCompleted: boolean;
    children: INameDob[];
    tier?: Tier
    createdAt?: Date;
    updatedAt?: Date;
    recommendInfo: RecomendationInfoInterface[];
    lastPaymentMade?: Date;
    email?: string;

}

export interface SearchedBooks{
    num: number;
    title: string;
    author: string;
    id: string
}

export interface INameDob  {
    name: string;
    dob: Date;
    _id?: string
}

export interface RecomendationInfoInterface {
    q: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
    answer: string,
    child: string
}