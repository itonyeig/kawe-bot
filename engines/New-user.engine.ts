import Bot from "../bot";
import { BotModel } from "../model/bot.model";
import New_User_States from "../states/new-user.states";
import { convertStringToDate, isValidFormat2 } from "../utils/helper";

export class New_User_Engine{
    bot: Bot;
    botProfile: BotModel

    constructor(bot: Bot) {
        this.bot = bot
        this.botProfile = this.bot.botProfile
    }

    async handle_name_and_dob(){
        if (!isValidFormat2(this.bot.userMessage)) {
            await this.bot.transmitMessage("Invalid response\n\nPlease provide us with some basic details about the child for whom you'd like to order a book:\n\nName, Date of Birth (dd-mm-yyyy)\n\nexample: Amamda, 23-01-2012")
            return
        }
        try {
            const [name, dateString] = this.bot.userMessage.split(',')
            console.log('dateString', dateString)
            console.log('date ', convertStringToDate(dateString))
            this.bot.botProfile.children.push({name: name.trim(), dob: convertStringToDate(dateString)})
            this.bot.botProfile.params.selectedChild = name
            await this.bot.botProfile.save()
            await this.bot.transition(New_User_States.FIRST_QUESTION)
            await this.bot.transmitMessage(`As this is our first time recommending a book for ${name}, we'd like to understand their preferences to provide the best suggestions. To start, we have a few questions that will help us tailor our recommendations. Let's begin with the first one:\n\nWhat type of books does ${name} usually enjoy reading? Feel free to mention specific genres like mystery, science fiction, romance, or non-fiction topics of interest.`)
        } catch (error: any) {
            console.log('err handle_name_and_dob', error.message)
        }
    }

    async save_first_question(){
        const answer = this.bot.userMessage
        const childName = this.botProfile.params.selectedChild as string
        try {
            this.botProfile.recommendInfo.push({
                q: 'q1',
                answer,
                childName
            })
        await this.botProfile.save()
        await this.bot.transition(New_User_States.SECOND_QUESTION)
        await this.bot.transmitMessage(`Thank you for sharing that! It helps us get a sense of ${childName}'s reading tastes. Now, for the next question:\n\nCould you name a few of ${childName}'s favorite authors or books? This will further assist us in understanding their reading preferences and make more accurate recommendations.`)
        } catch (error: any) {
            console.log('err: save_first_question', error.message)
        }
    }

    async save_second_question(){
        const answer = this.bot.userMessage
        const childName = this.botProfile.params.selectedChild as string
        try {
            this.botProfile.recommendInfo.push({
                q: 'q2',
                answer,
                childName
            })
        await this.botProfile.save()
        await this.bot.transition(New_User_States.THIRD_QUESTION)
        await this.bot.transmitMessage(`Thank you! Understanding ${childName}'s favorite authors and books really helps in curating a personalized list. Moving on to the next aspect:\n\nAre you looking for a book that resonates with a particular mood or theme for ${childName}? For instance, something uplifting, thought-provoking, adventurous or anthing else you can think of?`)
        } catch (error: any) {
            console.log('save_second_question', error.message)
        }
    }
    async save_third_question(){
        const answer = this.bot.userMessage
        const childName = this.botProfile.params.selectedChild as string
        try {
            this.botProfile.recommendInfo.push({
                q: 'q3',
                answer,
                childName
            })
        await this.botProfile.save()
        await this.bot.transition(New_User_States.FOURTH_QUESTION)
        await this.bot.transmitMessage(`Got it, that's very helpful to know. The mood or theme can really shape the reading experience. Now, let's explore another aspect:\n\nWhat is ${childName}'s main purpose for reading at the moment? Are they looking to learn something new, escape into a different world, or perhaps seeking a book for personal development?`)
        } catch (error: any) {
            console.log('save_second_question', error.message)
        }
    }
    async save_fourth_question(){
        const answer = this.bot.userMessage
        const childName = this.botProfile.params.selectedChild as string
        try {
            this.botProfile.recommendInfo.push({
                q: 'q4',
                answer,
                childName
            })
        await this.botProfile.save()
        await this.bot.transition(New_User_States.FIFTH_QUESTION)
        await this.bot.transmitMessage(`Thanks for sharing that insight. It's important to align our recommendations with ${childName}'s reading goals. Now, for our last question: \n\nDoes ${childName} have any preferences regarding the length or complexity of the books they read? For example, do they lean towards quick, easy reads, or are they comfortable with longer, more detailed narratives`)
        } catch (error: any) {
            console.log('save_second_question', error.message)
        }
    }
    async save_fifth_question_then_recommend(){
        const answer = this.bot.userMessage
        const childName = this.botProfile.params.selectedChild as string
        try {
            this.botProfile.recommendInfo.push({
                q: 'q5',
                answer,
                childName
            })
        await this.botProfile.save()
        // await this.bot.transition(New_User_States.FIFTH_QUESTION)
        await this.bot.transmitMessage(`alright`)
        } catch (error: any) {
            console.log('save_second_question', error.message)
        }
    }
}