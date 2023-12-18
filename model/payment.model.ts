import { Schema, model, Document } from 'mongoose';
import { PaymentI, Tier } from "../interface/payment-interface";
import { Bot } from './bot.model';

export interface PaymentModelI extends PaymentI, Document {}

const PaymentSchema = new Schema<PaymentModelI>({
    reference: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
    },
    // phone_number_id: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     immutable: true,
    // },
    wa_id: {
        type: String,
        required: true,
        immutable: true,
        ref: 'Bot'
    },
    tier: {
        type: Number,
        required: true,
        enum: Tier
    },
    amount: {
        type: Number,
        required: true,
        immutable: true,
    },
    payment_received: {
        type: Boolean,
        default: false
    },
    valid_till: {
        type: Date,
    }
}, {
    timestamps: true,
    strict: "throw",
    strictQuery: false,
});



export const PaymentModel = model("Payment", PaymentSchema);

