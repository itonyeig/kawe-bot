import { Request, Response } from "express";
import { accountPaidFor, getBot,calculateOriginalAmountFromTotal } from "./utils/helper";
import Bot from "./bot";
import { Bot as BotModel, BotModel as BotModelInterface } from './model/bot.model';
import { WhatsAppReqObject } from "./interface/whatsapp.interface";
import { createHmac } from 'crypto';
import { PaystackWebhook } from "./interface/paystack.interface";
import { PaymentModel } from "./model/payment.model";
import { MachineState } from "./states/machine.state";
import { messages } from "./utils/messages";
import { addMonths } from "date-fns";


export async function whatsappGET(req: Request, res: Response) {
    try {
      const token = process.env.VERIFY_TOKEN_WHATSAPP;
      if (
        req.query["hub.mode"] == "subscribe" &&
        req.query["hub.verify_token"] == token
      ) {
        console.log("webhook connected");
        res.send(req.query["hub.challenge"]);
      } else {
        res.sendStatus(400);
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  export async function whatsappPOST(req: Request, res: Response) {
    try {
  
      // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
      if (req.body.object) {
        const body: WhatsAppReqObject = req.body;
        if (
          body.entry &&
          body.entry[0].changes &&
          body.entry[0].changes[0] &&
          body.entry[0].changes[0].field === 'messages' && // Ensures it's a message event
          body.entry[0].changes[0].value.messages &&
          body.entry[0].changes[0].value.messages[0] &&
          body.entry[0].changes[0].value.messages[0].type === 'text' && // Check if it's a text message
          body.entry[0].changes[0].value.contacts && // Ensures contacts field is present
          body.entry[0].changes[0].value.contacts[0]
        ) {
          res.sendStatus(200); // Send this as soon as you receive the webhook to prevent messages from being re-sent by whatsapp while server is processing
           // Check the Incoming webhook message
          // console.log(JSON.stringify(req.body, null, 2));
          let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
          let whatsapp_number = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
          let msg = req.body.entry[0].changes[0].value.messages[0].text.body.trim(); // extract the message text from the webhook payload
          
          let name = body.entry[0].changes[0].value.contacts[0].profile.name
  
          const botProfile = await getBot(whatsapp_number, name)

           if (botProfile !== undefined) {
            const kawe_bot = new Bot({botProfile, msg, whatsapp_number, whatsapp_phone_id: phone_number_id });
            await kawe_bot.run();
          } else {
          const temp_user = new Bot({whatsapp_phone_id: phone_number_id, whatsapp_number})

            await temp_user.transmitMessage('This number is not associated with any account with us. Please visit xyz.com to create an account')
          }
          
        }
        
      } else {
        res.sendStatus(404);
      }
    } catch (error: any) {
      console.log(
        "webhook caught an error ",
        error.data || error.message || error
      );
      res.send(error);
    }
  }

  export async function paystack(req: Request, res: Response) {

    
    
    const { body } = req;

    const data = {
      requestSuccessful: true,
      sessionId: "",
      responseMessage: "success",
      responseCode: "00",
    };

    res.status(200).send(data); // send so that paystack does not resend the same request while server is processing
    try {
      
    const secret = process.env.PAYSTACK_SECRET;
    const hash = createHmac("sha512", `${secret}`)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash != req.headers["x-paystack-signature"]) {
      return res.status(401).send({ error: "Unathorised" });
    }

    const paystack: PaystackWebhook = req.body;
    const { reference} = paystack.data
    const amount = (paystack.data.amount)/100
    const record = await PaymentModel.findOne({reference, payment_received: false})
    
    if (paystack.event !== "charge.success" || !record || record.amount !== calculateOriginalAmountFromTotal(paystack.data.amount)) {
      return res.status(400).send("Bad Request");
    }

    await PaymentModel.findOneAndUpdate({ reference }, { payment_received: true, valid_till: addMonths(new Date(), 6) })
    await  BotModel.updateOne({ wa_id: record.wa_id }, { 
      active: true, 
      lastPaymentMade: new Date(), 
      tier: accountPaidFor(amount), 
      currentState: MachineState.AWAITING_WAKE_FROM_IDLE_RESPONSE, 
      previousState: MachineState.IDLE ,
      params: {},
    });
    
    const bot = new Bot({whatsapp_phone_id: `${process.env.TEMPLATE_PHONE_NUMBER_ID}`, whatsapp_number: record.wa_id})

    await bot.transmitMessage(`${messages.payment_recieved} ${messages.default_message}${messages.selection}`)
    

    

    } catch (error: any) {
      console.log(
        "Paystack webhook caught an error ",
        error.data || error.message || error
      );
      res.send(error);
    }
  }

