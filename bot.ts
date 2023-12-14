import {MachineState, MachineStateType} from "./states/machine.state";
import { BotModel } from "./model/bot.model";
import axios from 'axios';
import Machine from "./machines/machine";
import NEW_USER_STATES, { New_User_States } from "./states/new-user.states";
import { formatChildrenList, generateGPTPContext, isValidInput } from "./utils/helper";
import Recommendation_States from "./states/recommendation.states";
import { getBookRecommendations } from "./services/open-ai.service";
import OrderState from "./states/order.states";


export default class Bot {

    get currentState() {
      return this.botProfile.currentState;
    }

    get previoustState() {
      return this.botProfile.previousState;
    }

    private get machine(){
      return Machine(this)[this.currentState as MachineStateType || MachineState.IDLE]
    }

    botProfile: BotModel;
    userMessage: string;
    whatsapp_phone_id: string;
    whatsapp_number: string;
    default_message: string;
    default_book_search_message = 'What book will you like to search for? Kindly enter the book title or book author.'

    private token = process.env.WHATSAPP_TOKEN;


    constructor(botAttributes: { botProfile?: BotModel, msg?: string, whatsapp_phone_id: string, whatsapp_number: string }){
        this.botProfile = botAttributes.botProfile as BotModel;
        this.userMessage = botAttributes.msg as string;
        this.whatsapp_phone_id = botAttributes.whatsapp_phone_id;
        this.whatsapp_number = botAttributes.whatsapp_number;
        this.default_message = `Please choose from the following options:\n👉[1] Allow us to suggest a book for you\n👉[2]Search our library for a specific book.
        `
    }

    async run() {
        try {
          console.log(
            `state passed in: ${
              this.currentState || null
            }`
          );
      
      
          if (this.currentState !== MachineState.IDLE 
              // && this.currentState !== MachineState.TEMP_USER_HOME
              ) {
            await this.setDefaultState();
          }    
      
          // check if bot has current state OR set current state to idle
          return this.machine.handle()
        } catch (error: any) {
          console.log('error in run method ', error.message)
        }
      }

      private withinBotSession(): boolean {
        if (!this.botProfile.updatedAt) {
          return false;
        }
        const date1 = this.botProfile.updatedAt as Date;
        const date2 = new Date();

          // If the year, month, or date is different, immediately return false
        if (date1.getFullYear() !== date2.getFullYear() ||
            date1.getMonth() !== date2.getMonth() ||
            date1.getDate() !== date2.getDate()) {
            return false;
        }
        const difference = date2.getTime() - date1.getTime();
        const minutes = 45;
        const millisecondsToMinutes = Math.floor(difference / 60000);
        if (millisecondsToMinutes <= minutes) {
          return true;
        } else {
          return false;
        }
      }
    
      private async setDefaultState() {
        if (
          !this.withinBotSession() ||
          (this.userMessage.toLocaleLowerCase() === "hello" && !this.is_currently_in(NEW_USER_STATES))
        ){
          
          try {
            // reset bot
            await this.rebootBot()
            
          } catch (error: any) {
            console.log("setDefaultState error", error.message);
          }
        }
      }

      async rebootBot(){
        console.log("reseting machine ....");
        try {
            this.botProfile.params = {}
            await this.botProfile.save()
            await this.transition(MachineState.IDLE);
        } catch (error) {
          console.log("rebootBot", error)
        }
      }

      private is_currently_in<T extends Record<string, string>>(stateEnum: T): boolean {
        return Object.values(stateEnum).includes(this.currentState as string);
    }

    async handleDefault(){
      try {
        await this.transition(MachineState.AWAITING_WAKE_FROM_IDLE_RESPONSE)
        await this.transmitMessage(`Greetings, ${this.botProfile.name}! ${this.default_message}`)
      
    } catch (error) {
      console.log("err occured in handle_default ", error)
    }
    }

