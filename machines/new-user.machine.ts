import Bot from "../bot";
import { New_User_Engine } from "../engines/New-user.engine";
import OrderState from "../states/order.states";
import { MachineStateType } from "../states/machine.state";
import New_User_States from "../states/new-user.states";
import { NonEmptyArray } from "../types/not-empty-array.types";


type New_User_MachineHandler = {
    // nextStates: NonEmptyArray<New_User_States> ; 
    nextStates: MachineStateType[] ; 
    handle: () => Promise<void>;
  };

export const new_user_machine = (bot: Bot): Record<New_User_States, New_User_MachineHandler> => {
    const new_user_engine = new New_User_Engine(bot);
    return {
        [New_User_States.NEW_CHILD]: {
            nextStates: [New_User_States.FIRST_QUESTION],
            handle: async () => {
              await new_user_engine.handle_name_and_dob()
            }
          },
          [New_User_States.FIRST_QUESTION]: {
            nextStates: [New_User_States.SECOND_QUESTION],
            handle: async () => {
              await new_user_engine.save_first_question()
            }
          },
          [New_User_States.SECOND_QUESTION]: {
            nextStates: [New_User_States.THIRD_QUESTION],
            handle: async () => {
              await new_user_engine.save_second_question()
            }
          },
          [New_User_States.THIRD_QUESTION]: {
            nextStates: [New_User_States.FOURTH_QUESTION],
            handle: async () => {
              await new_user_engine.save_third_question()
            }
          },
          [New_User_States.FOURTH_QUESTION]: {
            nextStates: [New_User_States.FIFTH_QUESTION],
            handle: async () => {
              await new_user_engine.save_fourth_question()
            }
          },
          [New_User_States.FIFTH_QUESTION]: {
            nextStates: [OrderState.AWAITING_BOOK_SEARCH_PROMPT],
            handle: async () => {
              await new_user_engine.save_fifth_question_then_recommend()
            }
          },
    }
}
