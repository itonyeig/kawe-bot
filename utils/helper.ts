import axios from "axios";
import { LoginI } from "../interface/kawe.interface";

const baseURL = process.env.KAWE_BASE_URL;

async function login(phone: string): Promise<LoginI> {
  try {
    let data = JSON.stringify({
      phone_number: phone,
    });

    let config = {
      method: "post",
      url: `${baseURL}/auth/authenticate/with/bot`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response: LoginI = (await axios.request(config)).data;

    console.log("response", response);

    return response;
  } catch (error: any) {
    throw error?.data || error;
  }
}

export { login };
