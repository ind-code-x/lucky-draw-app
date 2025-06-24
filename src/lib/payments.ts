// PayU Payment Integration
export interface PayUConfig {
  merchantKey: string;
  salt: string;
  baseUrl: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  giveawayLimit: number;
  socialPlatforms: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    duration: 30,
    features: ['1 Active Giveaway', 'Basic Analytics', 'Manual Winner Selection'],
    giveawayLimit: 1,
    socialPlatforms: ['instagram', 'facebook'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999, // ₹999
    duration: 30,
    features: ['5 Active Giveaways', 'Advanced Analytics', 'Auto Social Posting', 'Winner Verification'],
    giveawayLimit: 5,
    socialPlatforms: ['instagram', 'facebook', 'twitter', 'whatsapp'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2499, // ₹2499
    duration: 30,
    features: ['Unlimited Giveaways', 'Full Analytics Suite', 'All Social Platforms', 'Priority Support', 'Custom Branding'],
    giveawayLimit: -1, // unlimited
    socialPlatforms: ['instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'whatsapp'],
  },
];

export class PayUManager {
  private config: PayUConfig;

  constructor(config: PayUConfig) {
    this.config = config;
  }

  generatePaymentHash(
    txnid: string,
    amount: string,
    productinfo: string,
    firstname: string,
    email: string
  ): string {
    // Note: In production, hash generation should be done on server-side for security
    const hashString = `${this.config.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${this.config.salt}`;
    
    // This is a simplified hash generation - use proper SHA512 in production
    return btoa(hashString);
  }

  initiatePayment(params: {
    txnid: string;
    amount: number;
    productinfo: string;
    firstname: string;
    email: string;
    phone: string;
    surl: string; // success URL
    furl: string; // failure URL
  }): void {
    const hash = this.generatePaymentHash(
      params.txnid,
      params.amount.toString(),
      params.productinfo,
      params.firstname,
      params.email
    );

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.config.baseUrl;

    const formData = {
      key: this.config.merchantKey,
      txnid: params.txnid,
      amount: params.amount.toString(),
      productinfo: params.productinfo,
      firstname: params.firstname,
      email: params.email,
      phone: params.phone,
      surl: params.surl,
      furl: params.furl,
      hash: hash,
    };

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}