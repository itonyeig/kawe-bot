import MachineState from '../enum/machine.enum';
import BotEngine from "./engine";

type MachineHandler = {
    nextStates: MachineState[]; 
    handle: (engine: BotEngine) => Promise<void>;
  };

  const machine: Record<MachineState, MachineHandler> = {
    [MachineState.IDLE]: {
        nextStates: [MachineState.AWAITING_DEFAULT_PAGE_RESPONSE],
        handle: async (engine) => {
          await engine.handleHomeState();
        },
      },
    [MachineState.AWAITING_DEFAULT_PAGE_RESPONSE]: {
        nextStates: [MachineState.AWAITING_DEFAULT_PAGE_RESPONSE],
        handle: async (engine) => {
          await engine.handle_awaiting_home_response();
        },
      },
  }

  export default machine
