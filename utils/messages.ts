import { teir_one_amount, teir_two_amount } from "./helper";
export const messages = {
    default_payment_message: `Please select the account tier you prefer. (Payment subscription covers 6 months):\n\n👉[1] Tier 1 Fixed for 2 children, at N${(teir_one_amount).toLocaleString()}\n👉[2] Tier 2 - N${(teir_two_amount).toLocaleString()} per child, with a minimum of 3 children required\n\nSimply type the number corresponding to your choice`,
    selection: "\n\nSimply type the number corresponding to your choice",
    invalid_response: 'That was not a valid response\n\n',
    make_payment_message: 'Please click the link below to proceed with your payment.\n\n',
    processing_payment: "We are currently processing your payment. Once it is completed, you will have access to all the bot's features. If you have not yet clicked the payment link provided by the bot, please do so to proceed.",
    request_email: 'Could you kindly provide the email address where you would like us to send your receipt?',
    payment_recieved: `Congratulations! Your payment has been processed. Please select what you would like to assist you with?`,
    payment_or_due_book: 'Apologies, but it appears that you either the selected child has a book that is yet to be returned or there are pending payments on your account.',
    new_child: "Please provide us with some basic details about the child for whom you'd like to order a book:\n\nName, Date of Birth (dd-mm-yyyy)\n\nexample: Amamda, 23-01-2012",
    a_child_with_this_name_already_exits: "A child with this name already exists in our system. To make each child's profile unique, you could add a last name, a middle name, or something special that only you know, like a nickname",
    free_trial_over: "Your free trial has been exhausted, you have either already borrowed one book, or its been two weeks since your account was created. You will need to make a payment before you can proceed. Allow me to work you through how to make a payment",
    default_message : "Please choose from the following options:\n\n👉[1] Allow us to suggest a book for you\n👉[2]Search our library for a specific book\n👉[3] Add a child \n👉[4] Make Subscription Payment.",
} as const