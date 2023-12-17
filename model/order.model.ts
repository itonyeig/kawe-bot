import { Schema, model, Document } from 'mongoose';
import { OrderI } from '../interface/order.interface';

export interface OrderModelI extends OrderI, Document {}

const OrderSchema = new Schema<OrderModelI>({
    wa_id: { type: String, required: true, ref: 'Bot', immutable: true, },
    books: { type: Schema.Types.ObjectId, required: true, ref: 'Book', immutable: true, },
    due_date: { type: Date, required: true },
    child: { type: String, required: true },
    fulfilled: { type: Boolean, required: true, default: false },
    returned: { type: Boolean, required: true, default: false },
}, {
    timestamps: true,
    strict: "throw",
    strictQuery: false,
});

export const OrderModel = model('Order', OrderSchema);
