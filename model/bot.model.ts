import { Schema, model, Document } from 'mongoose';
import { BotI } from '../interface/bot.interface';
import { MachineState } from '../states/machine.state';

export interface BotModel extends BotI, Document {}

const ParamsSchema = new Schema({
  _id: false,
  any: Schema.Types.Mixed
}, {
  strict: "throw",
  strictQuery: false,
});

const BotSchema = new Schema<BotModel>({
    wa_id: {
        type: String,
        required: true,
        unique: true,
      },
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false
    },
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
    params: ParamsSchema
},
{
    timestamps: true,
    strict: "throw",
    strictQuery: false,
  })

  export const Bot = model("Bot", BotSchema);