import { Application } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
const protectServer = (app: Application) => { 
    app.use(cors());
    app.use(helmet.frameguard({ action: "deny" }));
    app.use(helmet.xssFilter());
    app.use(helmet.ieNoOpen());
    app.use(helmet.hidePoweredBy());
    
    app.use(compression());
 } 

 export default protectServer