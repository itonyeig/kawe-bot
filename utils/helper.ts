import axios from "axios";
import { Book, GetBooksApiResponse, KaweUserProfile, LoginResponseI } from "../interface/kawe.interface";
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
    console.log(":::caling Kawe login:::")
    const botLogin: LoginResponseI = (await axios.request(config)).data;

    

    return botLogin;
  } catch (error: any) {
    throw error.response?.data || error
  }
}

async function getBot(wa_id: string, name: string): Promise<BotModel | undefined> {
  // const formatNumber = (phone: string): string => {
  //   if (phone.startsWith("234")) {
  //     return "0" + phone.slice(3);
  //   }
  //   return phone;
  // };
  try {
    let user = await Bot.findOne({ wa_id });
    if (!user) {
      // let botLogin: LoginResponseI;
      // try {
      //   botLogin = await login(formatNumber(wa_id));
      // } catch (error) {
      //   return;
      // }

      // if (botLogin.status === "failed") {
      //   return;
      // }

      // const { token } = botLogin;
      // const  { data: kaweProfile } = await getKaweProfile(botLogin.token)
      const userData: BotI = {
        wa_id,
        name: name as string,
        params: {},
        active: false
      };

      user = await Bot.create(userData);
    }
    return user;
  } catch (error: any) {
    throw error.response?.data || error
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
    console.log(":::getting Kawe user profile:::")
    const response: KaweUserProfile = (await axios.request(config)).data;

    return response

  } catch (error: any) {
    throw error.response?.data || error
  }
}

async function searchBooks(query: string, token: string): Promise<GetBooksApiResponse>{
  try {
    const config = {
      method: 'post', // using POST as per your initial example
      url: `${baseURL}/user/books/search`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: JSON.stringify({ query }) // Sending the query in the request body
    };
    console.log(":::searching for book through Kawe api:::")
    const response: GetBooksApiResponse = (await axios.request(config)).data;

    return response;

  } catch (error: any) {
    console.log('an error occured while searching for a book')
    throw error.response?.data || error;
  }
}

function formatBooksList(books: Book[]): string {
  const formattedBooks = books.map((book, index) => `👉[${index + 1}] ${book.title} by ${book.author_name}`).join('\n');
  const prompt = "Please select the number corresponding to the book you are interested in:";
  return `${prompt}\n\n${formattedBooks}\n`;
}
export { getBot, searchBooks, formatBooksList };
