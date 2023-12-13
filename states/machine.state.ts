import BookSearchState from './bookSearchStates';

export enum DefaultState {
    IDLE="idle",
}
// used as Enum Value
export const MachineState = {
    ...DefaultState,
    ...BookSearchState
}

//used as a type (I know, typescript is weird sometimes)
export type MachineStateType = DefaultState | BookSearchState;


