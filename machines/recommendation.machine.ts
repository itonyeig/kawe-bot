import Bot from "../bot";
import { Recommendation_Engine } from "../engines/Recommendation.engine";
import { MachineState, MachineStateType } from "../states/machine.state";
import New_User_States from "../states/new-user.states";
import Recommendation_States from "../states/recommendation.states";
import { NonEmptyArray } from "../types/not-empty-array.types";


type Recomedation_MachineHandler = {
    // nextStates: NonEmptyArray<Recommendation_States> ; 
    nextStates: MachineStateType[] ; 
    handle: () => Promise<void>;
  };

export const recommendation_machine = (bot: Bot): Record<Recommendation_States, Recomedation_MachineHandler> => {
    const recommendation_engine = new Recommendation_Engine(bot)
    return {
        [Recommendation_States.AWAITING_CHILD_NAME]: {
            nextStates: [MachineState.AWAITING_BOOK_SEARCH_PROMPT, New_User_States.FIRST_QUESTION],
            handle: async () => {
              await recommendation_engine.handle_child_selection_for_recommendation()
            }
          },
        //   [New_User_States.ACCOUNT_TEIR_SELECTION]: {
        //     nextStates: [],
        //     handle: async () => {
        //       await new_user_engine.handle_new_user_1st_message()
        //     }
        //   }
    }
}
