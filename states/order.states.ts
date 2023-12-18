export enum OrderState {
    AWAITING_BOOK_SEARCH_PROMPT="book-search",
    AWAITING_BOOK_SELECTION="book-selection",
    AWAITING_CHILD_SELECTION="child-selection-for-order",
    CONFIRM_ORDER="confirm-order",

}

export default OrderState;