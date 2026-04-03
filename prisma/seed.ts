import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_MENUS = {
  BANKING: {
    title: "BANKING",
    links: [
      [
        { label: "Everyday Banking", href: "/bank" },
        { label: "Checking Accounts", href: "/bank#cs" },
        { label: "High Yield Savings", href: "/save" },
        { label: "Certificates of Deposit (CDs)", href: "/save#cds" },
        { label: "Business Banking", href: "/bank#business" },
      ],
      [
        { label: "Payments & Services", href: "/payments" },
        { label: "Global Transfers & Wires", href: "/payments#wires" },
        { label: "Trust Kids Club", href: "/save#kids" },
        { label: "Student Banking", href: "/bank#student" },
        { label: "ATMs & Locations", href: "/locations" },
      ]
    ],
    promo: {
      title: "Earn 4.50% APY",
      desc: "Open a Platinum Savings account today and watch your wealth grow.",
      btnText: "Start Saving",
      href: "/save"
    }
  },
  LENDING: {
    title: "LENDING",
    links: [
      [
        { label: "Personal", href: "/borrow" },
        { label: "Credit Cards", href: "/borrow#cc" },
        { label: "Personal Loans", href: "/borrow#pl" },
        { label: "Auto Loans", href: "/borrow#al" },
        { label: "Student Loans", href: "/borrow#sl" },
      ],
      [
        { label: "Home", href: "/borrow" },
        { label: "Mortgages", href: "/borrow#mt" },
        { label: "Home Equity (HELOC)", href: "/borrow#he" },
        { label: "First-Time Homebuyer", href: "/borrow#mt" },
        { label: "Loan Calculator", href: "/borrow" },
      ]
    ],
    promo: {
      title: "0% Intro APR",
      desc: "Pay no interest for 15 months with the Titanium Visa® Card.",
      btnText: "See Offers",
      href: "/borrow"
    }
  },
  WEALTH: {
    title: "WEALTH",
    links: [
      [
        { label: "Invest", href: "/wealth" },
        { label: "Investment Advisory", href: "/wealth#advisor" },
        { label: "Crypto Trading", href: "/crypto" },
        { label: "Retirement (IRAs)", href: "/wealth#retirement" },
      ],
      [
        { label: "Private Client", href: "/wealth#pcg" },
        { label: "Estate & Trust", href: "/wealth#estate" },
        { label: "Wealth Simulator", href: "/wealth" },
        { label: "Market Insights", href: "/learn#news" },
      ]
    ],
    promo: {
      title: "Private Client Group",
      desc: "Concierge banking and tailored strategies for high-net-worth individuals.",
      btnText: "Meet an Advisor",
      href: "/wealth"
    }
  },
  INSURANCE: {
    title: "INSURANCE",
    links: [
      [
        { label: "Personal Coverage", href: "/insure" },
        { label: "Auto Insurance", href: "/insure#auto" },
        { label: "Home & Renters", href: "/insure#home" },
        { label: "Life Insurance", href: "/insure#life" },
      ],
      [
        { label: "Specialty", href: "/insure" },
        { label: "Medicare Support", href: "/insure#medicare" },
        { label: "Business Insurance", href: "/insure#business" },
        { label: "Accidental Protection", href: "/insure#supplemental" },
      ]
    ],
    promo: {
      title: "Protect What Matters",
      desc: "Get a quote in minutes for Home, Auto, or Life coverage.",
      btnText: "Get a Quote",
      href: "/insure"
    }
  },
  RESOURCES: {
    title: "RESOURCES",
    links: [
      [
        { label: "Support", href: "/help" },
        { label: "Help Center (FAQs)", href: "/help" },
        { label: "Contact Us", href: "/contact" },
        { label: "Security Center", href: "/security" },
        { label: "Find a Branch", href: "/locations" },
      ],
      [
        { label: "Company", href: "/about" },
        { label: "About TrustBank", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Investor Relations", href: "/investors" },
        { label: "Press & Media", href: "/press" },
      ]
    ],
    promo: {
      title: "Market Pulse",
      desc: "Stay ahead of the curve with our weekly financial insights and news.",
      btnText: "Read the Latest",
      href: "/learn"
    }
  }
};

const SEED_LEGAL_PRIVACY = `
<h2>1. Information We Collect</h2>
<p>We collect information about you when you open an account or visit our website. This includes personal identifiers (Name, SSN), contact information, and financial history.</p>

<h2>2. How We Use Your Information</h2>
<p>We use your information to process transactions, prevent fraud, comply with regulatory requirements (KYC/AML), and improve our banking services.</p>

<h2>3. Information Sharing</h2>
<p>We do not sell your personal data. We only share information with third-party service providers who assist in our operations (e.g., card processors, secure data storage) under strict confidentiality agreements.</p>

<h2>4. Data Security</h2>
<p>We employ military-grade encryption (AES-256) and multi-factor authentication to protect your data. Our security team monitors systems 24/7 for suspicious activity.</p>
`;

const SEED_LEGAL_TERMS = `
<h2>1. Acceptance of Terms</h2>
<p>By accessing or using TrustBank services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

<h2>2. User Responsibilities</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>

<h2>3. Electronic Communications</h2>
<p>You consent to receive communications from us electronically. We will communicate with you by email or by posting notices on this site.</p>

<h2>4. Limitation of Liability</h2>
<p>TrustBank shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits.</p>
`;

const SEED_LEGAL_ACCESS = `
<h2>Our Commitment</h2>
<p>TrustBank is committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability. We are actively working to increase the accessibility and usability of our website and in doing so adhere to many of the available standards and guidelines.</p>

<h2>Standards</h2>
<p>This website endeavors to conform to level Double-A of the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines 2.1. These guidelines explain how to make web content more accessible for people with disabilities.</p>

<h2>Accessibility Features</h2>
<ul>
  <li>Keyboard navigation support</li>
  <li>Screen reader compatibility</li>
  <li>High color contrast ratios</li>
  <li>Scalable text sizing</li>
</ul>

<h2>Contact Us</h2>
<p>If you experience any difficulty in accessing any part of this website, please email us at <a href="mailto:accessibility@trustbank.com">accessibility@trustbank.com</a>.</p>
`;


async function main() {
  console.log('Starting seed...');

  // --- 1. SITE SETTINGS ---
  console.log('Seeding Site Settings...');

  // A. Top-Level Settings
  const baseSettingsData = {
    site_name: "TrustBank",
    site_logo: "/logo.png",
    announcement_active: "true",
    announcement_text: "TrustBank was recently named 'Best Digital Bank 2026' by Global Finance Magazine.",
    announcement_contact_phone: "1-800-TRUST-VIP",
    nav_structure_json: JSON.stringify(SEED_MENUS),

    // Top Level Nav Texts
    nav_bank_title: "Banking",
    nav_bank_desc: "Everyday banking and savings.",
    nav_borrow_title: "Lending",
    nav_borrow_desc: "Loans and credit lines.",
    nav_wealth_title: "Wealth",
    nav_wealth_desc: "Investment and crypto.",
    nav_insure_title: "Insurance",
    nav_insure_desc: "Protect your assets.",
    nav_learn_title: "Learn",
    nav_learn_desc: "Financial education.",
  };

  // B. Content Settings (General Pages: Home, Learn, About, Support, Press, Invest)
  const contentSettingsData = {
    // HERO TEXTS
    hero_title: "Wealth Management",
    hero_subtitle: "for the Digital Age.",
    hero_cta_text: "Open an Account",

    // HOME SECTIONS
    home_card_title: "The Onyx Card",
    home_card_highlight: "Pure Titanium.",
    home_card_desc: "Experience the weight of true purchasing power. No foreign fees, infinite possibilities.",
    home_invest_title: "Institutional Grade",
    home_invest_highlight: "Investing.",
    home_invest_desc: "Access private credit, automated portfolios, and crypto assets on one unified platform.",

    // GENERAL PAGE IMAGES
    home_hero_img: "/hero-human.png",
    home_card_img: "/card-front.png",
    home_invest_img: "/app-invest.png",
    home_loan_card1_img: "/loan-home.png",
    home_loan_card2_img: "/loan-car.png",
    home_global_img: "/world-map-dark.png",
    home_cta_img: "/cta-visual.png",
    learn_hero_img: "/learn-hero.png",
    about_hero_img: "/about-hero.png",
    press_hero_img: "/press-hero.png",
    invest_hero_img: "/investors-hero.png",
    support_hero_img: "/support-hero.png",
    rates_hero_img: "/rates-hero.png",
    security_hero_img: "/security-bg.png",
    careers_hero_img: "/careers-hero.png",

    // LEGAL TEXTS
    legal_privacy_policy: SEED_LEGAL_PRIVACY,
    legal_terms_service: SEED_LEGAL_TERMS,
    legal_accessibility_statement: SEED_LEGAL_ACCESS,
  };

  // C. Features Settings (Product Pages: Bank, Save, Borrow, Wealth, Insure, Crypto)
  const featuresData = {
    //  PRODUCT HERO IMAGES
    bank_hero_img: "/bank-hero.png",
    save_hero_img: "/save-hero.png",
    borrow_hero_img: "/borrow-hero.png",
    wealth_hero_img: "/wealth-hero.png",
    insure_hero_img: "/insure-hero.png",
    payments_hero_img: "/payments-hero.png",
    crypto_hero_img: "/crypto-phone.png",

    // FEATURE TITLES
    bank_hero_title_1: "Banking at the",
    bank_hero_highlight: "speed of life.",
    bank_hero_desc: "Get paid up to 2 days early, enjoy fee-free overdrafts.",
    save_hero_title: "Grow your savings.",
    save_hero_highlight: "Secure your future.",
    borrow_hero_title: "Finance your dreams.",
    wealth_hero_title: "Legacy management",
    insure_hero_title: "Protect what",
    payments_hero_title: "Payments & Transfers",
    crypto_hero_title: "The future of",
  };

  // --- UPSERT LOGIC ---
  const existingSettings = await prisma.siteSettings.findFirst();

  if (existingSettings) {
    await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: {
        ...baseSettingsData,
        content: {
          upsert: {
            create: contentSettingsData,
            update: contentSettingsData
          }
        },
        features: {
          upsert: {
            create: featuresData,
            update: featuresData
          }
        }
      }
    });
    console.log('Site Settings updated');
  } else {
    await prisma.siteSettings.create({
      data: {
        ...baseSettingsData,
        content: {
          create: contentSettingsData
        },
        features: {
          create: featuresData
        }
      }
    });
    console.log('Site Settings created');
  }

  // --- 2. FAQs ---
  const faqs = [
    // --- SECURITY ---
    {
      id: "faq_sec_01",
      category: "Security",
      question: "How do I reset my online banking password?",
      answer: "You can reset your password instantly by clicking the 'Forgot Password' link on the login page. We will send a secure recovery link to your registered email address.",
      order: 1
    },
    {
      id: "faq_sec_02",
      category: "Security",
      question: "Is my data secure?",
      answer: "Yes. We utilize military-grade 256-bit AES encryption for data at rest and TLS 1.3 for all data in transit. Our systems are regularly audited for compliance.",
      order: 2
    },
    {
      id: "faq_sec_03",
      category: "Security",
      question: "Why is my account status showing 'Frozen'?",
      answer: "This is a security measure triggered by unusual activity or multiple failed login attempts. While frozen, you cannot make withdrawals. Please open a Support Ticket immediately to verify your identity.",
      order: 3
    },

    // --- TRANSFERS ---
    {
      id: "faq_trf_01",
      category: "Transfers",
      question: "What are the fees for wire and local transfers?",
      answer: "Local transfers between TrustBank accounts are free. International Wire Transfers are subject to a standard processing fee (typically $25.00) plus any applicable exchange rate margins, which are displayed before you confirm the transfer.",
      order: 4
    },
    {
      id: "faq_trf_02",
      category: "Transfers",
      question: "Why is my transfer status 'Pending' or requesting codes?",
      answer: "International transfers require regulatory clearance (AML/KYC). You may be asked to provide specific clearance codes to release funds to the beneficiary bank.",
      order: 5
    },
    {
      id: "faq_trf_03",
      category: "Transfers",
      question: "How long do crypto deposits take to reflect?",
      answer: "Crypto deposits are credited automatically after the required number of blockchain network confirmations (typically 3 for Bitcoin/Ethereum). This usually takes 10-30 minutes.",
      order: 6
    },

    // --- ACCOUNT & CARDS ---
    {
      id: "faq_acc_01",
      category: "Account & Cards",
      question: "What is my daily transaction limit?",
      answer: "Standard accounts have a daily withdrawal limit of $10,000. To request a higher limit for large transactions, please contact your Account Manager via the Support Help Desk.",
      order: 7
    },
    {
      id: "faq_acc_02",
      category: "Account & Cards",
      question: "How do I report a lost or stolen card?",
      answer: "Log in to your Dashboard and navigate to the 'Cards' section to instantly freeze your card. You can then request a replacement or contact support for assistance.",
      order: 8
    },
    {
      id: "faq_acc_03",
      category: "Account & Cards",
      question: "Can I use my card while traveling abroad?",
      answer: "Yes, your TrustBank card works globally. To prevent fraud alerts from triggering while you are away, we recommend sending a message to Support with your travel dates.",
      order: 9
    }
  ];

  console.log('Seeding FAQs...');
  for (const faqItem of faqs) {
    await prisma.faqItem.upsert({
      where: { id: faqItem.id },
      update: faqItem,
      create: faqItem,
    });
  }
  console.log('FAQs seeded');

  // --- 3. JOBS ---
  const listings = [
    {
      id: "job_fin_analyst",
      title: "Senior Financial Analyst",
      department: "Finance",
      location: "New York, NY",
      type: "Full-time",
      description: "Lead financial forecasting and wealth management strategies for high-net-worth clients.",
      isActive: true
    },
    {
      id: "job_comp_off",
      title: "Compliance Officer",
      department: "Legal",
      location: "London, UK",
      type: "Full-time",
      description: "Oversee regulatory adherence for cross-border payments and international trade finance.",
      isActive: true
    },
    {
      id: "job_cust_success",
      title: "Customer Success Specialist",
      department: "Support",
      location: "Phoenix, AZ",
      type: "Part-time",
      description: "Provide world-class support to our retail banking customers via chat and phone.",
      isActive: true
    },
    {
      id: "job_frontend",
      title: "Senior Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build the next generation of our mobile and web banking dashboards",
      isActive: true
    },
    {
      id: "job_banker",
      title: "Relationship Banker",
      department: "Retail Banking",
      location: "New York, NY",
      type: "Full-time",
      description: "Manage client relationships and assist with account opening, loans, and investment products.",
      isActive: true
    },
    {
      id: "job_infosec",
      title: "Information Security Analyst",
      department: "Security",
      location: "Remote",
      type: "Full-time",
      description: "Monitor and defend our banking infrastructure against cyber threats and fraud attempts.",
      isActive: true
    }
  ];

  console.log('Seeding Jobs...');
  for (const jobListing of listings) {
    await prisma.jobListing.upsert({
      where: { id: jobListing.id },
      update: jobListing,
      create: jobListing,
    });
  }
  console.log('Jobs seeded');

  // --- 4. BRANCHES ---
  const branches = [
    {
      id: "br_nyc_main",
      name: "Global Headquarters",
      address: "100 Wall Street, Fl 24",
      city: "New York, NY",
      phone: "+1 (212) 555-0199",
      email: "nyc.main@trustbank.com",
      hours: "Mon - Fri: 8:00 AM - 6:00 PM",
      isActive: true
    },
    {
      id: "br_ldn_ops",
      name: "London Operations",
      address: "45 Canary Wharf",
      city: "London, UK",
      phone: "+44 20 7946 0958",
      email: "london@trustbank.com",
      hours: "Mon - Fri: 9:00 AM - 5:00 PM",
      isActive: true
    },
    {
      id: "br_sf_tech",
      name: "Tech Hub & Innovation",
      address: "500 Howard St",
      city: "San Francisco, CA",
      phone: "+1 (415) 555-0123",
      email: "sf.tech@trustbank.com",
      hours: "Mon - Fri: 10:00 AM - 4:00 PM",
      isActive: true
    },
    {
      id: "br_phx_wealth",
      name: "Private Wealth Center",
      address: "212 Camelback Rd",
      city: "Phoenix, AZ",
      phone: "+1 (602) 555-6789",
      email: "wealth.az@trustbank.com",
      hours: "By Appointment Only",
      isActive: true
    }
  ];

  console.log('Seeding Branches...');
  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: branch,
      create: branch,
    });
  }
  console.log('Branches seeded');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });