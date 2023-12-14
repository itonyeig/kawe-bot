import Bot from "../bot";
import { SearchedBooks } from "../interface/bot.interface";
import { OrderI } from "../interface/order.interface";
import { BookModelI } from "../model/book.model";
import { BotModel } from "../model/bot.model";
import { OrderModel } from "../model/order.model";
import { MachineState } from "../states/machine.state";
import OrderState from "../states/order.states";
import { check_if_user_cant_make_order, formatBooksList, isValidInput, searchBooks } from "../utils/helper";
import { addWeeks } from 'date-fns';


export default class OrderEngine {
    bot: Bot;
    botProfile: BotModel

    constructor(bot: Bot) {
        this.bot = bot
        this.botProfile = this.bot.botProfile
    }

    async book_search() {
        // return async () => {
        //   // Implement the logic using the bot instance
        //   // Example: bot.transmitMessage("Search result message");
        // };
        const user_msg = this.bot.userMessage
            if (user_msg.length < 3) {
                await this.bot.transmitMessage('To enhance the search results, please provide a keyword or phrase with at least 3 characters or more.')
                return
            }

        try {
            
            const kawe_books: BookModelI[] = await searchBooks(user_msg, `${process.env.KAWE_TOKEN}`) as any
            if (kawe_books?.length === 0) {
                await this.bot.transmitMessage('No books matched your search. Would you like to try a different keyword or phrase? Please enter your new search term or phrase.')
                return
            }
            const message = formatBooksList(kawe_books)
            
            const searchResults = kawe_books.map((book, index) => ({
                author: book.author_name,
                id: book._id,
                title: book.title,
                num: index + 1
            } as SearchedBooks));
            const stringifiedSearchedBooks = JSON.stringify(searchResults)
            console.log('response from searching for books kawe api call: ', stringifiedSearchedBooks)
            this.bot.botProfile.params.stringifiedSearchedBooks = stringifiedSearchedBooks
            this.bot.botProfile.params.searchMessageToUser = message
            await this.bot.botProfile.save();
            await this.bot.transition(MachineState.AWAITING_BOOK_SELECTION)
            await this.bot.transmitMessage(message)
          
        } catch (error) {
          console.log("err occured in book_search ", error)
        }
    }

    async book_selection(){
        const msg = +this.bot.userMessage;
        const searchBooks: SearchedBooks[] = JSON.parse(this.botProfile.params.stringifiedSearchedBooks as string)
        
        try {
            if (!isValidInput(msg, searchBooks.length)) {
                await this.bot.transmitMessage(`That was not a valid response\n\n${this.botProfile.params.searchMessageToUser}`)
                return
            }
            const selectedBook = searchBooks.find(book => book.num === msg)
            this.botProfile.params.selected_book_id = selectedBook?.id as string
            this.botProfile.params.selected_book = JSON.stringify(selectedBook)
            await this.botProfile.save()
            await this.bot.transition(OrderState.CONFIRM_ORDER)
            await this.bot.transmitMessage(`You selected ${selectedBook?.title} by ${selectedBook?.author}\n\n👉[1] Confirm\n👉[2] Cancel`)
        } catch (error) {
            console.log("err occured in book_selection ", error)
        }
      }

     async place_order(){
        const msg = +this.bot.userMessage;
        const wa_id = this.bot.whatsapp_number
        const book_id = this.botProfile.params.selected_book_id as string
        const selectedBook: SearchedBooks = JSON.parse(this.botProfile.params.selected_book as string )
        if(!isValidInput(msg, 2)){
            await this.bot.transmitMessage(`That was not a valid response, kindly provide a valid response`)
            return 
        }
        try {
            if (msg === 1) {
                if (await check_if_user_cant_make_order(wa_id)) {
                    await this.bot.transmitMessage('Apologies, but it appears that you either have books that are yet to be returned or there are pending payments on your account.')
                    await this.bot.transition(MachineState.IDLE)
                    return;
                }
                const orderData: OrderI = {
                    wa_id,
                    books: book_id,
                    due_date: addWeeks(new Date(), 2)
                }
                const order = new OrderModel(orderData)
                await order.save()
                await this.bot.transition(MachineState.IDLE)
                await this.bot.transmitMessage(`Thank you! Your order has been successfully placed.\nYour Order ID is ${order._id}.\nThe book title is ${selectedBook.title}, written by ${selectedBook.author}.\nThe due date for this order is ${order.due_date}.`)
                
            } else {
                await this.bot.transition(MachineState.IDLE)
                await this.bot.transmitMessage(`Your oder has been cancelled\n\n${this.bot.default_message}`)
            }
           



        } catch (error: any) {
            console.log('err, place_order: ', error.message)
        }
     }

}