import Bot from "../bot";
import { SearchedBooks } from "../interface/bot.interface";
import { OrderI } from "../interface/order.interface";
import { BookModelI } from "../model/book.model";
import { BotModel } from "../model/bot.model";
import { OrderModel } from "../model/order.model";
import { MachineState } from "../states/machine.state";
import OrderState from "../states/order.states";
import { book_due_in_weeks, formatBooksList, formatChildrenList, isValidInput, searchBooks } from "../utils/helper";
import { addWeeks } from 'date-fns';
import { messages } from "../utils/messages";
import New_User_States from "../states/new-user.states";


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
            
            const kawe_books: BookModelI[] = await searchBooks(user_msg) as any
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
            // console.log('response from searching for books kawe api call: ', stringifiedSearchedBooks)
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
        const selectedChild = this.botProfile.params.selectedChild
        
        try {
            if (!isValidInput(msg, searchBooks.length)) {
                await this.bot.transmitMessage(`That was not a valid response\n\n${this.botProfile.params.searchMessageToUser}`)
                return
            }
            const selectedBook = searchBooks.find(book => book.num === msg)
            this.botProfile.params.selected_book_id = selectedBook?.id as string
            this.botProfile.params.selected_book = JSON.stringify(selectedBook)
            await this.botProfile.save()
            
            if (this.botProfile.children.length === 0) {
                await this.bot.transition(New_User_States.NEW_CHILD);
                await this.bot.transmitMessage(messages.new_child);
            } else {
              
                if (selectedChild) {
                    await this.bot.transition(OrderState.CONFIRM_ORDER)
                    await this.bot.transmitMessage(`You selected ${selectedBook?.title} by ${selectedBook?.author} for ${selectedChild}\n\n👉[1] Confirm\n👉[2] Cancel`)
                } else {
                    const message = formatChildrenList(this.botProfile.children)
                    await this.bot.transition(OrderState.AWAITING_CHILD_SELECTION)
                    await this.bot.transmitMessage(message)
                }
              
            }
        } catch (error: any) {
            console.log("err occured in book_selection ", error.message)
        }
      }

      async child_selection() {
        const children = this.botProfile.children
        const msg = +this.bot.userMessage;
        if (!isValidInput(msg, children.length)) {
            await this.bot.transmitMessage('Invalid response\n\n' + formatChildrenList(children))
            return
        }
        try {
            const child = await this.bot.save_selected_child_name_and_id_to_params()
            const searchBooks: SearchedBooks[] = JSON.parse(this.botProfile.params.stringifiedSearchedBooks as string)
            const selectedBook = searchBooks.find(book => book.num === msg)
            await this.bot.transition(OrderState.CONFIRM_ORDER)
            await this.bot.transmitMessage(`You selected ${selectedBook?.title} by ${selectedBook?.author} for ${child.name}\n\n👉[1] Confirm\n👉[2] Cancel`)
        } catch (error: any) {
            console.log('error in child_selection', error.message)
        }
      }

     async place_order(){
        const msg = +this.bot.userMessage;
        const wa_id = this.bot.whatsapp_number
        const book_id = this.botProfile.params.selected_book_id as string
        const selectedBook: SearchedBooks = JSON.parse(this.botProfile.params.selected_book as string )
        const selectedChildObj = this.botProfile.children.find(child => child.name === this.botProfile.params.selectedChild)
        if(!isValidInput(msg, 2)){
            await this.bot.transmitMessage(`That was not a valid response, kindly provide a valid response`)
            return 
        }
        try {
            if (msg === 1) {
                const checker = await this.bot.check_if_user_can_make_order()
                if (!checker.move_on) {
                    console.log('herenjn', checker)
                    await this.bot.transmitMessage(checker.message || "Could not process")
                    return
                }
                
                const orderData: OrderI = {
                    wa_id,
                    books: book_id,
                    due_date: addWeeks(new Date(), book_due_in_weeks),
                    child: selectedChildObj?._id as string,
                    // ...(this.botProfile?.tier && { tier: this.botProfile?.tier }),
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