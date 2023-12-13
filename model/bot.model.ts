import { Schema, model, Document } from 'mongoose';
import { BotI } from '../interface/bot.interface';
import { MachineState } from '../states/machine.state';

export interface BotModel extends BotI, Document {}

const BotSchema = new Schema<BotModel>({
    wa_id: {
        type: String,
        required: true,
        unique: true,
      },
    token: {
      type: String,
      required: true,
    },
    fullname: { type: String, required: true },
    firstname: String,
    currentState: {
      type: String,
      enum: Object.values(MachineState),
      default: MachineState.IDLE,
    },
    previousState: {
      type: String,
      enum: [...Object.values(MachineState), null],
      default: null,
    },
    stringifiedSearchedBooks: String,
    searchMessageToUser: String
},
{
    timestamps: true,
    strict: "throw",
    strictQuery: false,
  })

  export const Bot = model("Bot", BotSchema);