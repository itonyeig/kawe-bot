import axios from "axios";
import { Book, GetBooksApiResponse, KaweUserProfile, LoginResponseI } from "../interface/kawe.interface";
import { Bot, BotModel } from "../model/bot.model";
import { BotI, INameDob } from "../interface/bot.interface";
import { MachineState } from "../states/machine.state";

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
        name,
        params: {},
        active: false,
        recommendationInfoCompleted: false,
        children: [],
        recommendInfo: [],
        currentState: MachineState.IDLE
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

function formatChildrenList(children: INameDob[]): string {
  const list_of_children = children.map((child, index) => `👉[${index + 1}] ${child.name}`).join('\n');
  const prompt = "Could you please select the number that corresponds to the child you'd like us to recommend a book for? Just type the number associated with their name.";
  return `${prompt}\n\n${list_of_children}\n`;
}

function isValidInput(input: number, length: number) {
    
  return !isNaN(input) && input >= 1 && input <= length;
}

function isValidFormat2(inputString: string) {
  // Regular expression to match the format "name, dob"
  const regex = /^[\w\s]+,\s*\d{2}-\d{2}-\d{4}$/;

  if (!regex.test(inputString)) {
      return false; // Doesn't match the pattern "name, dob"
  }

  // Extract the date part from the string
  const datePart = inputString.split(',')[1].trim();

  // Manually parse the date part (assuming DD-MM-YYYY format)
  const [day, month, year] = datePart.split('-').map(Number);
  const dateObject = new Date(year, month - 1, day); // months are 0-indexed in JavaScript

  // Check if the date is valid
  return dateObject instanceof Date && 
         !isNaN(dateObject.getTime()) &&
         dateObject.getDate() === day &&
         dateObject.getMonth() === (month - 1) &&
         dateObject.getFullYear() === year;
}


function convertStringToDate(dateStr: string): Date {
  const parts = dateStr.split("-");
  // JavaScript's Date constructor expects year, month, and day
  // Note: Months are 0-indexed in JavaScript Date
  const year = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1; // Subtract 1 to make the month 0-indexed
  const day = parseInt(parts[0], 10);

  return new Date(year, month, day);
}
export { getBot, searchBooks, formatBooksList, isValidInput, isValidFormat2, convertStringToDate, formatChildrenList };
