import { Schema, model, Document } from 'mongoose';
import { BotI, INameDob, RecomendationInfoInterface } from '../interface/bot.interface';
import { MachineState } from '../states/machine.state';
import { Params } from '../interface/params.interface';

export interface BotModel extends BotI, Document {}

const ParamSchema = new Schema<Params>({
  stringifiedSearchedBooks: String,
  searchMessageToUser: String,
  selectedChild: String,
  createdChild: String,
  
}, {
  _id: false,
  strict: "throw",
  strictQuery: false,
});

const NameDobSchema = new Schema<INameDob>({
  name: { type: String, required: true },
  dob: { type: Date, required: true }
}, {
  _id: false,
  strict: "throw",
  strictQuery: false,
});

const RecomendationInfoSchema = new Schema({
  q: {
    type: String,
    required: true,
    enum: ['q1', 'q2', 'q3', 'q4', 'q5']
  },
  answer: {
    type: String,
    required: true
  },
  childName: {
    type: String,
    required: true
  }
}, {
  _id: false, 
  strict: "throw",
  strictQuery: false
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
  }
},
{
    timestamps: true,
    strict: "throw",
    strictQuery: false,
  })



  export const Bot = model("Bot", BotSchema);