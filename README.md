# GiveawayHub - Complete Giveaway Platform

A comprehensive platform for creating and managing social media giveaways across multiple platforms including Instagram, Facebook, Twitter, TikTok, YouTube, and WhatsApp.

## Features

- **Multi-Platform Support**: Create giveaways for all major social media platforms
- **Automated Posting**: Automatically post giveaways to connected social media accounts
- **Advanced Analytics**: Track engagement, entries, and performance metrics
- **Fair Winner Selection**: Transparent random winner selection system
- **Subscription Plans**: Flexible pricing with PayU integration
- **Real-time Dashboard**: Manage all giveaways from a centralized dashboard
- **Poster Upload**: Upload custom giveaway posters with drag-and-drop interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Render
- **Payments**: PayU Integration
- **File Upload**: Supabase Storage
- **Social Media**: API integrations for auto-posting

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- PayU merchant account (for payments)

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Social Media API Keys
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_TWITTER_API_SECRET=your_twitter_api_secret

# PayU Configuration
VITE_PAYU_MERCHANT_KEY=your_payu_merchant_key
VITE_PAYU_SALT=your_payu_salt
VITE_PAYU_BASE_URL=https://secure.payu.in/_payment

# App Configuration
VITE_APP_URL=https://your-app-domain.com
```

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the migration file in the Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/20250624030014_square_cloud.sql
   ```
3. Set up storage bucket for giveaway assets
4. Configure authentication settings

### Deployment to Render

1. **Connect Repository**: Connect your GitHub repository to Render
2. **Configure Service**: 
   - Service Type: Web Service
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
3. **Set Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYU_MERCHANT_KEY=your_payu_merchant_key
   VITE_PAYU_SALT=your_payu_salt
   VITE_PAYU_BASE_URL=https://secure.payu.in/_payment
   VITE_APP_URL=https://your-render-app-url.onrender.com
   ```
4. **Deploy**: Render will automatically build and deploy your app

The `render.yaml` file is configured for automatic deployment with proper Node.js environment setup.

## Project Structure

```
src/
├── components/          # React components
│   ├── Analytics.tsx    # Analytics dashboard
│   ├── AuthPage.tsx     # Authentication
│   ├── CreateGiveaway.tsx # Giveaway creation wizard
│   ├── Dashboard.tsx    # Main dashboard
│   ├── LandingPage.tsx  # Landing page
│   ├── Navbar.tsx       # Navigation
│   ├── PosterUpload.tsx # File upload component
│   ├── SocialMediaConnect.tsx # Social media integration
│   └── SubscriptionPlans.tsx # Pricing plans
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── GiveawayContext.tsx # Giveaway management
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client
│   ├── socialMedia.ts   # Social media APIs
│   └── payments.ts      # PayU integration
├── types/               # TypeScript types
└── App.tsx             # Main app component
```

## Features Overview

### Giveaway Creation
- Step-by-step wizard interface
- Multiple entry methods (follow, like, comment, share, etc.)
- Platform-specific customization
- Poster upload with preview
- Social media auto-posting

### Analytics Dashboard
- Real-time metrics
- Platform breakdown
- Growth tracking
- Performance insights
- Entry management

### Subscription Plans
- Free tier with basic features
- Premium plan (₹999/month) with advanced features
- Pro plan (₹2499/month) with unlimited access
- PayU payment integration
- Automatic plan upgrades

### Social Media Integration
- Instagram posting
- Facebook page posting
- Twitter posting
- OAuth authentication
- Secure credential storage

## API Integrations

### Supabase
- User authentication
- Database operations
- File storage
- Real-time subscriptions

### PayU
- Secure payment processing
- Subscription management
- Transaction tracking
- Webhook handling

### Social Media APIs
- Instagram Basic Display API
- Facebook Graph API
- Twitter API v2
- OAuth 2.0 authentication

## Security Features

- Row Level Security (RLS) in Supabase
- Secure API key management
- OAuth authentication for social media
- Encrypted payment processing
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@satikajagath.co.in or create an issue in the repository.