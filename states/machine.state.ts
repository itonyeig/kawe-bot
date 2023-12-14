import OrderState from './order.states';
import New_User_States from './new-user.states';
import Recommendation_States from './recommendation.states';

export enum DefaultState {
    IDLE="idle",
    AWAITING_WAKE_FROM_IDLE_RESPONSE="awake-from-idle-response"
}
// used as Enum Value
export const MachineState = {
    ...DefaultState,
    ...OrderState,
    ...New_User_States,
    ...Recommendation_States
}

//used as a type (I know, typescript is weird sometimes)
export type MachineStateType = DefaultState | OrderState | New_User_States | Recommendation_States;


