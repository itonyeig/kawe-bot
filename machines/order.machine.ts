import Bot from "../bot";
import OrderEngine from "../engines/order.engine";
import OrderState from "../states/order.states";
import { MachineStateType } from "../states/machine.state";


type BookMachineHandler = {
    nextStates: MachineStateType[]; 
    handle: () => Promise<void>;
  };


  export const order_machine = (bot: Bot): Record<OrderState, BookMachineHandler> => {
    const orderEngine = new OrderEngine(bot);
  
    return {
      [OrderState.AWAITING_BOOK_SEARCH_PROMPT]: {
        nextStates: [OrderState.AWAITING_BOOK_SELECTION],
        handle: async () => {
          await orderEngine.book_search()
        }
      },
    [OrderState.AWAITING_BOOK_SELECTION]: {
        nextStates: [],
        handle: async () => {
          await orderEngine.book_selection()
        }
      },

      // ... other order-related states
    };
  };

