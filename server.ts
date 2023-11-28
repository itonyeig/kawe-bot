import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { whatsappGET, whatsappPOST } from "./request.handler";
import protectServer from "./utils/config";
import { getBot } from "./utils/helper";
import morgan from 'morgan';


initializeApp();


async function initializeApp(){
  const mongoUrl = `${process.env.MONGO_URL}`;
  
  try {
    console.log(":::connecting to database:::");
    await mongoose.connect(mongoUrl);
    console.log(":::connected to database:::");

    const app: Application = express();
    const port = process.env.PORT || 4000;

    // Middleware
    protectServer(app)
    
    app.use(express.json());

    // Log incoming requests
    app.use(morgan('dev')); 

    // GET route for home
    app.get("/", (req: Request, res: Response) => {
      res.json({ message: "Kawe bot server is up",  });
    });
    
    // app.get("/test-route", async (req: Request, res: Response) => {
    //   try {
    //     const response = await getBot('2349079325911');
    //     res.send({
    //       message: 'user saved sucessfully',
    //       user: response
    //     })
    //   } catch (error: any) {
    //     console.log("an error occured", error)
    //     res.send(error.message)
    //   }
    // });

    // WhatsApp Callback URL for server verification
    app.get("/webhook/whatsapp", whatsappGET);

    app.post("/webhook/whatsapp", whatsappPOST);

    app.listen(port, () => console.log(`Kawe bot is running on port ${port}`));
  } catch (err) {
    console.error("mongo error in connection:", err);
  }
};