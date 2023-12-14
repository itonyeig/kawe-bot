import { Request, Response } from "express";
import { getBot } from "./utils/helper";
import Bot from "./bot";
import { WhatsAppReqObject } from "./interface/whatsapp.interface";

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
          console.log(JSON.stringify(req.body, null, 2));
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

