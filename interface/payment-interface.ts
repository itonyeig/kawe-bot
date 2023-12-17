export enum Tier {
    ONE = 1,
    TWO = 2
}

export interface PaymentI {
    reference: string; 
    wa_id: string;
    tier: Tier,
    amount: Number,
    payment_received: boolean,
    // phone_number_id: string,
    valid_till?: Date
}