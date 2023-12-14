import { MachineState, MachineStateType } from '../states/machine.state';
import Bot from '../bot';
import { order_machine } from './order.machine';
import { new_user_machine } from './new-user.machine';
import OrderState from '../states/order.states';
import Recommendation_States from '../states/recommendation.states';
import { recommendation_machine } from './recommendation.machine';
import New_User_States from '../states/new-user.states';

type MachineHandler = {
    nextStates: MachineStateType[]; 
    handle: () => Promise<void>;
  };


export const machine = (bot: Bot): Record<MachineStateType, MachineHandler> =>  {

  return {
    [MachineState.IDLE]: {
      nextStates: [MachineState.AWAITING_WAKE_FROM_IDLE_RESPONSE],
      handle: async () => {
        await bot.handleDefault()
      },
    },
    [MachineState.AWAITING_WAKE_FROM_IDLE_RESPONSE]: {
      nextStates: [OrderState.AWAITING_BOOK_SEARCH_PROMPT, Recommendation_States.AWAITING_CHILD_NAME, New_User_States.NEW_CHILD],
      handle: async () => {
        await bot.handle_wake_from_idle()
      },
    },
    ...new_user_machine(bot),
    ...order_machine(bot),
    ...recommendation_machine(bot)
    // ... integrate other state machines similarly
  };
};
  export default machine



