import { Book } from "../interface/book.interface";
import { Bot, BotModel } from "../model/bot.model";
import { BotI, INameDob } from "../interface/bot.interface";
import { MachineState } from "../states/machine.state";
import { OrderI } from "../interface/order.interface";
import { addWeeks, differenceInYears, subMonths, addMonths } from "date-fns";
import { QuestionsAnswers } from "../services/open-ai.service";
import { bookRecommendationQuestions } from './recommendation-questions';
import { BookModel } from "../model/book.model";
import { randomBytes } from "crypto";
import { PaymentI, Tier } from "../interface/payment-interface";
import { PaymentModel } from "../model/payment.model";
import { initializePayment } from "../services/paystack.service";

export enum Check_User_Payment_Status {
  FREE_TRIAL="You are on a free trial and are only allowed 1 book",
  UNRETURN_BOOKS= "The selected child has two unrerned books. Please return the books to proceed",
  EXPIRED="Your current subscription has expired",
  NULL=""
}

const months = 6;
export const number_of_questions = 5;
export const max_tier_1 = 2; // maximum number of children that can be on a tier 2 account
export const min_tier_2 = 3; // minimin number of children that can be on a tier 2 account
export const teir_one_amount = 4000  * months // for 2 children. 2000 per child
export const teir_two_amount = 1800  * months // per child
export const book_due_in_weeks = 2
export const accountPaidFor = (amount: number): Tier => {
  // Deduct 1.5% from the amount
  const adjustedAmount = amount * (1 - 0.015);
  // Compare the adjusted amount with tier one amount
  return adjustedAmount === teir_one_amount ? Tier.ONE : Tier.TWO;
};

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
        params: {
          recommendInfo: []
        },
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

async function searchBooks(searchString: string): Promise<Book[]>{
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

function calculateTotalAmountIncludingFees(amountReceived: number): number {
  const multipliedAmount = amountReceived * 100;
  const fee = multipliedAmount * 0.015;
  return multipliedAmount + fee;
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
  const child_answers = bot.recommendInfo.filter(qa => qa.child === child?._id)
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

const genrateTransactionRef = () => randomBytes(6).toString("hex");


async function createPayment(wa_id: string, tier: Tier, amount: number, email: string){
  const reference =  genrateTransactionRef();
  const data: PaymentI = {
    wa_id,
    tier,
    // phone_number_id,
    amount,
    reference,
    payment_received: false,
    
    
  }

  await PaymentModel.create(data)
  const paymentLink = await initializePayment(amount, reference, email)
  return paymentLink
}

async function acceptPayment(reference: string) {
  const data = await PaymentModel.findOneAndUpdate({
    reference
  }, 
  {
    payment_received: true,
    valid_till: addMonths(new Date(), months)
  },
  {new: true}
  )

  return data
  
}

function isValidEmail(email: string) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

function calculateOriginalAmountFromTotal(totalAmountWithFees: number): number {
  // Remove the 1.5% fee. We divide by 1.015 because the total amount includes the 1.5% fee
  const amountMinusFee = totalAmountWithFees / 1.015;

  // Convert from kobo to naira by dividing by 100
  const originalAmount = amountMinusFee / 100;

  return originalAmount;
}

function countDigitPatterns(inputString:string) {
  const pattern = /\[\d+\]/g;
  const matches = inputString.match(pattern);
  return matches ? matches.length : 0;
}

function userOnFreeTrial(botProfile: BotModel){
  const twoWeeks = addWeeks(new Date(), 2);
  // console.log(botProfile.createdAt! <= twoWeeks, !botProfile?.active)
  return botProfile.createdAt! <= twoWeeks && !botProfile?.active
}


async function subscription_is_still_valid (botProfile: BotModel) {
  const tier = botProfile.tier;
  if (!tier) {
    return false;
  }
  if (userOnFreeTrial(botProfile)) {
    return true
  }
  const sixMonthsAgo = subMonths(new Date(), months)

  const validPaymentCount = await PaymentModel.countDocuments({
      wa_id: botProfile.wa_id,
      tier,
      payment_received: true,
      valid_till: { $gte: sixMonthsAgo }
  });

  return validPaymentCount > 0;


};
export { 
  getBot, 
  searchBooks, 
  formatBooksList, 
  isValidInput, 
  isValidFormat2, 
  convertStringToDate, 
  formatChildrenList, 
  generateGPTPContext, 
  createPayment,
  acceptPayment,
  calculateTotalAmountIncludingFees,
  isValidEmail,
  subscription_is_still_valid,
  calculateOriginalAmountFromTotal,
  countDigitPatterns,
  userOnFreeTrial,
};
