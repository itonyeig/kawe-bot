import { MachineState } from "../enum/machine.enum";

export interface BotI {
    wa_id: string;
    token?: string;
    fullname: string;
    firstname?: string | null;
    currentState?: MachineState;
    previousState?: MachineState;
    createdAt?: Date;
    updatedAt?: Date;
}

// export interface B