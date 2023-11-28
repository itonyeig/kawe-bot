import { Schema, model, Document } from 'mongoose';
import { BotI } from '../interface/bot.interface';
import { MachineState } from '../enum/machine.enum';

export interface BotModel extends BotI, Document {}

const BotSchema = new Schema<BotModel>({
    wa_id: {
        type: String,
        required: true,
        unique: true,
      },
    token: String,
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
},
{
    timestamps: true,
    strict: "throw",
    strictQuery: false,
  })

  export const Bot = model("Bot", BotSchema);