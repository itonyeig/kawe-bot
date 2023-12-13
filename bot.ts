import {MachineState, MachineStateType} from "./states/machine.state";
import { BotModel } from "./model/bot.model";
import axios from 'axios';
import Machine from "./machines/machine";


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

    private token = process.env.WHATSAPP_TOKEN;


    constructor(botAttributes: { botProfile?: BotModel, msg?: string, whatsapp_phone_id: string, whatsapp_number: string }){
        this.botProfile = botAttributes.botProfile as BotModel;
        this.userMessage = botAttributes.msg as string;
        this.whatsapp_phone_id = botAttributes.whatsapp_phone_id;
        this.whatsapp_number = botAttributes.whatsapp_number;
        this.default_message = `Hello ${this.botProfile.name}, what book will you like to borrow, today? Kindly enter the book title or book author.\n\nYou can type 'Hello at any point to come back here`
    }

    async run() {
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
        const minutes = 5;
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
          this.userMessage.toLocaleLowerCase() === "hello"
        ) {
          console.log("reseting machine ....");
          try {
            // reset bot
            await this.rebootBot()
            
          } catch (error: any) {
            console.log("setDefaultState error", error.message);
          }
        }
      }

      async rebootBot(){
        try {
        //   // reset bot here
        //   this.currentMode.invoice = {
        //     payment_type: undefined,
        //     customer: {
        //       customer_name: '',
        //       customer_address: '',
        //       customer_phone_number: '',
        //       customer_email: '',
        //     },
        //     products: [],
        //     selectedProducts: [],
        //   };
    
        //   this.currentMode.express = {
        //     customer_email_address: '',
        //     customer_phone_number: '',
        //     seller_phone_number: '',
        //     seller_email_address: '',
        //     products: [],
        //   };
      
        //   // Save the updated Bot instance
        //   await this.profile.save();
    
        //   const { token, temp_user, _id } = this.profile
    
        //   if (token || temp_user === false) {
        //     await this.transition(MachineState.HOME);
        //   } else {
            //     await this.transition(MachineState.TEMP_USER_HOME)
            //   }
                await this.transition(MachineState.IDLE);
        } catch (error) {
          console.log("rebootBot", error)
        }
    }

    async handleDefault(){
      try {
        await this.transition(MachineState.AWAITING_BOOK_SEARCH_PROMPT)
        await this.transmitMessage(this.default_message)
      
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
            console.log("transmited message", msg)
    
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