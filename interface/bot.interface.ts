import { MachineStateType } from "../states/machine.state";
import { Params } from './params.interface';


export interface BotI {
    wa_id: string;
    name: string;
    currentState?: MachineStateType;
    previousState?: MachineStateType;
    params: Params;
    active: boolean;
    recommendationInfoCompleted: boolean;
    children: INameDob[];
    tier?: string
    createdAt?: Date;
    updatedAt?: Date;
    recommendInfo: RecomendationInfoInterface[]

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
}

export interface RecomendationInfoInterface {
    q: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
    answer: string,
    childName: string
}