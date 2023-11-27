import axios from "axios";
import { KaweUserProfile, LoginResponseI } from "../interface/kawe.interface";
import { Bot, BotModel } from "../model/bot.model";
import { BotI } from "../interface/bot.interface";

const baseURL = process.env.KAWE_BASE_URL;

async function login(phone: string): Promise<LoginResponseI> {
  try {
    let data = JSON.stringify({ phone });

    let config = {
      method: "post",
      url: `${baseURL}/auth/authenticate/with/bot`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const botLogin: LoginResponseI = (await axios.request(config)).data;

    

    return botLogin;
  } catch (error: any) {
    throw error?.data || error;
  }
}

async function getBot(wa_id: string): Promise<BotModel | undefined> {
  const formatNumber = (phone: string): string => {
    if (phone.startsWith("234")) {
      return "0" + phone.slice(3);
    }
    return phone;
  };
  try {
    let user = await Bot.findOne({ wa_id });
    if (!user) {
      let botLogin: LoginResponseI;
      try {
        botLogin = await login(formatNumber(wa_id));
      } catch (error) {
        return;
      }

      if (botLogin && !botLogin.status) {
        return;
      }

      const { token } = botLogin;
      const  { data: kaweProfile } = await getKaweProfile(botLogin.token)
      const userData: BotI = {
        token,
        wa_id,
        fullname: kaweProfile.fullname,
        firstname: kaweProfile.fullname?.split(" ")[0]
        
      };

      user = await Bot.create(userData);
    }
    return user;
  } catch (error: any) {
    throw error?.data || error;
  }
}

async function getKaweProfile(token: string): Promise<KaweUserProfile> {
  try {
    const config = {
      method: 'get',
      url: `${baseURL}/user/profile`,
      headers: {
        'Authorization': `Bearer ${token}`, 
      },
    };

    const response: KaweUserProfile = (await axios.request(config)).data;

    return response

  } catch (error: any) {
    throw error?.data || error;
  }
}

export { getBot };
