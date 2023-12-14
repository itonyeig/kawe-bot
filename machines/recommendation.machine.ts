import Bot from "../bot";
import { New_User_Engine } from "../engines/New-user.engine";
import { Recommendation_Engine } from "../engines/Recommendation.engine";
import New_User_States from "../states/new-user.states";
import Recommendation_States from "../states/recommendation.states";
import { NonEmptyArray } from "../types/not-empty-array.types";


type Reccomedation_MachineHandler = {
    // nextStates: NonEmptyArray<Recommendation_States> ; 
    nextStates: Recommendation_States[] ; 
    handle: () => Promise<void>;
  };

export const recommendation_machine = (bot: Bot): Record<Recommendation_States, Reccomedation_MachineHandler> => {
    const recommendation_engine = new Recommendation_Engine(bot)
    return {
        [Recommendation_States.AWAITING_CHILD_NAME]: {
            nextStates: [],
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