    async handle_wake_from_idle() {
      if (!isValidInput(+this.userMessage, 2)) {
          await this.transmitMessage(`That was not a valid response\n\n${this.default_message}`)
          return;
      }
      try {
        switch (+this.userMessage) {
          case 1:
            if (this.botProfile.recommendationInfoCompleted) {
              // await this.transition(Recommendation_States.)
            } else if (this.botProfile.children.length === 0) {
              await this.transition(New_User_States.NEW_CHILD);
              await this.transmitMessage("Please provide us with some basic details about the child for whom you'd like to order a book:\n\nName, Date of Birth (dd-mm-yyyy)\n\nexample: Amamda, 23-01-2012");
            } else if (this.botProfile.children.length > 0 && this.botProfile.recommendInfo.length >=5) {
              const message = formatChildrenList(this.botProfile.children)
              await this.transition(Recommendation_States.AWAITING_CHILD_NAME)
              await this.transmitMessage(message)
            } else {
              await this.transmitMessage(':::::::::');
            }
            break;
        
          case 2:
            await this.transition(MachineState.AWAITING_BOOK_SEARCH_PROMPT);
            await this.transmitMessage(this.default_book_search_message);
            break;
        
          default:
            await this.transmitMessage('Request could not be processed');
            break;
        }
        
      } catch (error) {
        console.log("err occured in handle_default ", error)
      }
    }

  


    public async transition(newState: MachineStateType) {
        // Debug messages
        console.log(
          `Attempting transition from ${this.currentState} to ${newState}`
        );
    
        // Check if the transition is valid
         const machine = this.machine
        ;
          if (machine && !machine.nextStates.includes(newState) && newState !== MachineState.IDLE && newState !== this.previoustState && newState !== this.currentState) {
          throw new Error(
            `Invalid state transition: ${this.currentState} -> ${newState}`
          );
        }
    
        try {
        //   if (!this.profile.botMode[this.mode]) {
        //     this.profile.botMode[this.mode] = {
        //       botTime: new Date(),
        //       currentState: newState,
        //     };
        //   } else {
        //     // Debug messages
        //     // console.log("before ", this.profile.botMode[this.mode]);
        //     (this.profile.botMode[this.mode] as BotModeState).previousState = this.currentState;
        //     (this.profile.botMode[this.mode] as BotModeState).currentState = newState;
        //     (this.profile.botMode[this.mode] as BotModeState).botTime = new Date();
        //   }

        this.botProfile.previousState = this.currentState;
        this.botProfile.currentState = newState;
    
          this.botProfile = await this.botProfile.save();
          // Debug messages
          // console.log("after ", this.profile.botMode[this.mode]);
          console.log(
            `Successful transition from ${this.previoustState} to ${newState}`
          );
        } catch (error) {
          console.log("Transition", error);
          throw error
        }
      }


      async recommendations(){
        try {
          await this.transmitMessage('thinking...')
          const context = await generateGPTPContext(this.botProfile)
          if (!context.canGenerate) {
              await this.transition(MachineState.IDLE)
              await this.transmitMessage(`an error occured`)
              return
          } 
          const recommendation = await getBookRecommendations(context.childAge, context.bookList, context.orderHistory, context.questionsAnswers)
          await this.transition(OrderState.AWAITING_BOOK_SEARCH_PROMPT)
          await this.transmitMessage(`${recommendation}\n\nPlease enter the title or author of a book we recommended, or feel free to search for any other book or author of your choice`)
        } catch (error) {
          console.log(error)
          throw error
        }
      }
    

    async transmitMessage(msg: string){
        try {
          
          await axios({
              method: "POST",
              url:
                "https://graph.facebook.com/v17.0/" +
                this.whatsapp_phone_id +
                "/messages?access_token=" +
                this.token,
              data: {
                messaging_product: "whatsapp",
                to: this.whatsapp_number,
                text: { body: msg },
                preview_url: true,
              },
              headers: { "Content-Type": "application/json" },
            });
            console.log("transmited message: ", msg)
    
        } catch (error: any) {
          if (error.response && error.response.data && error.response.data.error) {
            console.log('transmitMessage error',error.response.data.error);
          } else {
            console.log('transmitMessage error',error);
          }
          throw error
        }
    }
}