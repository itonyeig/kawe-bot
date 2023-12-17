import Bot from "../bot";
import { PaymentEngine } from "../engines/Payment.engine";
import { MachineState, MachineStateType } from "../states/machine.state";
import PaymentStates from "../states/paymentStates";
import { NonEmptyArray } from "../types/not-empty-array.types";
import { messages } from "../utils/messages";


type Payment_MachineHandler = {
    // nextStates: NonEmptyArray<PaymentStates> ; 
    nextStates: MachineStateType[] ; 
    handle: () => Promise<void>;
  };

export const payment_machine = (bot: Bot): Record<PaymentStates, Payment_MachineHandler> => {
    const paymentEngine = new PaymentEngine(bot)
    return {
        [PaymentStates.AWAITING_EMAIL]: {
            nextStates: [PaymentStates.SELECT_PAYMENT_TIER],
            handle: async () => {
              await paymentEngine.handle_awaiting_email()
            }
          },
        [PaymentStates.SELECT_PAYMENT_TIER]: {
            nextStates: [PaymentStates.PROCESSING_PAYMENT],
            handle: async () => {
              await paymentEngine.handle_tier_selection()
            }
          },
        [PaymentStates.PROCESSING_PAYMENT]: {
            nextStates: [],
            handle: async () => {
              try {
                await bot.transmitMessage(messages.processing_payment)
              } catch (error: any) {
                console.log('error PaymentStates.PROCESSING_PAYMENT state ', error.message)
              }
            }
          },
        
    }
}