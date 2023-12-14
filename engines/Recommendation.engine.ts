import Bot from "../bot";
import { BotModel } from "../model/bot.model";
import New_User_States from "../states/new-user.states";
import Recommendation_States from "../states/recommendation.states";
import { formatChildrenList, isValidFormat2, isValidInput } from "../utils/helper";

export class Recommendation_Engine{
    bot: Bot;
    botProfile: BotModel

    constructor(bot: Bot) {
        this.bot = bot
        this.botProfile = this.bot.botProfile
    }

    async handle_child_selection_for_recommendation(){
        const children = this.botProfile.children
        if (!isValidInput(+this.bot.userMessage, children.length)) {
            await this.bot.transmitMessage('Invalid response\n\n' + formatChildrenList(children))
            return
        }
        try {
            
        } catch (error: any) {
            console.log('err, handle_child_selection_for_recommendation: ', error.message)
        }
    }

}