-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CLIENT', 'SUPPORT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'FROZEN', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'NOT_SUBMITTED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CHECKING', 'BUSINESS', 'INVESTMENT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DORMANT', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('VISA', 'MASTERCARD', 'AMEX');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'EXPIRED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'REFUND', 'WIRE', 'ADJUSTMENT', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'CRYPTO_BUY', 'CRYPTO_SELL', 'CRYPTO_SEND', 'CRYPTO_RECEIVE', 'BILL_PAYMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED', 'ON_HOLD', 'PENDING_AUTH');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" TEXT,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "otpCode" TEXT,
    "otpExpires" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "transactionPin" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "lastIp" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "kycRejectionReason" TEXT,
    "fullName" TEXT NOT NULL,
    "image" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "phone" TEXT,
    "occupation" TEXT,
    "taxId" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT,
    "nokName" TEXT,
    "nokEmail" TEXT,
    "nokPhone" TEXT,
    "nokRelationship" TEXT,
    "nokAddress" TEXT,
    "passportUrl" TEXT,
    "idCardUrl" TEXT,
    "idCardBackUrl" TEXT,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "failedPinAttempts" INTEGER NOT NULL DEFAULT 0,
    "pinLockedUntil" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "routingNumber" TEXT,
    "type" "AccountType" NOT NULL DEFAULT 'SAVINGS',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "availableBalance" DECIMAL(19,4) NOT NULL DEFAULT 0.00,
    "currentBalance" DECIMAL(19,4) NOT NULL DEFAULT 0.00,
    "heldBalance" DECIMAL(19,4) NOT NULL DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "swiftCode" TEXT,
    "routingNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "balanceAfter" DECIMAL(19,4),
    "type" "TransactionType" NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CardType" NOT NULL DEFAULT 'VISA',
    "cardNumber" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "pin" TEXT,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPhysical" BOOLEAN NOT NULL DEFAULT false,
    "spendingLimit" DECIMAL(19,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WireTransfer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "swiftCode" TEXT,
    "routingNumber" TEXT,
    "country" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "TransactionStatus" NOT NULL DEFAULT 'ON_HOLD',
    "currentStage" TEXT NOT NULL DEFAULT 'TAA',
    "taaCode" TEXT,
    "cotCode" TEXT,
    "imfCode" TEXT,
    "ijyCode" TEXT,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WireTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "balanceRemaining" DECIMAL(19,4),
    "termMonths" INTEGER NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "monthlyPayment" DECIMAL(19,4) NOT NULL,
    "totalRepayment" DECIMAL(19,4) NOT NULL,
    "repaidAmount" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "nextPaymentDate" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DECIMAL(19,8) NOT NULL DEFAULT 0,
    "avgBuyPrice" DECIMAL(19,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "amount" DECIMAL(19,8) NOT NULL,
    "priceAtTime" DECIMAL(19,2) NOT NULL,
    "totalUsd" DECIMAL(19,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'settings',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "auth_login_limit" INTEGER NOT NULL DEFAULT 5,
    "site_name" TEXT NOT NULL DEFAULT 'TrustBank',
    "site_logo" TEXT NOT NULL DEFAULT '/logo.png',
    "contact_email" TEXT NOT NULL DEFAULT 'support@trustbank.com',
    "contact_phone" TEXT NOT NULL DEFAULT '+1 (555) 123-4567',
    "address_main" TEXT NOT NULL DEFAULT '123 Finance Street, New York, NY',
    "announcement_active" TEXT NOT NULL DEFAULT 'true',
    "announcement_text" TEXT NOT NULL DEFAULT 'Get $200 when you open a new checking account.',
    "announcement_contact_phone" TEXT NOT NULL DEFAULT '1-800-TRUST-BK',
    "nav_structure_json" TEXT NOT NULL DEFAULT '',
    "nav_bank_title" TEXT NOT NULL DEFAULT 'Complete Banking',
    "nav_bank_desc" TEXT NOT NULL DEFAULT 'Checking, Savings & Business Solutions',
    "nav_borrow_title" TEXT NOT NULL DEFAULT 'Finance Your Dreams',
    "nav_borrow_desc" TEXT NOT NULL DEFAULT 'Mortgages, Auto Loans & Credit Cards',
    "nav_wealth_title" TEXT NOT NULL DEFAULT 'Grow Your Wealth',
    "nav_wealth_desc" TEXT NOT NULL DEFAULT 'Expert Advisory & Retirement Planning',
    "nav_insure_title" TEXT NOT NULL DEFAULT 'Total Protection',
    "nav_insure_desc" TEXT NOT NULL DEFAULT 'Coverage for Life, Home & Auto',
    "nav_learn_title" TEXT NOT NULL DEFAULT 'Market Pulse',
    "nav_learn_desc" TEXT NOT NULL DEFAULT 'Latest Financial News & Insights',

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentSettings" (
    "id" TEXT NOT NULL DEFAULT 'content-settings',
    "siteSettingsId" TEXT NOT NULL,
    "hero_badge" TEXT NOT NULL DEFAULT 'TRUST BANK PERSONAL',
    "home_hero_img" TEXT NOT NULL DEFAULT '/hero-human.png',
    "home_hero_alt" TEXT NOT NULL DEFAULT 'Happy family checking their finances and banking together on a tablet at home.',
    "hero_title" TEXT NOT NULL DEFAULT 'Banking for the Future',
    "hero_subtitle" TEXT NOT NULL DEFAULT 'Secure, fast, and reliable banking solutions for everyone.',
    "hero_cta_text" TEXT NOT NULL DEFAULT 'Get Started',
    "home_rates_title" TEXT NOT NULL DEFAULT 'Rates that help you grow',
    "home_rates_desc" TEXT NOT NULL DEFAULT 'High-yield savings, low-rate loans, and everything in between.',
    "home_card_img" TEXT NOT NULL DEFAULT '/card-front.png',
    "home_card_alt" TEXT NOT NULL DEFAULT 'TrustBank Onyx Visa Card floating in the air',
    "home_card_series" TEXT NOT NULL DEFAULT 'THE ONYX SERIES',
    "home_card_title" TEXT NOT NULL DEFAULT 'One Card.',
    "home_card_highlight" TEXT NOT NULL DEFAULT 'Infinite Possibilities.',
    "home_card_desc" TEXT NOT NULL DEFAULT 'Experience the power of the TrustBank Onyx Visa®.',
    "home_card_feat_1" TEXT NOT NULL DEFAULT 'No Foreign Fees',
    "home_card_feat_1_desc" TEXT NOT NULL DEFAULT 'Spend globally like a local. 0% fees on international transactions.',
    "home_card_feat_2" TEXT NOT NULL DEFAULT 'Purchase Protection',
    "home_card_feat_2_desc" TEXT NOT NULL DEFAULT 'Your purchases are insured up to $10,000 against damage or theft.',
    "home_card_feat_3" TEXT NOT NULL DEFAULT 'Instant Rewards',
    "home_card_feat_3_desc" TEXT NOT NULL DEFAULT 'Earn 3x points on travel and dining. Redeem instantly in the app.',
    "home_guide_title" TEXT NOT NULL DEFAULT 'Financial Guidance & Support',
    "home_guide_desc" TEXT NOT NULL DEFAULT 'Expert insights and tools to help you achieve your goals.',
    "guide_article_1_title" TEXT NOT NULL DEFAULT 'Secure your next chapter',
    "guide_article_1_img" TEXT NOT NULL DEFAULT '/guide-retirement.png',
    "guide_article_1_alt" TEXT NOT NULL DEFAULT 'Retired couple walking on a beach at sunset',
    "guide_article_2_title" TEXT NOT NULL DEFAULT 'Fraud & Scam Alert',
    "guide_article_3_title" TEXT NOT NULL DEFAULT 'Buying a Home?',
    "guide_article_3_img" TEXT NOT NULL DEFAULT '/guide-home.png',
    "guide_article_3_alt" TEXT NOT NULL DEFAULT 'Hand holding house keys in front of a new home',
    "guide_article_4_title" TEXT NOT NULL DEFAULT 'How Rising Rates Impact Business',
    "guide_article_4_img" TEXT NOT NULL DEFAULT '/guide-business.png',
    "guide_article_4_alt" TEXT NOT NULL DEFAULT 'Business professionals meeting in a glass conference room',
    "home_invest_title" TEXT NOT NULL DEFAULT 'Invest in your',
    "home_invest_highlight" TEXT NOT NULL DEFAULT 'future self.',
    "home_invest_desc" TEXT NOT NULL DEFAULT 'Build your wealth with automated portfolios and real-time crypto trading.',
    "home_invest_img" TEXT NOT NULL DEFAULT '/app-invest.png',
    "home_invest_alt" TEXT NOT NULL DEFAULT 'TrustBank Mobile Investment Dashboard',
    "home_invest_feat1" TEXT NOT NULL DEFAULT 'Smart Portfolios',
    "home_invest_feat1_desc" TEXT NOT NULL DEFAULT 'Automated investing based on your risk tolerance.',
    "home_invest_feat2" TEXT NOT NULL DEFAULT 'Integrated Crypto',
    "home_invest_feat2_desc" TEXT NOT NULL DEFAULT 'Buy, sell, and hold top cryptocurrencies instantly.',
    "home_invest_feat3" TEXT NOT NULL DEFAULT 'Bank-Grade Security',
    "home_invest_feat3_desc" TEXT NOT NULL DEFAULT 'SIPC insurance for securities. Cold storage for crypto.',
    "home_loan_title" TEXT NOT NULL DEFAULT 'Borrowing made simple',
    "home_loan_desc" TEXT NOT NULL DEFAULT 'Whether it''s a new home or a new car, we have the rates to help you grow.',
    "home_loan_card1_title" TEXT NOT NULL DEFAULT 'A home of your own',
    "home_loan_card1_desc" TEXT NOT NULL DEFAULT 'Low down payment options on fixed-rate mortgages. Lock in your rate today.',
    "home_loan_card1_img" TEXT NOT NULL DEFAULT '/loan-home.png',
    "home_loan_card1_alt" TEXT NOT NULL DEFAULT 'Happy couple standing in front of their new house',
    "home_loan_card2_title" TEXT NOT NULL DEFAULT 'On the road faster',
    "home_loan_card2_desc" TEXT NOT NULL DEFAULT 'Finance a new car or refinance your current one.',
    "home_loan_card2_img" TEXT NOT NULL DEFAULT '/loan-car.png',
    "home_loan_card2_alt" TEXT NOT NULL DEFAULT 'Woman driving a new car with window down',
    "home_global_title" TEXT NOT NULL DEFAULT 'Banking Without',
    "home_global_highlight" TEXT NOT NULL DEFAULT 'Borders.',
    "home_global_desc" TEXT NOT NULL DEFAULT 'Access your money from anywhere in the world with zero foreign transaction fees.',
    "home_global_img" TEXT NOT NULL DEFAULT '/world-map-dark.png',
    "home_global_alt" TEXT NOT NULL DEFAULT 'Dark world map showing active global hotspots',
    "global_stat_countries" TEXT NOT NULL DEFAULT '160+',
    "global_stat_digital" TEXT NOT NULL DEFAULT '100%',
    "global_stat_fraud" TEXT NOT NULL DEFAULT '24/7',
    "home_partner_label" TEXT NOT NULL DEFAULT 'Trusted by industry leaders',
    "partner_img_1" TEXT NOT NULL DEFAULT '/partner-1.png',
    "partner_img_2" TEXT NOT NULL DEFAULT '/partner-2.png',
    "partner_img_3" TEXT NOT NULL DEFAULT '/partner-3.png',
    "partner_img_4" TEXT NOT NULL DEFAULT '/partner-4.png',
    "partner_img_5" TEXT NOT NULL DEFAULT '/partner-5.png',
    "partner_img_6" TEXT NOT NULL DEFAULT '/partner-6.png',
    "home_cta_img" TEXT NOT NULL DEFAULT '/cta-visual.png',
    "home_cta_alt" TEXT NOT NULL DEFAULT 'TrustBank Mobile App Dashboard showing savings goals',
    "home_cta_title" TEXT NOT NULL DEFAULT 'Stop just banking. Start building.',
    "home_cta_desc" TEXT NOT NULL DEFAULT 'Join over 2 million members who have upgraded their financial life.',
    "home_cta_benefit_1" TEXT NOT NULL DEFAULT 'No hidden fees',
    "home_cta_benefit_2" TEXT NOT NULL DEFAULT 'FDIC Insured up to $250k',
    "home_cta_benefit_3" TEXT NOT NULL DEFAULT 'Get paid 2 days early',
    "rate_hysa_name" TEXT NOT NULL DEFAULT 'Platinum Savings',
    "rate_hysa_rate" TEXT NOT NULL DEFAULT '4.40',
    "rate_hysa_apy" TEXT NOT NULL DEFAULT '4.50',
    "rate_hysa_min" TEXT NOT NULL DEFAULT '$0.00',
    "rate_mma_name" TEXT NOT NULL DEFAULT 'Money Market',
    "rate_mma_rate" TEXT NOT NULL DEFAULT '4.15',
    "rate_mma_apy" TEXT NOT NULL DEFAULT '4.25',
    "rate_mma_min" TEXT NOT NULL DEFAULT '$2,500.00',
    "rate_cd_name" TEXT NOT NULL DEFAULT '12-Month CD',
    "rate_cd_rate" TEXT NOT NULL DEFAULT '5.05',
    "rate_cd_apy" TEXT NOT NULL DEFAULT '5.15',
    "rate_cd_min" TEXT NOT NULL DEFAULT '$500.00',
    "rate_kids_name" TEXT NOT NULL DEFAULT 'Kids Club Savings',
    "rate_kids_rate" TEXT NOT NULL DEFAULT '2.95',
    "rate_kids_apy" TEXT NOT NULL DEFAULT '3.00',
    "rate_kids_min" TEXT NOT NULL DEFAULT '$0.00',
    "rate_auto_name" TEXT NOT NULL DEFAULT 'Auto Loan (New)',
    "rate_auto_term" TEXT NOT NULL DEFAULT 'Up to 72 mo',
    "rate_auto_apr" TEXT NOT NULL DEFAULT '5.99',
    "rate_auto_low" TEXT NOT NULL DEFAULT '5.89',
    "rate_personal_name" TEXT NOT NULL DEFAULT 'Personal Loan',
    "rate_personal_term" TEXT NOT NULL DEFAULT '12 - 60 mo',
    "rate_personal_apr" TEXT NOT NULL DEFAULT '8.99',
    "rate_mortgage_name" TEXT NOT NULL DEFAULT 'Mortgage (30yr Fixed)',
    "rate_mortgage_term" TEXT NOT NULL DEFAULT '30 Years',
    "rate_mortgage_30yr" TEXT NOT NULL DEFAULT '6.12',
    "rate_cc_name" TEXT NOT NULL DEFAULT 'Credit Card',
    "rate_cc_term" TEXT NOT NULL DEFAULT 'Variable',
    "rate_cc_intro" TEXT NOT NULL DEFAULT '0% Intro APR',
    "rate_business_apy" TEXT NOT NULL DEFAULT '2.50',
    "rate_ira_apy" TEXT NOT NULL DEFAULT '7.00',
    "rate_credit_intro_apr" TEXT NOT NULL DEFAULT '0%',
    "rate_checking_bonus" TEXT NOT NULL DEFAULT '200',
    "learn_hero_title" TEXT NOT NULL DEFAULT 'Financial wisdom',
    "learn_hero_highlight" TEXT NOT NULL DEFAULT 'for every stage.',
    "learn_hero_desc" TEXT NOT NULL DEFAULT 'Expert guides, market insights, and tools to help you make smarter money moves.',
    "learn_hero_img" TEXT NOT NULL DEFAULT '/learn-hero.png',
    "learn_hero_alt" TEXT NOT NULL DEFAULT 'Person using laptop for financial planning',
    "learn_pulse_title" TEXT NOT NULL DEFAULT 'Market Pulse',
    "learn_pulse_desc" TEXT NOT NULL DEFAULT 'S&P 500 is up 2.4% this week. Tech sector leading the rally.',
    "learn_insights_title" TEXT NOT NULL DEFAULT 'Featured Insights',
    "learn_insights_desc" TEXT NOT NULL DEFAULT 'Stay ahead of the curve with our latest analysis.',
    "learn_art1_tag" TEXT NOT NULL DEFAULT 'INVESTING',
    "learn_art1_title" TEXT NOT NULL DEFAULT 'The Impact of Rising Rates',
    "learn_art1_desc" TEXT NOT NULL DEFAULT 'Understanding how the Federal Reserve''s latest moves affect bonds and stocks.',
    "learn_art1_img" TEXT NOT NULL DEFAULT '/learn-invest.png',
    "learn_art1_alt" TEXT NOT NULL DEFAULT 'Graph showing rising interest rates',
    "learn_art1_link" TEXT NOT NULL DEFAULT 'Read Analysis',
    "learn_art2_tag" TEXT NOT NULL DEFAULT 'TAXES',
    "learn_art2_title" TEXT NOT NULL DEFAULT '5 Tax Moves Before April',
    "learn_art2_desc" TEXT NOT NULL DEFAULT 'Don''t leave money on the table. Your checklist for tax season.',
    "learn_art2_img" TEXT NOT NULL DEFAULT '/learn-tax.png',
    "learn_art2_alt" TEXT NOT NULL DEFAULT 'Calculator and tax forms',
    "learn_art2_link" TEXT NOT NULL DEFAULT 'Get Checklist',
    "learn_art3_tag" TEXT NOT NULL DEFAULT 'BUSINESS',
    "learn_art3_title" TEXT NOT NULL DEFAULT 'Scaling Your Side Hustle',
    "learn_art3_desc" TEXT NOT NULL DEFAULT 'When is the right time to open a business account?',
    "learn_art3_img" TEXT NOT NULL DEFAULT '/learn-business.png',
    "learn_art3_alt" TEXT NOT NULL DEFAULT 'Entrepreneur working at a cafe',
    "learn_art3_link" TEXT NOT NULL DEFAULT 'Learn More',
    "learn_pulse_btn" TEXT NOT NULL DEFAULT 'Analyze My Health',
    "learn_pulse_q1" TEXT NOT NULL DEFAULT 'I save 20% of my income monthly.',
    "learn_pulse_q2" TEXT NOT NULL DEFAULT 'My debt is manageable and decreasing.',
    "learn_pulse_q3" TEXT NOT NULL DEFAULT 'I have clear long-term financial goals.',
    "learn_pulse_res_high" TEXT NOT NULL DEFAULT 'Financial Master',
    "learn_pulse_res_mid" TEXT NOT NULL DEFAULT 'On The Right Track',
    "learn_pulse_res_low" TEXT NOT NULL DEFAULT 'Needs Attention',
    "learn_pulse_res_high_msg" TEXT NOT NULL DEFAULT 'You are crushing it! Focus on advanced wealth strategies.',
    "learn_pulse_res_mid_msg" TEXT NOT NULL DEFAULT 'Solid foundation. Let''s optimize your savings and debt.',
    "learn_pulse_res_low_msg" TEXT NOT NULL DEFAULT 'Don''t panic. We have the tools to help you build stability.',
    "learn_cat1_title" TEXT NOT NULL DEFAULT 'Finance 101',
    "learn_cat1_desc" TEXT NOT NULL DEFAULT 'Budgeting & Credit',
    "learn_cat2_title" TEXT NOT NULL DEFAULT 'Market News',
    "learn_cat2_desc" TEXT NOT NULL DEFAULT 'Daily Updates',
    "learn_cat3_title" TEXT NOT NULL DEFAULT 'Life Hacks',
    "learn_cat3_desc" TEXT NOT NULL DEFAULT 'Saving Tips',
    "learn_cat4_title" TEXT NOT NULL DEFAULT 'Webinars',
    "learn_cat4_desc" TEXT NOT NULL DEFAULT 'Watch On-Demand',
    "about_hero_title" TEXT NOT NULL DEFAULT 'We are TrustBank',
    "about_hero_desc" TEXT NOT NULL DEFAULT 'Building the financial infrastructure for the next generation. Transparent, secure, and built entirely around you.',
    "about_hero_img" TEXT NOT NULL DEFAULT '/about-hero.png',
    "about_hero_alt" TEXT NOT NULL DEFAULT 'Diverse team of bankers in modern office',
    "about_stat_users" TEXT NOT NULL DEFAULT '2M+',
    "about_stat_assets" TEXT NOT NULL DEFAULT '$12B',
    "about_stat_countries" TEXT NOT NULL DEFAULT '40+',
    "about_stat_support" TEXT NOT NULL DEFAULT '24/7',
    "about_mission1_title" TEXT NOT NULL DEFAULT 'Uncompromising Security',
    "about_mission1_desc" TEXT NOT NULL DEFAULT 'We use military-grade encryption and real-time fraud detection to keep your money safe.',
    "about_mission2_title" TEXT NOT NULL DEFAULT 'Border-less Banking',
    "about_mission2_desc" TEXT NOT NULL DEFAULT 'Money shouldn''t have borders. Move funds globally instantly with zero hidden fees.',
    "about_mission3_title" TEXT NOT NULL DEFAULT 'People First',
    "about_mission3_desc" TEXT NOT NULL DEFAULT 'We are a bank built by people, for people. We treat every customer like a partner.',
    "support_hero_title" TEXT NOT NULL DEFAULT 'How can we help?',
    "support_hero_desc" TEXT NOT NULL DEFAULT 'Our dedicated support team is available 24/7 to assist you.',
    "support_hero_img" TEXT NOT NULL DEFAULT '/support-hero.png',
    "support_hero_alt" TEXT NOT NULL DEFAULT '',
    "support_phone_title" TEXT NOT NULL DEFAULT 'Call Us',
    "support_phone" TEXT NOT NULL DEFAULT '1-800-TRUST-BK',
    "support_email_title" TEXT NOT NULL DEFAULT 'Email Support',
    "support_email" TEXT NOT NULL DEFAULT 'support@trustbank.com',
    "support_email_desc" TEXT NOT NULL DEFAULT 'Response within 24hrs',
    "support_address_title" TEXT NOT NULL DEFAULT 'Visit a Branch',
    "support_address_label" TEXT NOT NULL DEFAULT 'Headquarters',
    "support_hours" TEXT NOT NULL DEFAULT 'Mon-Fri: 8am - 8pm EST',
    "support_address" TEXT NOT NULL DEFAULT '123 Financial District, New York, NY 10005',
    "support_faq_title" TEXT NOT NULL DEFAULT 'Got questions?',
    "support_faq_desc" TEXT NOT NULL DEFAULT 'Our Help Center has answers to common banking questions.',
    "support_faq_link" TEXT NOT NULL DEFAULT '/help',
    "support_faq_linkText" TEXT NOT NULL DEFAULT 'Visit Help Center',
    "rates_hero_title" TEXT NOT NULL DEFAULT 'Current',
    "rates_hero_highlight" TEXT NOT NULL DEFAULT 'Market Rates',
    "rates_hero_desc" TEXT NOT NULL DEFAULT 'Transparent pricing for all your banking needs. No hidden fees, just great rates.',
    "rates_hero_img" TEXT NOT NULL DEFAULT '/rates-hero.png',
    "rates_hero_alt" TEXT NOT NULL DEFAULT 'Graph showing positive financial growth',
    "rates_title_deposit" TEXT NOT NULL DEFAULT 'Savings & Certificates',
    "rates_title_borrow" TEXT NOT NULL DEFAULT 'Borrowing Rates',
    "rates_disclaimer_title" TEXT NOT NULL DEFAULT 'Important Rate Information',
    "rates_dep_head_prod" TEXT NOT NULL DEFAULT 'Account Product',
    "rates_dep_head_rate" TEXT NOT NULL DEFAULT 'Interest Rate',
    "rates_dep_head_apy" TEXT NOT NULL DEFAULT 'APY*',
    "rates_dep_head_min" TEXT NOT NULL DEFAULT 'Min. Balance',
    "rates_loan_head_type" TEXT NOT NULL DEFAULT 'Loan Type',
    "rates_loan_head_term" TEXT NOT NULL DEFAULT 'Term',
    "rates_loan_head_apr" TEXT NOT NULL DEFAULT 'APR as low as*',
    "rates_loan_head_detail" TEXT NOT NULL DEFAULT 'Details',
    "rates_tag_popular" TEXT NOT NULL DEFAULT 'Popular',
    "rates_btn_view" TEXT NOT NULL DEFAULT 'View',
    "rates_disclaimer" TEXT NOT NULL DEFAULT '*APY = Annual Percentage Yield. APR = Annual Percentage Rate. Rates are subject to change at any time without notice.',
    "security_hero_title" TEXT NOT NULL DEFAULT 'Security Center',
    "security_hero_desc" TEXT NOT NULL DEFAULT 'Your trust is our most valuable asset. Learn how we protect your data.',
    "security_hero_img" TEXT NOT NULL DEFAULT '/security-bg.png',
    "security_hero_alt" TEXT NOT NULL DEFAULT 'Digital security shield background',
    "security_feat1_title" TEXT NOT NULL DEFAULT '256-bit Encryption',
    "security_feat1_desc" TEXT NOT NULL DEFAULT 'All data is encrypted at rest and in transit using military-grade AES-256 standards.',
    "security_feat2_title" TEXT NOT NULL DEFAULT 'Biometric Access',
    "security_feat2_desc" TEXT NOT NULL DEFAULT 'Secure your account with Face ID, Touch ID, or multi-factor authentication.',
    "security_feat3_title" TEXT NOT NULL DEFAULT 'Real-time Monitoring',
    "security_feat3_desc" TEXT NOT NULL DEFAULT 'Our AI systems monitor transactions 24/7 to detect and block suspicious activity.',
    "security_fraud_title" TEXT NOT NULL DEFAULT 'How to spot fraud',
    "security_fraud_card_title" TEXT NOT NULL DEFAULT 'We will never ask for your password',
    "security_fraud_card_desc" TEXT NOT NULL DEFAULT 'Phishing scammers often pretend to be bank support. We will never ask for your password, PIN, or 2FA code.',
    "help_hero_title" TEXT NOT NULL DEFAULT 'How can we help you?',
    "help_hero_desc" TEXT NOT NULL DEFAULT 'Search for topics, features, or troubleshooting guides.',
    "help_cta_title" TEXT NOT NULL DEFAULT 'Still need help?',
    "help_cta_desc" TEXT NOT NULL DEFAULT 'Our support team is available 24/7 to assist you.',
    "help_action1_title" TEXT NOT NULL DEFAULT 'Reset Password',
    "help_action1_desc" TEXT NOT NULL DEFAULT 'Recover access to your account.',
    "help_action2_title" TEXT NOT NULL DEFAULT 'Lost Card',
    "help_action2_desc" TEXT NOT NULL DEFAULT 'Freeze card and order replacement.',
    "help_action3_title" TEXT NOT NULL DEFAULT 'Report Fraud',
    "help_action3_desc" TEXT NOT NULL DEFAULT 'Secure your account immediately.',
    "help_action4_title" TEXT NOT NULL DEFAULT 'Routing Number',
    "help_action4_desc" TEXT NOT NULL DEFAULT 'Find details for direct deposit.',
    "careers_hero_title" TEXT NOT NULL DEFAULT 'Build the Future of Banking',
    "careers_hero_desc" TEXT NOT NULL DEFAULT 'Join a team that values innovation, integrity, and putting people first.',
    "careers_hero_img" TEXT NOT NULL DEFAULT '/careers-hero.png',
    "careers_hero_img_alt" TEXT NOT NULL DEFAULT 'Happy diverse team working in a modern office',
    "careers_val1_title" TEXT NOT NULL DEFAULT 'Innovation First',
    "careers_val1_desc" TEXT NOT NULL DEFAULT 'We leverage modern tech to solve old problems. No legacy systems holding you back.',
    "careers_val2_title" TEXT NOT NULL DEFAULT 'Inclusive Culture',
    "careers_val2_desc" TEXT NOT NULL DEFAULT 'We believe diverse teams build better products. Bring your authentic self to work.',
    "careers_val3_title" TEXT NOT NULL DEFAULT 'Comprehensive Benefits',
    "careers_val3_desc" TEXT NOT NULL DEFAULT 'From 401k matching to premium health covers, we take care of you and your family.',
    "careers_hero_btn_text" TEXT NOT NULL DEFAULT 'View Open Roles',
    "careers_hero_btn_link" TEXT NOT NULL DEFAULT '#jobs',
    "careers_values_subtitle" TEXT NOT NULL DEFAULT 'More than just a paycheck. A place to grow.',
    "careers_jobs_title" TEXT NOT NULL DEFAULT 'Open Positions',
    "careers_jobs_no_roles" TEXT NOT NULL DEFAULT 'No open positions at the moment. Please check back later.',
    "careers_jobs_email_text" TEXT NOT NULL DEFAULT 'Don''t see the right fit? Email us your resume.',
    "locations_hero_title" TEXT NOT NULL DEFAULT 'Find a Branch Near You',
    "locations_search_placeholder" TEXT NOT NULL DEFAULT 'Search by city or zip...',
    "locations_search_btn_text" TEXT NOT NULL DEFAULT 'Search Locations',
    "locations_results_label" TEXT NOT NULL DEFAULT 'branches found',
    "locations_no_results_text" TEXT NOT NULL DEFAULT 'No branches found matching',
    "locations_clear_btn_text" TEXT NOT NULL DEFAULT 'Clear Search',
    "locations_open_label" TEXT NOT NULL DEFAULT 'Open Now',
    "locations_tag_atm" TEXT NOT NULL DEFAULT '24h ATM',
    "locations_tag_drive_thru" TEXT NOT NULL DEFAULT 'Drive-Thru',
    "locations_tag_notary" TEXT NOT NULL DEFAULT 'Notary Service',
    "locations_directions_btn_text" TEXT NOT NULL DEFAULT 'Get Directions',
    "press_hero_title" TEXT NOT NULL DEFAULT 'Press & Newsroom',
    "press_hero_desc" TEXT NOT NULL DEFAULT 'Latest updates, product launches, and company announcements.',
    "press_hero_img" TEXT NOT NULL DEFAULT '/press-hero.png',
    "press_hero_img_alt" TEXT NOT NULL DEFAULT 'Press conference microphone with blue background',
    "press_kit_title" TEXT NOT NULL DEFAULT 'Media Kit',
    "press_kit_desc" TEXT NOT NULL DEFAULT 'Download official logos, executive headshots, and brand guidelines.',
    "press_kit_link" TEXT NOT NULL DEFAULT '/assets/media-kit.zip',
    "press_contact_email" TEXT NOT NULL DEFAULT 'press@trustbank.com',
    "press_release_title" TEXT NOT NULL DEFAULT 'Latest Announcements',
    "press_empty_state" TEXT NOT NULL DEFAULT 'No press releases found at this time.',
    "press_read_more_text" TEXT NOT NULL DEFAULT 'Read Full Story',
    "press_download_btn_text" TEXT NOT NULL DEFAULT 'Download Assets',
    "press_file_icon" TEXT NOT NULL DEFAULT 'ZIP',
    "press_file_name" TEXT NOT NULL DEFAULT 'TrustBank_Assets.zip',
    "press_file_size" TEXT NOT NULL DEFAULT '12.5 MB',
    "press_about_title" TEXT NOT NULL DEFAULT 'About TrustBank',
    "press_about_desc" TEXT NOT NULL DEFAULT 'TrustBank is a leading digital financial institution providing banking, wealth management, and lending solutions to over 2 million customers globally.',
    "invest_hero_title" TEXT NOT NULL DEFAULT 'Investor Relations',
    "invest_hero_desc" TEXT NOT NULL DEFAULT 'Financial information and corporate governance for shareholders.',
    "invest_hero_img" TEXT NOT NULL DEFAULT '/investors-hero.png',
    "invest_hero_img_alt" TEXT NOT NULL DEFAULT 'Corporate boardroom meeting',
    "invest_stock_price" TEXT NOT NULL DEFAULT '$142.50',
    "invest_stock_change" TEXT NOT NULL DEFAULT '▲ 1.2%',
    "invest_ticker_symbol" TEXT NOT NULL DEFAULT 'NYSE: TRST',
    "invest_market_cap" TEXT NOT NULL DEFAULT 'Market Cap: $12.4B',
    "invest_reports_title" TEXT NOT NULL DEFAULT 'Financial Reports',
    "invest_download_pdf_text" TEXT NOT NULL DEFAULT 'Download PDF',
    "invest_view_link_text" TEXT NOT NULL DEFAULT 'View External',
    "dashboard_alert_show" TEXT NOT NULL DEFAULT 'false',
    "dashboard_alert_type" TEXT NOT NULL DEFAULT 'info',
    "dashboard_alert_msg" TEXT NOT NULL DEFAULT 'Scheduled maintenance: Services will be unavailable Sunday 2 AM - 4 AM EST.',
    "dashboard_promo_title" TEXT NOT NULL DEFAULT 'Make your money work harder',
    "dashboard_promo_desc" TEXT NOT NULL DEFAULT 'Open a High Yield Savings account today.',
    "dashboard_promo_btn" TEXT NOT NULL DEFAULT 'Start Saving',
    "dashboard_promo_link" TEXT NOT NULL DEFAULT '/dashboard',
    "dashboard_support_phone" TEXT NOT NULL DEFAULT '+1 (555) 000-HELP',
    "dashboard_support_email" TEXT NOT NULL DEFAULT 'vip@trustbank.com',
    "legal_privacy_policy" TEXT NOT NULL DEFAULT '<p>Privacy Policy content...</p>',
    "legal_terms_service" TEXT NOT NULL DEFAULT '<p>Terms of Service content...</p>',
    "legal_accessibility_statement" TEXT NOT NULL DEFAULT '<p>Accessibility content...</p>',
    "legal_back_text" TEXT NOT NULL DEFAULT 'Back to Home',
    "legal_footer_text" TEXT NOT NULL DEFAULT 'This document is legally binding. If you have questions, please contact our',
    "legal_link_text" TEXT NOT NULL DEFAULT 'compliance team',
    "legal_link_url" TEXT NOT NULL DEFAULT '/help',
    "legal_updated_label" TEXT NOT NULL DEFAULT 'Last Updated:',
    "footer_mission_title" TEXT NOT NULL DEFAULT 'Building Strength Together',
    "footer_mission_text" TEXT NOT NULL DEFAULT 'TrustBank is a not-for-profit financial institution built on the unshakeable promise to serve those who work every day to build a better future for us all.',
    "social_facebook" TEXT NOT NULL DEFAULT 'https://facebook.com',
    "social_twitter" TEXT NOT NULL DEFAULT 'https://twitter.com',
    "social_linkedin" TEXT NOT NULL DEFAULT 'https://linkedin.com',
    "social_instagram" TEXT NOT NULL DEFAULT 'https://instagram.com',
    "footer_lbl_support" TEXT NOT NULL DEFAULT 'Help Desk',
    "footer_lbl_hours" TEXT NOT NULL DEFAULT 'Office Hours',
    "footer_val_hours" TEXT NOT NULL DEFAULT 'Mon-Fri: 8am - 8pm, Sat-Sun: 9am - 5pm',
    "footer_lbl_email" TEXT NOT NULL DEFAULT 'Email Support',
    "footer_lbl_video" TEXT NOT NULL DEFAULT 'Video Connect',
    "footer_val_video" TEXT NOT NULL DEFAULT 'Chat Virtually (24/7)',
    "footer_col1_title" TEXT NOT NULL DEFAULT 'Member Services',
    "footer_col2_title" TEXT NOT NULL DEFAULT 'Quick Links',
    "footer_badge1" TEXT NOT NULL DEFAULT 'BBB A+',
    "footer_badge2" TEXT NOT NULL DEFAULT 'Equal Housing',
    "footer_badge3" TEXT NOT NULL DEFAULT 'NCUA / FDIC',
    "footer_lbl_headquarters" TEXT NOT NULL DEFAULT 'Headquarters',
    "footer_lbl_locate" TEXT NOT NULL DEFAULT 'Locate a Branch',
    "footer_lbl_copyright" TEXT NOT NULL DEFAULT 'All rights reserved.',

    CONSTRAINT "ContentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFeatures" (
    "id" TEXT NOT NULL,
    "siteSettingsId" TEXT NOT NULL,
    "bank_hero_img" TEXT NOT NULL DEFAULT '/bank-hero.png',
    "bank_hero_alt" TEXT NOT NULL DEFAULT 'Close-up of a hand holding a sleek titanium debit card making a contactless payment at a coffee shop terminal.',
    "bank_hero_title_1" TEXT NOT NULL DEFAULT 'Banking at the',
    "bank_hero_highlight" TEXT NOT NULL DEFAULT 'speed of life.',
    "bank_hero_desc" TEXT NOT NULL DEFAULT 'Get paid up to 2 days early, enjoy fee-free overdrafts.',
    "bank_card_badge" TEXT NOT NULL DEFAULT 'Titanium Design',
    "bank_card_title" TEXT NOT NULL DEFAULT 'The card that turns heads.',
    "bank_card_desc" TEXT NOT NULL DEFAULT 'Milled from a single sheet of aerospace-grade metal.',
    "bank_feat_1_title" TEXT NOT NULL DEFAULT 'Early Payday',
    "bank_feat_1_desc" TEXT NOT NULL DEFAULT 'Direct deposits land up to 2 days faster.',
    "bank_feat_2_title" TEXT NOT NULL DEFAULT 'Instant Alerts',
    "bank_feat_2_desc" TEXT NOT NULL DEFAULT 'Real-time notifications for every transaction.',
    "bank_feat_3_title" TEXT NOT NULL DEFAULT 'Fee-Free Travel',
    "bank_feat_3_desc" TEXT NOT NULL DEFAULT 'Spend globally with zero hidden fees.',
    "bank_compare_title" TEXT NOT NULL DEFAULT 'Stop paying to hold your own money.',
    "bank_compare_desc" TEXT NOT NULL DEFAULT 'We believe banking should be free, simple, and transparent.',
    "bank_fee_monthly" TEXT NOT NULL DEFAULT '$0',
    "bank_fee_overdraft" TEXT NOT NULL DEFAULT '$0',
    "bank_fee_foreign" TEXT NOT NULL DEFAULT '0%',
    "bank_min_balance" TEXT NOT NULL DEFAULT '$0',
    "competitor_fee_monthly" TEXT NOT NULL DEFAULT '$12 - $25',
    "competitor_fee_overdraft" TEXT NOT NULL DEFAULT '$35 per item',
    "competitor_fee_foreign" TEXT NOT NULL DEFAULT '3%',
    "competitor_min_balance" TEXT NOT NULL DEFAULT '$1,500',
    "bank_card_feat_1" TEXT NOT NULL DEFAULT 'Contactless & Chip Enabled',
    "bank_card_feat_2" TEXT NOT NULL DEFAULT 'Instant Lock/Unlock in App',
    "bank_card_feat_3" TEXT NOT NULL DEFAULT 'Zero Foreign Transaction Fees',
    "bank_tbl_row_1_label" TEXT NOT NULL DEFAULT 'Monthly Maintenance Fee',
    "bank_tbl_row_2_label" TEXT NOT NULL DEFAULT 'Overdraft Fees',
    "bank_tbl_row_3_label" TEXT NOT NULL DEFAULT 'Foreign Transaction Fees',
    "bank_tbl_row_4_label" TEXT NOT NULL DEFAULT 'Minimum Balance',
    "bank_tbl_row_5_label" TEXT NOT NULL DEFAULT 'Early Direct Deposit',
    "bank_cs_title" TEXT NOT NULL DEFAULT 'Checking & Savings',
    "bank_cs_desc" TEXT NOT NULL DEFAULT 'Earn 4.50% APY on savings with no monthly fees. Your money, growing faster.',
    "bank_cs_btn" TEXT NOT NULL DEFAULT 'Compare Accounts',
    "bank_cs_img" TEXT NOT NULL DEFAULT '/bank-cs.png',
    "bank_cs_img_alt" TEXT NOT NULL DEFAULT 'Couple managing finances at home',
    "bank_biz_title" TEXT NOT NULL DEFAULT 'Business Banking',
    "bank_biz_desc" TEXT NOT NULL DEFAULT 'Power your enterprise with integrated invoicing, payroll, and expense cards.',
    "bank_biz_btn" TEXT NOT NULL DEFAULT 'See Business Solutions',
    "bank_biz_img" TEXT NOT NULL DEFAULT '/bank-biz.png',
    "bank_biz_img_alt" TEXT NOT NULL DEFAULT 'Business owner using tablet',
    "bank_stu_title" TEXT NOT NULL DEFAULT 'Student Banking',
    "bank_stu_desc" TEXT NOT NULL DEFAULT 'Building credit starts here. Zero fees and early payday for students.',
    "bank_stu_btn" TEXT NOT NULL DEFAULT 'Start for Free',
    "bank_stu_img" TEXT NOT NULL DEFAULT '/bank-stu.png',
    "bank_stu_img_alt" TEXT NOT NULL DEFAULT 'Student on campus',
    "bank_hero_btn_primary" TEXT NOT NULL DEFAULT 'Open Account',
    "bank_hero_btn_secondary" TEXT NOT NULL DEFAULT 'View Features',
    "bank_compare_col_1" TEXT NOT NULL DEFAULT 'Feature',
    "bank_compare_col_2" TEXT NOT NULL DEFAULT 'Traditional Banks',
    "save_hero_title" TEXT NOT NULL DEFAULT 'Grow your savings.',
    "save_hero_highlight" TEXT NOT NULL DEFAULT 'Secure your future.',
    "save_hero_desc" TEXT NOT NULL DEFAULT 'Competitive rates and flexible terms to help you reach your goals faster.',
    "save_hero_img" TEXT NOT NULL DEFAULT '/save-hero.png',
    "save_hero_alt" TEXT NOT NULL DEFAULT 'Grandfather planting tree with granddaughter',
    "save_trust_title" TEXT NOT NULL DEFAULT 'Your money is safe with us.',
    "save_trust_desc" TEXT NOT NULL DEFAULT 'We use military-grade encryption and are fully FDIC insured up to $250,000 per depositor.',
    "save_prod_title" TEXT NOT NULL DEFAULT 'Savings Solutions',
    "save_prod_subtitle" TEXT NOT NULL DEFAULT 'Choose the account that fits your financial timeline.',
    "save_prod1_title" TEXT NOT NULL DEFAULT 'High Yield Savings',
    "save_prod1_desc" TEXT NOT NULL DEFAULT 'Make your money work harder. No monthly fees and daily compounding interest.',
    "save_prod1_link" TEXT NOT NULL DEFAULT 'Start Saving',
    "save_prod2_title" TEXT NOT NULL DEFAULT 'Trust Certificates (CDs)',
    "save_prod2_desc" TEXT NOT NULL DEFAULT 'Lock in a guaranteed rate for a fixed term. Perfect for risk-free growth.',
    "save_prod2_link" TEXT NOT NULL DEFAULT 'View Rates',
    "save_prod3_title" TEXT NOT NULL DEFAULT 'Money Market',
    "save_prod3_desc" TEXT NOT NULL DEFAULT 'Higher rates with check-writing privileges. Flexibility meets growth.',
    "save_prod3_link" TEXT NOT NULL DEFAULT 'Open Account',
    "save_prod4_title" TEXT NOT NULL DEFAULT 'Trust Kids Club',
    "save_prod4_desc" TEXT NOT NULL DEFAULT 'Teach the next generation financial literacy with a dedicated custodial account.',
    "save_prod4_link" TEXT NOT NULL DEFAULT 'Learn More',
    "save_prod5_title" TEXT NOT NULL DEFAULT 'Business Savings',
    "save_prod5_desc" TEXT NOT NULL DEFAULT 'Keep your operating cash growing while maintaining full liquidity for payroll.',
    "save_prod5_link" TEXT NOT NULL DEFAULT 'Business Info',
    "save_prod6_title" TEXT NOT NULL DEFAULT 'Retirement IRA',
    "save_prod6_desc" TEXT NOT NULL DEFAULT 'Tax-advantaged accounts to secure your future. Traditional and Roth options available.',
    "save_prod6_link" TEXT NOT NULL DEFAULT 'Plan Retirement',
    "save_fdic_badge" TEXT NOT NULL DEFAULT 'FDIC Insured',
    "save_calc_title" TEXT NOT NULL DEFAULT 'Watch Your Wealth Grow',
    "save_calc_desc_prefix" TEXT NOT NULL DEFAULT 'See the power of our industry-leading',
    "save_calc_cta" TEXT NOT NULL DEFAULT 'Start Saving Today',
    "save_trust_badge_1" TEXT NOT NULL DEFAULT '256-bit Encryption',
    "save_trust_badge_2" TEXT NOT NULL DEFAULT 'Fraud Monitoring',
    "save_cds_title" TEXT NOT NULL DEFAULT 'Trust Certificates (CDs)',
    "save_cds_desc" TEXT NOT NULL DEFAULT 'Lock in our highest rates. Guaranteed returns with flexible terms ranging from 6 to 60 months.',
    "save_cds_btn" TEXT NOT NULL DEFAULT 'View CD Rates',
    "save_cds_img" TEXT NOT NULL DEFAULT '/save-cds.png',
    "save_cds_img_alt" TEXT NOT NULL DEFAULT 'Hourglass representing time deposits',
    "save_mma_title" TEXT NOT NULL DEFAULT 'Money Market Select',
    "save_mma_desc" TEXT NOT NULL DEFAULT 'The yield of savings with the flexibility of checking. Write checks and transfer funds freely.',
    "save_mma_btn" TEXT NOT NULL DEFAULT 'Open MMA Account',
    "save_mma_img" TEXT NOT NULL DEFAULT '/save-mma.png',
    "save_mma_img_alt" TEXT NOT NULL DEFAULT 'Liquid assets concept',
    "save_kids_title" TEXT NOT NULL DEFAULT 'Trust Kids Club',
    "save_kids_desc" TEXT NOT NULL DEFAULT 'Financial literacy starts here. No fees, parental controls, and fun savings goals.',
    "save_kids_btn" TEXT NOT NULL DEFAULT 'Start Saving for Kids',
    "save_kids_img" TEXT NOT NULL DEFAULT '/save-kids.png',
    "save_kids_img_alt" TEXT NOT NULL DEFAULT 'Piggy bank on desk',
    "borrow_hero_title" TEXT NOT NULL DEFAULT 'Finance your dreams.',
    "borrow_hero_highlight" TEXT NOT NULL DEFAULT 'Fast & Simple.',
    "borrow_hero_desc" TEXT NOT NULL DEFAULT 'From personal loans to mortgages, we provide the capital you need with the service you deserve.',
    "borrow_hero_img" TEXT NOT NULL DEFAULT '/borrow-hero.png',
    "borrow_hero_alt" TEXT NOT NULL DEFAULT 'Couple holding new house keys',
    "borrow_stat_funded" TEXT NOT NULL DEFAULT '$5B+',
    "borrow_stat_speed" TEXT NOT NULL DEFAULT '24h',
    "borrow_stat_approval" TEXT NOT NULL DEFAULT '98%',
    "borrow_trust1_title" TEXT NOT NULL DEFAULT 'Payment Protection',
    "borrow_trust1_desc" TEXT NOT NULL DEFAULT 'We safeguard you and your family with Borrower Security.',
    "borrow_trust2_title" TEXT NOT NULL DEFAULT 'Instant Decisions',
    "borrow_trust2_desc" TEXT NOT NULL DEFAULT 'Apply online and get a decision in under 60 seconds.',
    "borrow_prod1_title" TEXT NOT NULL DEFAULT 'Personal Loans',
    "borrow_prod1_desc" TEXT NOT NULL DEFAULT 'Consolidate debt or fund a major purchase with fixed rates and no hidden fees.',
    "borrow_prod2_title" TEXT NOT NULL DEFAULT 'Mortgages',
    "borrow_prod2_desc" TEXT NOT NULL DEFAULT 'Buy your dream home with our flexible 15 and 30-year fixed rate options.',
    "borrow_prod3_title" TEXT NOT NULL DEFAULT 'Auto Loans',
    "borrow_prod3_desc" TEXT NOT NULL DEFAULT 'New or used, hit the road faster with approvals in as little as 60 seconds.',
    "borrow_prod4_title" TEXT NOT NULL DEFAULT 'Student Loans',
    "borrow_prod4_desc" TEXT NOT NULL DEFAULT 'Invest in your future. Competitive rates for undergraduate and graduate studies.',
    "borrow_prod5_title" TEXT NOT NULL DEFAULT 'Credit Cards',
    "borrow_prod5_desc" TEXT NOT NULL DEFAULT 'Earn 3% cash back on all dining and travel with the Titanium Card.',
    "borrow_prod6_title" TEXT NOT NULL DEFAULT 'Home Equity',
    "borrow_prod6_desc" TEXT NOT NULL DEFAULT 'Unlock the value of your home for renovations or big life events.',
    "rate_personal_apr" TEXT NOT NULL DEFAULT '6.99',
    "rate_auto_apr" TEXT NOT NULL DEFAULT '4.50',
    "rate_mortgage_label" TEXT NOT NULL DEFAULT '3.5% - 6.1%',
    "rate_student_label" TEXT NOT NULL DEFAULT 'Variable & Fixed',
    "rate_home_equity_label" TEXT NOT NULL DEFAULT 'Prime - 0.50%',
    "borrow_calc_title" TEXT NOT NULL DEFAULT 'Estimate Your Payment',
    "borrow_calc_desc" TEXT NOT NULL DEFAULT 'See how affordable your dream project can be.',
    "borrow_calc_label_amt" TEXT NOT NULL DEFAULT 'Loan Amount',
    "borrow_calc_label_term" TEXT NOT NULL DEFAULT 'Term (Months)',
    "borrow_calc_label_rate" TEXT NOT NULL DEFAULT 'Interest Rate (APR)',
    "borrow_calc_res_monthly" TEXT NOT NULL DEFAULT 'Estimated Monthly Payment',
    "borrow_calc_res_total" TEXT NOT NULL DEFAULT 'Total Cost',
    "borrow_calc_cta" TEXT NOT NULL DEFAULT 'Apply for this Loan',
    "borrow_cc_title" TEXT NOT NULL DEFAULT 'Credit Cards',
    "borrow_cc_desc" TEXT NOT NULL DEFAULT 'Earn 3% cash back on all dining and travel. No annual fees on our standard cards.',
    "borrow_cc_btn" TEXT NOT NULL DEFAULT 'Compare Cards',
    "borrow_cc_img" TEXT NOT NULL DEFAULT '/borrow-cc.png',
    "borrow_cc_img_alt" TEXT NOT NULL DEFAULT 'Premium metal credit card',
    "borrow_pl_title" TEXT NOT NULL DEFAULT 'Personal Loans',
    "borrow_pl_desc" TEXT NOT NULL DEFAULT 'Consolidate debt or fund a major purchase with fixed rates and no hidden fees.',
    "borrow_pl_btn" TEXT NOT NULL DEFAULT 'Check Your Rate',
    "borrow_pl_img" TEXT NOT NULL DEFAULT '/borrow-pl.png',
    "borrow_pl_img_alt" TEXT NOT NULL DEFAULT 'Couple renovating home',
    "borrow_mt_title" TEXT NOT NULL DEFAULT 'Mortgage Solutions',
    "borrow_mt_desc" TEXT NOT NULL DEFAULT 'Buy your dream home with our flexible 15 and 30-year fixed rate options.',
    "borrow_mt_btn" TEXT NOT NULL DEFAULT 'View Mortgage Rates',
    "borrow_mt_img" TEXT NOT NULL DEFAULT '/borrow-mt.png',
    "borrow_mt_img_alt" TEXT NOT NULL DEFAULT 'Family in front of new house',
    "borrow_al_title" TEXT NOT NULL DEFAULT 'Auto Loans',
    "borrow_al_desc" TEXT NOT NULL DEFAULT 'New or used, hit the road faster with approvals in as little as 60 seconds.',
    "borrow_al_btn" TEXT NOT NULL DEFAULT 'View Auto Rates',
    "borrow_al_img" TEXT NOT NULL DEFAULT '/borrow-al.png',
    "borrow_al_img_alt" TEXT NOT NULL DEFAULT 'Driving luxury car',
    "borrow_sl_title" TEXT NOT NULL DEFAULT 'Student Loans',
    "borrow_sl_desc" TEXT NOT NULL DEFAULT 'Invest in your future. Competitive rates for undergraduate and graduate studies.',
    "borrow_sl_btn" TEXT NOT NULL DEFAULT 'See Student Options',
    "borrow_sl_img" TEXT NOT NULL DEFAULT '/borrow-sl.png',
    "borrow_sl_img_alt" TEXT NOT NULL DEFAULT 'Student studying in library',
    "borrow_he_title" TEXT NOT NULL DEFAULT 'Home Equity',
    "borrow_he_desc" TEXT NOT NULL DEFAULT 'Unlock the value of your home for renovations or big life events.',
    "borrow_he_btn" TEXT NOT NULL DEFAULT 'Check Eligibility',
    "borrow_he_img" TEXT NOT NULL DEFAULT '/borrow-equity.png',
    "borrow_he_alt" TEXT NOT NULL DEFAULT 'Couple planning a renovation',
    "borrow_grid_title" TEXT NOT NULL DEFAULT 'Lending Solutions',
    "borrow_grid_desc" TEXT NOT NULL DEFAULT 'Choose the product that fits your life stage.',
    "borrow_calc_label_princ" TEXT NOT NULL DEFAULT 'Total Principal',
    "borrow_calc_label_int" TEXT NOT NULL DEFAULT 'Total Interest',
    "borrow_prod_btn_text" TEXT NOT NULL DEFAULT 'Check Rates',
    "wealth_hero_title" TEXT NOT NULL DEFAULT 'Legacy management',
    "wealth_hero_highlight" TEXT NOT NULL DEFAULT 'for generations.',
    "wealth_hero_desc" TEXT NOT NULL DEFAULT 'Comprehensive planning for high-net-worth individuals, families, and business owners.',
    "wealth_hero_img" TEXT NOT NULL DEFAULT '/wealth-hero.png',
    "wealth_hero_alt" TEXT NOT NULL DEFAULT 'Retired couple enjoying sunset on a boat',
    "wealth_service1_title" TEXT NOT NULL DEFAULT 'Investment Advisory',
    "wealth_service1_desc" TEXT NOT NULL DEFAULT 'Active portfolio management tailored to your timeline. Access exclusive equities and private credit.',
    "wealth_service2_title" TEXT NOT NULL DEFAULT 'Estate & Trust',
    "wealth_service2_desc" TEXT NOT NULL DEFAULT 'Ensure your wealth is transferred efficiently. We help structure trusts to minimize tax liability.',
    "wealth_service3_title" TEXT NOT NULL DEFAULT 'Retirement Planning',
    "wealth_service3_desc" TEXT NOT NULL DEFAULT 'Whether accumulating or distributing, we build IRA and pension strategies that outlast volatility.',
    "wealth_advisor_title" TEXT NOT NULL DEFAULT 'The Fiduciary Standard',
    "wealth_advisor_desc" TEXT NOT NULL DEFAULT 'We don''t just manage money; we steward legacies. Our interests are 100% aligned with yours.',
    "wealth_hero_badge" TEXT NOT NULL DEFAULT 'Private Client Group',
    "wealth_grid_title" TEXT NOT NULL DEFAULT 'Wealth Management Solutions',
    "wealth_grid_desc" TEXT NOT NULL DEFAULT 'Tailored strategies for high-net-worth individuals and families.',
    "wealth_service1_btn" TEXT NOT NULL DEFAULT 'Meet an Advisor',
    "wealth_service2_btn" TEXT NOT NULL DEFAULT 'Estate Planning',
    "wealth_service3_btn" TEXT NOT NULL DEFAULT 'Rollover Options',
    "wealth_adv_item1" TEXT NOT NULL DEFAULT 'Dedicated Wealth Manager',
    "wealth_adv_item2" TEXT NOT NULL DEFAULT 'Quarterly Strategy Reviews',
    "wealth_adv_item3" TEXT NOT NULL DEFAULT '24/7 Private Line',
    "wealth_adv_btn" TEXT NOT NULL DEFAULT 'Schedule a Consultation',
    "wealth_sim_title" TEXT NOT NULL DEFAULT 'Portfolio Simulator',
    "wealth_sim_desc" TEXT NOT NULL DEFAULT 'Adjust the slider to see how we structure portfolios based on risk.',
    "wealth_sim_risk_label" TEXT NOT NULL DEFAULT 'Risk Tolerance',
    "wealth_sim_return_label" TEXT NOT NULL DEFAULT 'Est. Annual Return',
    "wealth_sim_note" TEXT NOT NULL DEFAULT 'Past performance does not guarantee future results.',
    "wealth_sim_label_volatility" TEXT NOT NULL DEFAULT 'Volatility',
    "wealth_sim_label_allocation" TEXT NOT NULL DEFAULT 'Allocation',
    "wealth_sim_legend_stocks" TEXT NOT NULL DEFAULT 'Global Stocks',
    "wealth_sim_legend_crypto" TEXT NOT NULL DEFAULT 'Digital Assets',
    "wealth_sim_legend_real" TEXT NOT NULL DEFAULT 'Real Estate',
    "wealth_sim_legend_bonds" TEXT NOT NULL DEFAULT 'Bonds & Cash',
    "wealth_pcg_title" TEXT NOT NULL DEFAULT 'Private Client Group',
    "wealth_pcg_desc" TEXT NOT NULL DEFAULT 'Concierge banking for high-net-worth individuals. Access exclusive lending rates and white-glove service.',
    "wealth_pcg_btn" TEXT NOT NULL DEFAULT 'Join Private Client',
    "wealth_pcg_img" TEXT NOT NULL DEFAULT '/wealth-pcg.png',
    "wealth_pcg_img_alt" TEXT NOT NULL DEFAULT 'Private banker meeting with client',
    "wealth_ret_title" TEXT NOT NULL DEFAULT 'Retirement Planning',
    "wealth_ret_desc" TEXT NOT NULL DEFAULT 'Whether accumulating or distributing, we build IRA and pension strategies that outlast volatility.',
    "wealth_ret_btn" TEXT NOT NULL DEFAULT 'Plan Your Retirement',
    "wealth_ret_img" TEXT NOT NULL DEFAULT '/wealth-ret.png',
    "wealth_ret_img_alt" TEXT NOT NULL DEFAULT 'Retired couple hiking',
    "wealth_est_title" TEXT NOT NULL DEFAULT 'Estate & Trust',
    "wealth_est_desc" TEXT NOT NULL DEFAULT 'Ensure your wealth is transferred efficiently. We help structure trusts to minimize tax liability.',
    "wealth_est_btn" TEXT NOT NULL DEFAULT 'Start Estate Plan',
    "wealth_est_img" TEXT NOT NULL DEFAULT '/wealth-est.png',
    "wealth_est_img_alt" TEXT NOT NULL DEFAULT 'Grandparents with grandchildren',
    "insure_hero_badge" TEXT NOT NULL DEFAULT 'Trust Assurance',
    "insure_hero_title" TEXT NOT NULL DEFAULT 'Protect what',
    "insure_hero_highlight" TEXT NOT NULL DEFAULT 'matters most.',
    "insure_hero_desc" TEXT NOT NULL DEFAULT 'Comprehensive coverage for you, your family, and your assets. Simple, transparent, and reliable.',
    "insure_hero_img" TEXT NOT NULL DEFAULT '/insure-hero.png',
    "insure_hero_alt" TEXT NOT NULL DEFAULT 'Safe family under umbrella in storm',
    "insure_products_title" TEXT NOT NULL DEFAULT 'Coverage for every stage',
    "insure_products_desc" TEXT NOT NULL DEFAULT 'Explore our range of insurance products designed for your lifestyle.',
    "insure_prod1_title" TEXT NOT NULL DEFAULT 'Medicare Insurance',
    "insure_prod1_desc" TEXT NOT NULL DEFAULT 'Navigate your options with confidence. We help you find the right plan.',
    "insure_prod2_title" TEXT NOT NULL DEFAULT 'Auto Insurance',
    "insure_prod2_desc" TEXT NOT NULL DEFAULT 'Comprehensive coverage for the road ahead. Get protected against accidents.',
    "insure_prod3_title" TEXT NOT NULL DEFAULT 'Home & Renters',
    "insure_prod3_desc" TEXT NOT NULL DEFAULT 'Protect your sanctuary. Coverage for structural damage and property.',
    "insure_prod4_title" TEXT NOT NULL DEFAULT 'Life Insurance',
    "insure_prod4_desc" TEXT NOT NULL DEFAULT 'Secure your family''s financial future with Term or Whole life options.',
    "insure_prod5_title" TEXT NOT NULL DEFAULT 'Accident Protection',
    "insure_prod5_desc" TEXT NOT NULL DEFAULT 'Cash benefits paid directly to you for hospital stays or injuries.',
    "insure_prod6_title" TEXT NOT NULL DEFAULT 'Business Insurance',
    "insure_prod6_desc" TEXT NOT NULL DEFAULT 'Safeguard your hard work with liability and workers'' comp solutions.',
    "insure_partners_title" TEXT NOT NULL DEFAULT 'Our Trusted Carriers',
    "insure_partner1_img" TEXT NOT NULL DEFAULT '/logos/allstate-1.png',
    "insure_partner2_img" TEXT NOT NULL DEFAULT '/logos/prudential-1.png',
    "insure_partner3_img" TEXT NOT NULL DEFAULT '/logos/metlife-1.png',
    "insure_partner4_img" TEXT NOT NULL DEFAULT '/logos/liberty-1.png',
    "insure_prod1_img" TEXT NOT NULL DEFAULT '/insure-medicare.png',
    "insure_prod1_img_alt" TEXT NOT NULL DEFAULT 'Senior couple gardening',
    "insure_prod1_btn" TEXT NOT NULL DEFAULT 'Explore Medicare',
    "insure_prod2_img" TEXT NOT NULL DEFAULT '/insure-auto.png',
    "insure_prod2_img_alt" TEXT NOT NULL DEFAULT 'Family packing car',
    "insure_prod2_btn" TEXT NOT NULL DEFAULT 'Get Auto Quote',
    "insure_prod3_img" TEXT NOT NULL DEFAULT '/insure-home.png',
    "insure_prod3_img_alt" TEXT NOT NULL DEFAULT 'Modern living room',
    "insure_prod3_btn" TEXT NOT NULL DEFAULT 'View Home Plans',
    "insure_prod4_img" TEXT NOT NULL DEFAULT '/insure-life.png',
    "insure_prod4_img_alt" TEXT NOT NULL DEFAULT 'Father playing with child',
    "insure_prod4_btn" TEXT NOT NULL DEFAULT 'Calculate Life Needs',
    "insure_wiz_title" TEXT NOT NULL DEFAULT 'Coverage Finder',
    "insure_wiz_desc" TEXT NOT NULL DEFAULT 'Not sure what you need? Answer 2 questions.',
    "insure_wiz_step1" TEXT NOT NULL DEFAULT 'What matters most to you right now?',
    "insure_wiz_step2" TEXT NOT NULL DEFAULT 'What is your current life stage?',
    "insure_wiz_match" TEXT NOT NULL DEFAULT 'Best Match',
    "insure_wiz_btn_view" TEXT NOT NULL DEFAULT 'View Plan',
    "insure_wiz_btn_reset" TEXT NOT NULL DEFAULT 'Start Over',
    "insure_supp_title" TEXT NOT NULL DEFAULT 'Supplemental Coverage',
    "insure_supp_desc" TEXT NOT NULL DEFAULT 'Fill the gaps with specialized protection.',
    "payments_hero_title" TEXT NOT NULL DEFAULT 'Payments & Transfers',
    "payments_hero_highlight" TEXT NOT NULL DEFAULT 'in seconds.',
    "payments_hero_desc" TEXT NOT NULL DEFAULT 'Fast, secure, and fee-free transfers to anyone, anywhere in the world.',
    "payments_hero_img" TEXT NOT NULL DEFAULT '/payments-hero.png',
    "payments_hero_alt" TEXT NOT NULL DEFAULT 'Person paying with mobile phone',
    "payments_widget_title" TEXT NOT NULL DEFAULT 'Send Money',
    "payments_widget_desc" TEXT NOT NULL DEFAULT 'Estimate your transfer',
    "payments_widget_fee_label" TEXT NOT NULL DEFAULT 'Transfer Fee',
    "payments_widget_fee_value" TEXT NOT NULL DEFAULT '$0.00',
    "payments_methods_title" TEXT NOT NULL DEFAULT 'Ways to Pay',
    "payments_methods_desc" TEXT NOT NULL DEFAULT 'From peer-to-peer to bill pay, we have you covered.',
    "payments_method1_title" TEXT NOT NULL DEFAULT 'P2P Transfer',
    "payments_method1_desc" TEXT NOT NULL DEFAULT 'Send cash instantly to friends using just their email or phone number. Works with Zelle®.',
    "payments_method2_title" TEXT NOT NULL DEFAULT 'Bill Pay & AutoPay',
    "payments_method2_desc" TEXT NOT NULL DEFAULT 'Never miss a due date. Schedule recurring payments for utilities, rent, and subscriptions.',
    "payments_method3_title" TEXT NOT NULL DEFAULT 'Loan Center',
    "payments_method3_desc" TEXT NOT NULL DEFAULT 'Manage your Auto, Home, or Personal loans. Make one-time principal payments easily.',
    "payments_est_btn" TEXT NOT NULL DEFAULT 'Initiate Transfer',
    "payments_est_time_label" TEXT NOT NULL DEFAULT 'Arrival',
    "payments_est_time_val" TEXT NOT NULL DEFAULT 'Instantly',
    "payments_est_sec_label" TEXT NOT NULL DEFAULT 'Security',
    "payments_est_sec_val" TEXT NOT NULL DEFAULT 'End-to-End Encrypted',
    "payments_est_input_label" TEXT NOT NULL DEFAULT 'You Send',
    "payments_est_output_label" TEXT NOT NULL DEFAULT 'They Get',
    "payments_bills_title" TEXT NOT NULL DEFAULT 'Bill Pay',
    "payments_bills_desc" TEXT NOT NULL DEFAULT 'Never miss a due date. Schedule recurring payments for utilities, rent, and subscriptions.',
    "payments_bills_btn" TEXT NOT NULL DEFAULT 'Setup Bill Pay',
    "payments_bills_img" TEXT NOT NULL DEFAULT '/payments-bills.png',
    "payments_bills_alt" TEXT NOT NULL DEFAULT 'Woman paying bills on tablet',
    "payments_p2p_title" TEXT NOT NULL DEFAULT 'P2P Transfer',
    "payments_p2p_desc" TEXT NOT NULL DEFAULT 'Send cash instantly to friends using just their email or phone number. Works with Zelle®.',
    "payments_p2p_btn" TEXT NOT NULL DEFAULT 'Send Money Now',
    "payments_p2p_img" TEXT NOT NULL DEFAULT '/payments-p2p.png',
    "payments_p2p_alt" TEXT NOT NULL DEFAULT 'Friends splitting bill at cafe',
    "payments_wires_title" TEXT NOT NULL DEFAULT 'Wire Transfers',
    "payments_wires_desc" TEXT NOT NULL DEFAULT 'Secure domestic and international wires with real-time tracking.',
    "payments_wires_btn" TEXT NOT NULL DEFAULT 'Start Wire',
    "payments_wires_img" TEXT NOT NULL DEFAULT '/payments-wires.png',
    "payments_wires_alt" TEXT NOT NULL DEFAULT 'Business executive approving transfer',
    "payments_supp_title" TEXT NOT NULL DEFAULT 'Manage Your Accounts',
    "payments_supp_desc" TEXT NOT NULL DEFAULT 'Tools to keep your finances organized.',
    "payments_supp1_title" TEXT NOT NULL DEFAULT 'Manage AutoPay',
    "payments_supp1_desc" TEXT NOT NULL DEFAULT 'Set it and forget it.',
    "payments_supp2_title" TEXT NOT NULL DEFAULT 'Loan Payments',
    "payments_supp2_desc" TEXT NOT NULL DEFAULT 'Pay down your principal.',
    "payments_util1_title" TEXT NOT NULL DEFAULT 'Pay by Mail',
    "payments_util1_desc" TEXT NOT NULL DEFAULT 'Get mailing addresses for checks',
    "payments_util2_title" TEXT NOT NULL DEFAULT 'Pay at Branch',
    "payments_util2_desc" TEXT NOT NULL DEFAULT 'Find a location near you',
    "payments_util3_title" TEXT NOT NULL DEFAULT 'Wire Instructions',
    "payments_util3_desc" TEXT NOT NULL DEFAULT 'Domestic & Swift details',
    "crypto_hero_title" TEXT NOT NULL DEFAULT 'The future of',
    "crypto_hero_highlight" TEXT NOT NULL DEFAULT 'money.',
    "crypto_hero_desc" TEXT NOT NULL DEFAULT 'Buy, sell, and hold top cryptocurrencies with bank-grade security and zero hidden fees.',
    "crypto_hero_img" TEXT NOT NULL DEFAULT '/crypto-phone.png',
    "crypto_hero_alt" TEXT NOT NULL DEFAULT 'Crypto trading mobile app interface',
    "crypto_feat1_title" TEXT NOT NULL DEFAULT 'Cold Storage',
    "crypto_feat1_desc" TEXT NOT NULL DEFAULT '98% of assets are held offline in geographically distributed air-gapped vaults.',
    "crypto_feat2_title" TEXT NOT NULL DEFAULT 'Insured Custody',
    "crypto_feat2_desc" TEXT NOT NULL DEFAULT 'We partner with qualified custodians to provide insurance against theft or hacks.',
    "crypto_feat3_title" TEXT NOT NULL DEFAULT 'Global Liquidity',
    "crypto_feat3_desc" TEXT NOT NULL DEFAULT 'Instant execution on large orders through our deep liquidity network.',
    "crypto_hero_btn_primary" TEXT NOT NULL DEFAULT 'Start Trading',
    "crypto_hero_btn_secondary" TEXT NOT NULL DEFAULT 'Learn Crypto',
    "crypto_table_title" TEXT NOT NULL DEFAULT 'Top Assets',
    "crypto_sec_title" TEXT NOT NULL DEFAULT 'Institutional Grade Security',
    "crypto_sec_desc" TEXT NOT NULL DEFAULT 'We take the complexity out of custody...',

    CONSTRAINT "ContentFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "hours" TEXT DEFAULT 'Mon - Fri: 9:00 AM - 5:00 PM',
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 40.7128,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT -74.0060,
    "hasAtm" BOOLEAN NOT NULL DEFAULT true,
    "hasDriveThru" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressRelease" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL DEFAULT 'Company News',
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PDF',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "column" TEXT NOT NULL DEFAULT 'col1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_currency_key" ON "ExchangeRate"("currency");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_referenceId_key" ON "LedgerEntry"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardNumber_key" ON "Card"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoAsset_userId_symbol_key" ON "CryptoAsset"("userId", "symbol");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSettings_siteSettingsId_key" ON "ContentSettings"("siteSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFeatures_siteSettingsId_key" ON "ContentFeatures"("siteSettingsId");

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WireTransfer" ADD CONSTRAINT "WireTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WireTransfer" ADD CONSTRAINT "WireTransfer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoAsset" ADD CONSTRAINT "CryptoAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoTransaction" ADD CONSTRAINT "CryptoTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentSettings" ADD CONSTRAINT "ContentSettings_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentFeatures" ADD CONSTRAINT "ContentFeatures_siteSettingsId_fkey" FOREIGN KEY ("siteSettingsId") REFERENCES "SiteSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
