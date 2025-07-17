export interface Recipe {
  id: string;
  title: string;
  cuisine: string | null;
  dietary: string | null;
  ingredients: string;
  instructions: string;
  nutrition: string | null;
  timestamp: string;
}

export interface UserInfo {
  uid: string;
  email: string;
  name: string;
  credits: number;
  subscription_status: string;
  last_credit_reset: string | null;
  api_calls: number;
  stripe_customer_id: string | null;
}

export interface PricingPlan {
  plan: string;
  price: number;
  credits: string | number;
  features: string[];
}
