import axios from "axios";
import { Book, GetBooksApiResponse, KaweUserProfile, LoginResponseI } from "../interface/kawe.interface";
import { Bot, BotModel } from "../model/bot.model";
import { BotI, INameDob } from "../interface/bot.interface";
import { MachineState } from "../states/machine.state";
import { OrderI } from "../interface/order.interface";
import { differenceInYears, subWeeks } from "date-fns";
import { QuestionsAnswers } from "../services/open-ai.service";
import { bookRecommendationQuestions } from './recommendation-questions';
import { BookModel } from "../model/book.model";
import { OrderModel } from "../model/order.model";

const baseURL = process.env.KAWE_BASE_URL;



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



async function searchBooks(searchString: string, token?: string): Promise<Book[]>{
  try {
    
    const regex = new RegExp(searchString, 'i'); // 'i' for case-insensitive

    const books = await BookModel.find({
      $or: [
        { author_name: { $regex: regex } },
        { title: { $regex: regex } }
      ]
    });

    return books;

  } catch (error: any) {
    console.log('an error occured while searching for a book')
    throw error.response?.data || error;
  }
}

async function getAllBooks(): Promise<Book[]>{
  try {
    const books = await BookModel.find({})

    return books;
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

async function generateGPTPContext( bot: BotModel, orders?: OrderI[]): Promise<{ childAge: number; questionsAnswers: QuestionsAnswers[]; orderHistory: string[]; bookList: string[]; canGenerate?: boolean | undefined; }> {
  let books: Book[]
  const selectedChild: string = bot.params.selectedChild as string;
  try {
    books = await getAllBooks()
    
  } catch (error) {
    throw error
  }
  const child = bot.children.find(c => c.name === selectedChild)
  const child_answers = bot.recommendInfo.filter(qa => qa.childName === child?.name)
  const orderHistory = orders?.map((order: any) => order.books.title as string) || []
  const bookList = books.map(book => `${book.title} by ${book.author_name}`)

  const questionsAnswers = child_answers.map(qa => ({ 
    question: bookRecommendationQuestions[qa.q], 
    answer: qa.answer 
  } as QuestionsAnswers))
 
  return {
    childAge: differenceInYears(new Date(), child?.dob as Date),
    questionsAnswers,
    orderHistory,
    bookList,
    canGenerate: !child_answers || !child ? false : true
  }
}

async function check_if_user_cant_make_order(wa_id: string): Promise<boolean> {
  // Check for unreturned orders
  const unreturnedOrderCount = await OrderModel.countDocuments({
      wa_id,
      returned: false
  });

  if (unreturnedOrderCount > 0) {
      return true;
  }

  // Check if the Bot was created more than two weeks ago
  const twoWeeksAgo = subWeeks(new Date(), 2);
  const bot = await Bot.findOne({ wa_id });

  if (bot && bot.createdAt! <= twoWeeksAgo) {
      return true;
  }

  return false;
}
export { getBot, searchBooks, formatBooksList, isValidInput, isValidFormat2, convertStringToDate, formatChildrenList, generateGPTPContext, check_if_user_cant_make_order };
