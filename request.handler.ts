import { Request, Response } from "express";

export async function whatsappGET(req: Request, res: Response) {
    try {
    //   const token = process.env.VERIFY_TOKEN_WHATSAPP;
    //   if (
    //     req.query["hub.mode"] == "subscribe" &&
    //     req.query["hub.verify_token"] == token
    //   ) {
    //     console.log("webhook connected");
    //     res.send(req.query["hub.challenge"]);
    //   } else {
    //     res.sendStatus(400);
    //   }
    res.send('its alive')
    } catch (error) {
      console.log(error);
    }
  }export async function whatsappPOST(req: Request, res: Response) {
    try {
        /**
      const token = process.env.WHATSAPP_TOKEN;
      // Check the Incoming webhook message
      // console.log(JSON.stringify(req.body, null, 2));
  
      // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
      if (req.body.object) {
        if (
          req.body.entry &&
          req.body.entry[0].changes &&
          req.body.entry[0].changes[0] &&
          req.body.entry[0].changes[0].value.messages &&
          req.body.entry[0].changes[0].value.messages[0]
        ) {
          let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
          let whatsapp_number = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
          let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body.trim(); // extract the message text from the webhook payload
          const body: WhatsAppReqObject = req.body;
          let message: string | undefined = "Hello there,\nSorry, this number isn't associated with any account on Sanwo.\n\nIf you have an account on Sanwo, you can update your Phone number.\n\nIf you don’t have an account yet and you are a vendor, you can simply create an account.\n\nIf you are a buyer looking to secure your transaction on Social media, you can create an express transaction without having an account on Sanwo.\n\nSo, what would you like to do?";
  
          const user = (await getUser(whatsapp_number)) as BotModel;
          if (user !== undefined) {
            // call bot
            const sanwo_bot = new Bot(user, msg_body, "whatsapp");
            message = await sanwo_bot.run();
          }
          await axios({
            method: "POST",
            url:
              "https://graph.facebook.com/v15.0/" +
              phone_number_id +
              "/messages?access_token=" +
              token,
            data: {
              messaging_product: "whatsapp",
              to: whatsapp_number,
              text: { body: message },
              preview_url: true,
            },
            headers: { "Content-Type": "application/json" },
          });
          // res.send(message)
        }
        console.log("bot responded")
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
       */
    } catch (error: any) {
      console.log(
        "webhook caught an error ",
        error.data || error.message || error
      );
      res.send(error);
    }
  }

