import Bot from "../bot";
import BookSearchEngine from "../engines/BookSearchEngine";
import BookSearchState from "../states/bookSearchStates";


type BookMachineHandler = {
    nextStates: BookSearchState[]; 
    handle: () => Promise<void>;
  };


  export const bookStates = (bot: Bot): Record<BookSearchState, BookMachineHandler> => {
    const bookEngine = new BookSearchEngine(bot);
  
    return {
      [BookSearchState.AWAITING_BOOK_SEARCH_PROMPT]: {
        nextStates: [BookSearchState.AWAITING_BOOK_SELECTION],
        handle: async () => {
          await bookEngine.book_search()
        }
      },
    [BookSearchState.AWAITING_BOOK_SELECTION]: {
        nextStates: [],
        handle: async () => {
          await bookEngine.book_selection()
        }
      },

      // ... other book-related states
    };
  };

  export default bookStates
