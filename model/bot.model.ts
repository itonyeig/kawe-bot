import { Schema, model, Document } from 'mongoose';
import { BotI, INameDob, RecomendationInfoInterface } from '../interface/bot.interface';
import { MachineState } from '../states/machine.state';
import { Params } from '../interface/params.interface';
import { Tier } from '../interface/payment-interface';

export interface BotModel extends BotI, Document {}



const NameDobSchema = new Schema<INameDob>({
  name: { type: String, required: true },
  dob: { type: Date, required: true }
}, {
  strict: "throw",
  strictQuery: false,
});

const RecomendationInfoSchema = new Schema<RecomendationInfoInterface>({
  q: {
    type: String,
    required: true,
    enum: ['q1', 'q2', 'q3', 'q4', 'q5']
  },
  answer: {
    type: String,
    required: true
  },
  child: {
    type: String,
    required: true
  }
}, {
  _id: false, 
  strict: "throw",
  strictQuery: false
});

const ParamSchema = new Schema<Params>({
  stringifiedSearchedBooks: String,
  searchMessageToUser: String,
  selectedChild: String,
  createdChild: String,
  selected_book_id: String,
  selected_book: String,
  selected_tier: {
    type: Number,
    enum: Tier,
  },
  email: String,
  selected_child_id: String,
  recommendInfo: {
    type: [RecomendationInfoSchema],
    default: [],
  },
  
}, {
  _id: false,
  strict: "throw",
  strictQuery: false,
});


const BotSchema = new Schema<BotModel>({
    wa_id: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
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
    recommendationInfoCompleted: {
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
    lastPaymentMade: {
      type: Date
    },
    email: {
      type: String
    },
    params: {
      type: ParamSchema,
      default: () => ({}) 
    },
    
  children: {
    type: [NameDobSchema],
    default: []
  },
  recommendInfo: {
    type: [RecomendationInfoSchema],
    default: [],
  },
  tier: {
    type: Number,
    enum: Tier,
  },
},
{
    timestamps: true,
    strict: "throw",
    strictQuery: false,
  })



  export const Bot = model("Bot", BotSchema);