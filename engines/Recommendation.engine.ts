import Bot from "../bot";
import { BotModel } from "../model/bot.model";
import New_User_States from "../states/new-user.states";
import { formatChildrenList, isValidFormat2, isValidInput, number_of_questions } from "../utils/helper";

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
            const index = +this.bot.userMessage - 1
            const child = this.botProfile.children[index]
            this.botProfile.params.selectedChild = child.name
            this.botProfile.params.selected_child_id = `${child._id}`

            const q_a = this.botProfile.recommendInfo.filter(qa => qa.child === child._id?.toString())

            await this.botProfile.save()
            if (q_a.length >= number_of_questions) {
                await this.bot.recommendations()
                return
            }
            else {
                const name = child.name
                await this.bot.transition(New_User_States.FIRST_QUESTION)
            await this.bot.transmitMessage(`As this is our first time recommending a book for ${name}, we'd like to understand their preferences to provide the best suggestions. To start, we have a few questions that will help us tailor our recommendations. Let's begin with the first one:\n\nWhat type of books does ${name} usually enjoy reading? Feel free to mention specific genres like mystery, science fiction, romance, or non-fiction topics of interest.`)
            }

        } catch (error: any) {
            console.log('err, handle_child_selection_for_recommendation: ', error.message)
        }
    }

}