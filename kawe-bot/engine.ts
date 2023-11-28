import MachineState from "../enum/machine.enum";
import { BotModel } from "../model/bot.model";
import Bot from "./bot";
import axios, { AxiosResponse } from 'axios';

export default class BotEngine {

  bot: Bot;
  private botProfile: BotModel;
  default_message:string;

    constructor(bot: Bot) {
        this.bot = bot;
        this.botProfile = this.bot.botProfile
        let name = this.botProfile.firstname || this.botProfile.fullname
        this.default_message = `Hello ${name}, what book will you like to borrow, today? Kindly enter the book title or book author.`
      }

      public async transition(newState: MachineState) {
        return await this.bot.transition(newState);
      }

      async handleHomeState() {
        try {
          await this.bot.transmitMessage(this.default_message)
          await this.transition(MachineState.AWAITING_DEFAULT_PAGE_RESPONSE)
          
        } catch (error) {
          console.log("err occured in handleHomeState ", error)
        }
      }
      async handle_awaiting_home_response() {
        try {
          await this.bot.transmitMessage("it feels soooo good to be alive")
        //   await this.transition(MachineState.AWAITING_DEFAULT_PAGE_RESPONSE)
          
        } catch (error) {
          console.log("err occured in handleHomeState ", error)
        }
      }
    
}