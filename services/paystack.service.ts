import axios from "axios";
import { calculateTotalAmountIncludingFees } from "../utils/helper";


async function initializePayment(amount: number, transactionRef: string, email: string,  metadata: {
  tier: number;
} ) {
    try {
      const url = 'https://api.paystack.co/transaction/initialize';
      const response: any = await axios.post(
        url,
        {
          amount: calculateTotalAmountIncludingFees(amount),
          reference: transactionRef,
          currency: "NGN",
          email,
          metadata
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          },
        }
      );

      return response.data.data.authorization_url;

    ////////////////////////////

    //   const pageUrl = "https://api.paystack.co/page";
    //   const page: any = await axios.post(
    //     pageUrl,
    //     {
    //       name: `${title}`,
    //       amount: `${amount * 100}}`,
    //       description: `{description}`,
    //       currency: "NGN",
    //       reference: transactionRef,
    //     },
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
    //       },
    //     }
    //   );
    //   return `https://paystack.com/pay/${page.data.data.slug}`;
    
    } catch (error: any) {
    
      throw error.response.data;
    }
  };



export { initializePayment }