import Bot from "../bot";
import { SearchedBooks } from "../interface/bot.interface";
import { BotModel } from "../model/bot.model";
import { MachineState } from "../states/machine.state";
import { formatBooksList, searchBooks } from "../utils/helper";


export default class BookSearchEngine {
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
            
            const kawe_books = await searchBooks(user_msg, this.bot.botProfile.token)
            if (kawe_books?.data?.length === 0) {
                await this.bot.transmitMessage('No books matched your search. Would you like to try a different keyword or phrase? Please enter your new search term or phrase.')
                return
            }
            const message = formatBooksList(kawe_books.data)
            const searchResults = kawe_books.data.map((book, index) => ({
                author: book.author_name,
                id: book.id,
                title: book.title,
                num: index + 1
            } as SearchedBooks));
            const stringifiedSearchedBooks = JSON.stringify(searchResults)
            this.bot.botProfile.stringifiedSearchedBooks = stringifiedSearchedBooks
            this.bot.botProfile.searchMessageToUser = message
            await this.bot.botProfile.save();
            await this.bot.transition(MachineState.AWAITING_BOOK_SELECTION)
            await this.bot.transmitMessage(message)
          
        } catch (error) {
          console.log("err occured in book_search ", error)
        }
    }

    async book_selection(){
        const msg = +this.bot.userMessage;
        const searchBooks: SearchedBooks[] = JSON.parse(this.botProfile.stringifiedSearchedBooks as string)
        
        try {
            if (!this.isValidInput(msg, searchBooks.length)) {
                await this.bot.transmitMessage(`That was not a valid response\n\n${this.botProfile.searchMessageToUser}`)
                return
            }
            const selectedBook = searchBooks.find(book => book.num === msg)
            await this.bot.transmitMessage(`You selected ${selectedBook?.title} by ${selectedBook?.author}`)
        } catch (error) {
            console.log("err occured in book_selection ", error)
        }
      }

       isValidInput(input: number, arrayLength: number) {
    
        return !isNaN(input) && input >= 1 && input <= arrayLength;
    }

}