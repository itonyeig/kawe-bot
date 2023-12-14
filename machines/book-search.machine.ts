import Bot from "../bot";
import BookSearchEngine from "../engines/book-search.engine";
import BookSearchState from "../states/bookSearchStates";


type BookMachineHandler = {
    nextStates: BookSearchState[]; 
    handle: () => Promise<void>;
  };


  export const book_search_machine = (bot: Bot): Record<BookSearchState, BookMachineHandler> => {
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

