import Bot from "../bot";
import { Tier } from "../interface/payment-interface";
import { BotModel } from "../model/bot.model";
import { MachineState } from "../states/machine.state";
import PaymentStates from "../states/paymentStates";
import { countDigitPatterns, createPayment, isValidEmail, isValidInput, subscription_is_still_valid, teir_one_amount } from "../utils/helper";
import { messages } from "../utils/messages";

export class PaymentEngine{
    bot: Bot;
    botProfile: BotModel

    constructor(bot: Bot) {
        this.bot = bot
        this.botProfile = this.bot.botProfile
    }

    async handle_awaiting_email(){
        const email = this.bot.userMessage
        if (!isValidEmail(email)) {
            await this.bot.transmitMessage(`${messages.invalid_response}${messages.request_email}`)
            return
        }
        try {
            this.botProfile.params.email = email
            await this.botProfile.save()
            await this.bot.transition(PaymentStates.SELECT_PAYMENT_TIER)
            await this.bot.transmitMessage(messages.default_payment_message)
        } catch (error) {
            
        }
    }
    async handle_tier_selection(){
        const selected_tier = +this.bot.userMessage
        if (!isValidInput(selected_tier, countDigitPatterns(messages.default_payment_message))) {
            await this.bot.transmitMessage(`${messages.invalid_response}${messages.default_payment_message}`)
            return
        }
        try {
            this.botProfile.params.selected_tier = selected_tier;
            await this.botProfile.save()
            
            if (selected_tier === Tier.ONE) {
                if ((await subscription_is_still_valid(this.botProfile))) {
                    await this.bot.transition(MachineState.IDLE)
                    await this.bot.transmitMessage(`Subscription still valid for tier ${selected_tier} account`)
                    return
                }
                if (this.botProfile?.params?.email) {
                    this.botProfile.email = this.botProfile.params.email;
                    await this.botProfile.save()
                }
                const paymentLink = await createPayment(this.botProfile.wa_id, Tier.ONE, teir_one_amount, this.botProfile.email || 'kawe@email.com')
                await this.bot.transition(PaymentStates.PROCESSING_PAYMENT)
                await this.bot.transmitMessage(messages.make_payment_message + paymentLink)
            } else {
                
            }
        } catch (error: any) {
            console.log('err occured in handle_tier_selection:', error.message )
        }
    }

}