import { Schema, model, Document } from 'mongoose';
import { BotI } from '../interface/bot.interface';

export interface BotModel extends BotI, Document {}

const BotSchema = new Schema<BotModel>({
    wa_id: {
        type: String,
        required: true,
        unique: true,
      },
    token: String,
    fullname: { type: String, required: true },
    firstname: String
},
{
    timestamps: true,
    strict: "throw",
    strictQuery: false,
  })

  export const Bot = model("Bot", BotSchema);