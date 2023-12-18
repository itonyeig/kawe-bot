import {MachineState, MachineStateType} from "./states/machine.state";
import { BotModel } from "./model/bot.model";
import axios from 'axios';
import Machine from "./machines/machine";
import NEW_USER_STATES, { New_User_States } from "./states/new-user.states";
import { Check_User_Payment_Status, book_due_in_weeks, countDigitPatterns, escape_word, formatChildrenList, generateGPTPContext, isValidInput, max_tier_1, number_of_questions, subscription_is_still_valid, userOnFreeTrial } from "./utils/helper";
import Recommendation_States from "./states/recommendation.states";
import { getBookRecommendations } from "./services/open-ai.service";
import OrderState from "./states/order.states";
import { messages } from "./utils/messages";
import { subWeeks } from "date-fns";
import { OrderModel } from "./model/order.model";
import { Tier } from "./interface/payment-interface";
import PaymentStates from "./states/paymentStates";


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
    default_message = `${messages.default_message}${messages.selection}\n\nType '${escape_word}' at any point to come back here`;
    default_book_search_message = 'What book will you like to search for? Kindly enter the book title or book author.';
    reset_bot_values = {
      recommendInfo: []
    }

    private token = process.env.WHATSAPP_TOKEN;


    constructor(botAttributes: { botProfile?: BotModel, msg?: string, whatsapp_phone_id: string, whatsapp_number: string }){
        this.botProfile = botAttributes.botProfile as BotModel;
        this.userMessage = botAttributes.msg as string;
        this.whatsapp_phone_id = botAttributes.whatsapp_phone_id;
        this.whatsapp_number = botAttributes.whatsapp_number;
        console.log('whatsappId - ', this.whatsapp_phone_id)
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
          
          // if (this.currentState === MachineState.IDLE) {
          //   await this.rebootBot()
            
          // }
      
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
          (this.userMessage.toLocaleLowerCase() === escape_word && !this.is_currently_in_state(PaymentStates.PROCESSING_PAYMENT)
          )
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
            this.botProfile.params = this.reset_bot_values
            await this.botProfile.save()
            if (this.currentState !== MachineState.IDLE) {
              await this.transition(MachineState.IDLE)
              
            }
        } catch (error) {
          console.log("rebootBot", error)
        }
      }

      /**
       * Checks if the current state matches any of the provided state values or state objects.
       * 
       * This function accepts a variable number of arguments, each of which can either be a string representing a single state,
       * or an object where each property value is a state. The function iterates through these arguments to determine
       * if the current state (`this.currentState`) matches any of the provided states.
       * 
       * @param {...Array<string | Record<string, string>>} states - A rest parameter that can take multiple arguments.
       * Each argument can be either a string (representing an individual state) or an object (representing multiple states).
       * 
       * - If an argument is an object, the function checks if any value within this object matches `this.currentState`.
       * - If an argument is a string, it directly compares this string with `this.currentState`.
       * 
       * The function returns `true` as soon as it finds a match. If no matches are found after checking all arguments,
       * it returns `false`.
       * 
       * @returns {boolean} - Returns `true` if `this.currentState` matches any of the provided states, otherwise returns `false`.
       * 
       */
      private is_currently_in_state(...states: Array<string | Record<string, string>>): boolean {
        for (const state of states) {
          if (typeof state === 'object') {
              if (Object.values(state).includes(this.currentState as string)) {
                  return true;
              }
          } else if (this.currentState === state) {
              return true;
          }
      }
      return false;
    }

    async handleDefault(){
      try {
        await this.transition(MachineState.AWAITING_WAKE_FROM_IDLE_RESPONSE)
        await this.transmitMessage(`Greetings, ${this.botProfile.name}! ${this.default_message}`)
      
    } catch (error) {
      console.log("err occured in handle_default ", error)
    }
    }

     async save_selected_child_name_and_id_to_params(){
      const index = +this.userMessage - 1
      const child = this.botProfile.children[index]
      this.botProfile.params.selectedChild = child.name
      this.botProfile.params.selected_child_id = `${child._id}`

      await this.botProfile.save()

      return child;
    }

    async handle_wake_from_idle() {
      if (!isValidInput(+this.userMessage, countDigitPatterns(this.default_message))) {
          await this.transmitMessage(`That was not a valid response\n\n${this.default_message}`)
          return;
      }
      try {
        
        switch (+this.userMessage) {
          case 1:
            // const recommendInfo 
            if (this.botProfile.recommendationInfoCompleted) {
              // await this.transition(Recommendation_States.)
            } else if (this.botProfile.children.length === 0) {
              await this.transition(New_User_States.NEW_CHILD);
              await this.transmitMessage(messages.new_child);
            } else if (this.botProfile.children.length > 0 && this.botProfile.recommendInfo.length >=number_of_questions) {
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

          case 3:
            const tier = this.botProfile.tier;
            const wa_id = this.botProfile.wa_id;
            const is_sub_valid = await subscription_is_still_valid(this.botProfile)
            console.log(is_sub_valid)
            if (tier === Tier.ONE && this.botProfile.children.length < max_tier_1 && is_sub_valid) {
              await this.transition(New_User_States.NEW_CHILD);
              await this.transmitMessage(messages.new_child);
            } else if(tier === Tier.ONE && this.botProfile.children.length >= max_tier_1 && is_sub_valid){
              await this.transition(MachineState.IDLE)
              await this.transmitMessage('You have the maximum amount of children that can be on a tier 1 account');
            }
            else if(tier === Tier.TWO && is_sub_valid){
              // please this is important... i will add code here later
            }
            else if (userOnFreeTrial(this.botProfile) && this.botProfile.children.length === 0){
              await this.transition(New_User_States.NEW_CHILD);
              await this.transmitMessage(messages.new_child);
            }
            else if(!userOnFreeTrial(this.botProfile) || this.botProfile.children.length !== 0){
              if (this.botProfile.email) {
                await this.transition(MachineState.SELECT_PAYMENT_TIER);
                await this.transmitMessage(`${messages.add_child_on_free}\n\n${messages.default_payment_message}`);
                break;
              } else {
                await this.transition(MachineState.AWAITING_EMAIL)
                await this.transmitMessage(`${messages.add_child_on_free}\n\n${messages.request_email}`)
                break;
              }
            }
            else {
              await this.transmitMessage('Something went wrong');
            }
            break;
          case 4:
            if (this.botProfile.email) {
              await this.transition(MachineState.SELECT_PAYMENT_TIER);
              await this.transmitMessage(messages.default_payment_message);
              break;
            } else {
              await this.transition(MachineState.AWAITING_EMAIL)
              await this.transmitMessage(messages.request_email)
              break;
            }
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

          if (this.botProfile.currentState === MachineState.IDLE && 
            JSON.stringify(this.botProfile.params) !== JSON.stringify(this.reset_bot_values)
            ) {
            console.log("this.botProfile.currentState   ", this.botProfile.currentState )
            console.log("this.botProfile.params  ", this.botProfile.params)
            console.log("reset_bot_values  ", this.reset_bot_values)
            console.log("howdy  ")
            await this.rebootBot()
          }
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
          const checker = await this.check_if_user_can_make_order()
          if (!checker.move_on) {
            await this.transmitMessage(checker.message || "Could not process")
            return
          }
          await this.transmitMessage('Loading...')
          const context = await generateGPTPContext(this.botProfile)
          if (!context.canGenerate) {
              await this.transition(MachineState.IDLE)
              await this.transmitMessage(`an error occured`)
              return
          } 
          const recommendation = await getBookRecommendations(context.childAge, context.bookList, context.orderHistory, context.questionsAnswers, this.botProfile.params.selectedChild as string)
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

    async transmitTemplateMessage(templateName: string, recipientNumber: string) {
      try {
          const whatsappPhoneId = process.env.TEMPLATE_PHONE_NUMBER_ID;
  
          await axios.post(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
              messaging_product: "whatsapp",
              to: recipientNumber,
              type: "template",
              template: {
                  name: templateName,
                  language: { code: "en_US" }
              }
          }, {
              headers: {
                  'Authorization': `Bearer ${this.token}`,
                  'Content-Type': 'application/json'
              }
          });
  
          console.log("Transmitted template message:", templateName);
  
      } catch (error: any) {
          if (error.response && error.response.data && error.response.data.error) {
              console.log('transmitTemplateMessage error', error.response.data.error);
          } else {
              console.log('transmitTemplateMessage error', error);
          }
          throw error;
      }
  }


  async check_if_user_can_make_order(): Promise<{move_on: boolean, message: Check_User_Payment_Status}> {
    const selectedChild = this.botProfile.params.selectedChild
    const selectedChildObj = this.botProfile.children.find(child => child.name === selectedChild)
  
  
    try {
  
      // const twoWeeksAgo = subWeeks(new Date(), 2);
      const onFreeTrial = userOnFreeTrial(this.botProfile)
      const tier = this.botProfile?.tier as Tier
      // const selectedChild = this.botProfile.children.find(child => child.name === selectedChild);
      if (!selectedChildObj) {
          throw new Error('Selected child not found');
      }
  
      // Check if the user can order for the selected child
      const ordersForChild = await OrderModel.countDocuments({
          wa_id: this.botProfile.wa_id,
          child: selectedChildObj?._id,
          returned: false,
          // fulfilled: true,
      });

      let move_on = false
      let message = Check_User_Payment_Status.NULL
      console.log('doc', ordersForChild)

      if (onFreeTrial) {
          // User on free trial can order one book for one child
          move_on = ordersForChild < 1, 
          message = move_on ? Check_User_Payment_Status.NULL : Check_User_Payment_Status.FREE_TRIAL;
          
      } else if (await subscription_is_still_valid(this.botProfile)){
        move_on = ordersForChild < book_due_in_weeks
        console.log('cdewcewcwecw', move_on)
        message = move_on ? Check_User_Payment_Status.NULL : Check_User_Payment_Status.UNRETURN_BOOKS;

        // switch (tier) {
          // case Tier.ONE:
          //     // Tier 1: User can order two books for a child in 2 weeks
          //     return ordersForChild < book_due_in_weeks;
          // case Tier.TWO:
          //     // Additional logic for Tier 2 if needed
          //     break;
          // Handle other tiers if necessary
          // default:
          //   return false;
          //   break;
        // }

      } else {
        // set bot to in-active as subscription and free trial are up
        this.botProfile.active = false;
        await this.botProfile.save()
        
      }

      // if (!move_on) {
      //   await this.transition(MachineState.IDLE)
      // }
      return {
        move_on,
        message
      }
  } catch (error) {
      console.error('Error checking order eligibility:', error);
      throw error;
  }
  
  }
  
}