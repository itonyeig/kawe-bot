export interface PaystackWebhook {
    event: string;
    data: Data;
  }
  
  interface Data {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message?: any;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      tier: number;
    };
    fees_breakdown?: any;
    log?: any;
    fees: number;
    fees_split?: any;
    authorization: Authorization;
    customer: Customer;
    plan: any;
    subaccount: any;
    split: any;
    order_id?: any;
    paidAt: string;
    requested_amount: number;
    pos_transaction_data?: any;
    source: Source;
  }
  
  interface Source {
    type: string;
    source: string;
    entry_point: string;
    identifier?: any;
  }
  
  interface Customer {
    id: number;
    first_name?: any;
    last_name?: any;
    email: string;
    customer_code: string;
    phone?: any;
    metadata?: any;
    risk_action: string;
    international_format_phone?: any;
  }
  
  interface Authorization {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string;
    account_name?: any;
    receiver_bank_account_number?: any;
    receiver_bank?: any;
  }
  
  
  export interface PaystackReversal {
    event: string;
    data: {
      amount: number;
      currency: string;
      domain: string;
      failures: any;
      id: number;
      integration: {
        id: number;
        is_live: boolean;
        business_name: string;
      };
      reason: string;
      reference: string;
      source: string;
      source_details: any;
      status: string;
      titan_code: any;
      transfer_code: string;
      transferred_at: any;
      recipient: {
        active: boolean;
        currency: string;
        description: any;
        domain: string;
        email: string;
        id: number;
        integration: number;
        metadata: any;
        name: string;
        recipient_code: string;
        type: string;
        is_deleted: boolean;
        details: {
          authorization_code: any;
          account_number: string;
          account_name: string;
          bank_code: string;
          bank_name: string;
        };
        created_at: string;
        updated_at: string;
      };
      session: {
        provider: string;
        id: string;
      };
      created_at: string;
      updated_at: string;
    };
  }
  
  