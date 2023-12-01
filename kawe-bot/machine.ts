import MachineState from '../enum/machine.enum';
import BotEngine from "./engine";

type MachineHandler = {
    nextStates: MachineState[]; 
    handle: (engine: BotEngine) => Promise<void>;
  };

  const machine: Record<MachineState, MachineHandler> = {
    [MachineState.IDLE]: {
        nextStates: [MachineState.AWAITING_BOOK_SEARCH_PROMPT],
        handle: async (engine) => {
          await engine.handle_default();
        },
      },
    [MachineState.AWAITING_BOOK_SEARCH_PROMPT]: {
        nextStates: [MachineState.AWAITING_BOOK_SELECTION],
        handle: async (engine) => {
          await engine.book_search();
        },
      },
    [MachineState.AWAITING_BOOK_SELECTION]: {
        nextStates: [],
        handle: async (engine) => {
          await engine.book_selection();
        },
      },
  }

  export default machine
