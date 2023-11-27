export interface LoginResponseI {
  status: string;
  message: string;
  token: string;
}

export interface KaweUserProfile {
  status: string;
  message: string;
  data: {
    id: number;
    uuid: string;
    fullname: string;
    firstname: null | string;
    lastname: null | string;
    email: string;
    phone: string;
    address: string;
    email_verified_at: string;
    city: string;
    state: string;
    image_url: null | string;
    is_user_subscribed: boolean;
    created_at: string;
    updated_at: string;
    subscriptionMember: {
      id: number;
      user_id: number;
      subscription_id: number;
      role: string;
      security_deposit: number;
      subscription: {
        id: number;
        subscription_plan_id: number;
        subscription_plan: {
          id: number;
          name: string;
        };
      };
    };
    roles: {
      id: number;
      name: string;
      guard_name: string;
      created_at: string;
      updated_at: string;
      pivot: {
        model_id: number;
        role_id: number;
        model_type: string;
      };
    }[];
  };
}