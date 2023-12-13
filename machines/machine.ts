import { MachineState, MachineStateType } from '../states/machine.state';
import Bot from '../bot';
import bookStates from './bookSearch.machine';

type MachineHandler = {
    nextStates: MachineStateType[]; 
    handle: () => Promise<void>;
  };


export const machine = (bot: Bot): Record<MachineStateType, MachineHandler> =>  {

  return {
    [MachineState.IDLE]: {
      nextStates: [MachineState.AWAITING_BOOK_SEARCH_PROMPT],
      handle: async () => {
        await bot.handleDefault()
      },
    },
    ...bookStates(bot),
    // ... integrate other state machines similarly
  };
};
  export default machine



