import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_MENUS = {
  BANK: {
      title: "BANKING",
      links: [
          [
            { label: "Checking & Savings", href: "/bank" },
            { label: "Business Banking", href: "/bank#business" },
            { label: "Student Banking", href: "/bank#student" }
          ],
            [
            { label: "Current Rates", href: "/rates" },
            { label: "ATMs & Locations", href: "/locations" },
            { label: "Global Transfers", href: "/payments" }
          ]
      ],
      promo: {
        title: "Banking Reimagined",
        desc: "Experience a premium checking account with up to 2-day early deposits and fee-free global ATM access.",
        btnText: "Open Checking",
        href: "/register"
      }
  },
  SAVE: {
      title: "SAVINGS",
      links: [
          [
            { label: "High Yield Savings", href: "/save" },
            { label: "Certificates of Deposit (CDs)", href: "/save#cds" },
            { label: "Money Market", href: "/save#mma" }
          ],
            [
            { label: "Trust Kids Club", href: "/save#kids" },
            { label: "Retirement (IRAs)", href: "/wealth" },
            { label: "Savings Calculator", href: "/save" }
          ]
      ],
      promo: {
        title: "Maximize Your Growth",
        desc: "Your money should work as hard as you do. Earn 4.50% APY with our industry-leading High Yield Savings.",
        btnText: "Start Saving",
        href: "/save"
      }
  },
  BORROW: {
      title: "LENDING",
      links: [
          [
            { label: "Credit Cards", href: "/borrow#cc" },
            { label: "Personal Loans", href: "/borrow#pl" },
            { label: "Mortgages", href: "/borrow#mt" }
          ],
            [
              { label: "Auto Loans", href: "/borrow#al" },
            { label: "Student Loans", href: "/borrow#sl" },
            { label: "Loan Calculator", href: "/borrow" }
          ]
      ],
      promo: {
        title: "Unlock Your Potential",
        desc: "From 0% Intro APR cards to flexible mortgages, access the capital you need to move forward.",
        btnText: "View Cards",
        href: "/borrow"
      }
  },
  WEALTH: {
      title: "WEALTH & INVEST",
      links: [
          [
            { label: "Crypto Trading", href: "/crypto" },
            { label: "Investment Advisory", href: "/wealth" },
            { label: "Private Client Group", href: "/wealth" }
          ],
          [
            { label: "Retirement Planning", href: "/wealth" },
            { label: "Estate & Trust Services", href: "/wealth" },
            { label: "Wealth Simulator", href: "/wealth" }
          ]
      ],
      promo: {
        title: "Preserve & Grow",
        desc: "Institutional-grade investment strategies tailored to your personal legacy and timeline.",
        btnText: "Meet an Advisor",
        href: "/wealth"
      }
  },
  INSURE: {
      title: "INSURANCE",
      links: [
          [
            { label: "Medicare Insurance", href: "/insure" },
            { label: "Auto Insurance", href: "/insure" },
            { label: "Homeowners & Renters", href: "/insure" }
          ],
          [
            { label: "Life Insurance", href: "/insure" },
            { label: "Accidental Death", href: "/insure" },
            { label: "Hospital Accident", href: "/insure" }
          ]
      ],
      promo: {
        title: "Comprehensive Protection",
        desc: "Safeguard what matters most. Explore coverage for Life, Auto, and Home with our trusted partners.",
        btnText: "View Options",
        href: "/insure"
      }
  },
  PAYMENTS: {
      title: "PAYMENTS CENTER",
      links: [
          [
            { label: "Pay Bills", href: "/payments" },
            { label: "Send to Friends (P2P)", href: "/payments" },
            { label: "Wire Transfers", href: "/payments" }
          ],
          [
            { label: "Loan Payments", href: "/payments" },
            { label: "Manage AutoPay", href: "/payments" },
            { label: "Global Transfer Estimator", href: "/payments" }
          ]
      ],
      promo: {
        title: "Borderless Payments",
        desc: "Send funds globally in seconds. Real-time exchange rates and zero hidden fees.",
        btnText: "Start Transfer",
        href: "/payments"
      }
  },
  LEARN: {
      title: "LEARNING CENTER",
      links: [
          [
            { label: "Financial Basics 101", href: "/learn" },
            { label: "Investing Guides", href: "/learn" },
            { label: "Retirement Strategies", href: "/learn" }
          ],
          [
            { label: "Market News & Analysis", href: "/learn" },
            { label: "Business Insights", href: "/learn" },
            { label: "Financial Wellness Pulse", href: "/learn" }
          ]
      ],
      promo: {
        title: "Market Intelligence",
        desc: "Stay ahead of the curve with expert analysis and breaking financial news delivered daily.",
        btnText: "Read Latest Issue",
        href: "/learn"
      }
  },
  COMPANY: {
      title: "COMPANY & SUPPORT",
      links: [
          [
            { label: "About Us", href: "/about" },
            { label: "Careers", href: "/careers" },
            { label: "Press & Media", href: "/press" },
            { label: "Investor Relations", href: "/investors" }
          ],
          [
            { label: "Help Center (FAQs)", href: "/help" },
            { label: "Contact Support", href: "/contact" },
            { label: "Legal & Privacy", href: "/terms" },
            { label: "Security Center", href: "/security" }
          ]
      ],
      promo: {
        title: "Building the Future",
        desc: "Join a team of innovators redefining the global financial landscape. See open roles.",
        btnText: "View Open Roles",
        href: "/careers"
      }
  }
};

const SEED_LEGAL_PRIVACY = `
<h2>1. Commitment to Privacy</h2>
<p>At TrustBank, protecting your privacy is fundamental to our mission. We adhere to strict global data protection standards, including GDPR and CCPA, ensuring your financial footprint remains confidential and secure.</p>

<h2>2. Information Collection</h2>
<p>We collect essential information to provide our services, verify your identity, and detect fraud. This includes personal identifiers (such as Name, Tax ID, Address), biometric data for security verification, and transaction metadata. We do not collect data for the purpose of selling it to third-party advertisers.</p>

<h2>3. Data Usage & Security</h2>
<p>Your data is used solely to process transactions, maintain your account, and comply with federal regulations (KYC/AML). We utilize military-grade 256-bit AES encryption for data at rest and TLS 1.3 for data in transit. Our security infrastructure is audited annually by independent cybersecurity firms.</p>

<h2>4. Third-Party Sharing</h2>
<p>TrustBank does not sell your personal information. We only share data with trusted partners necessary to execute your transactions (such as payment processors or card networks) or when required by law enforcement.</p>
`;

const SEED_LEGAL_TERMS = `
<h2>1. Agreement to Terms</h2>
<p>By accessing the TrustBank website, mobile application, or API services, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

<h2>2. Account Responsibilities</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials, including your password and PIN. TrustBank will never ask for your password via email, SMS, or phone. You agree to notify us immediately of any unauthorized use of your account.</p>

<h2>3. Prohibited Activities</h2>
<p>You may not use TrustBank services for any illegal purpose, including but not limited to money laundering, funding terrorism, or evading taxes. We reserve the right to freeze or close accounts suspected of violating these terms without prior notice.</p>

<h2>4. Limitation of Liability</h2>
<p>TrustBank services are provided "as is". While we strive for 99.9% uptime, we are not liable for any damages arising from temporary service interruptions, technical errors, or third-party network failures.</p>
`;

const SEED_LEGAL_ACCESS = `
<h2>Our Commitment</h2>
<p>TrustBank is dedicated to ensuring digital accessibility for people with disabilities. We believe financial freedom should be accessible to everyone, regardless of ability or technology.</p>

<h2>Conformance Status</h2>
<p>We are continuously improving our digital experience to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our platforms are tested regularly with assistive technologies, including screen readers and voice recognition software.</p>

<h2>Feedback & Support</h2>
<p>If you encounter any accessibility barriers on our site, please contact our dedicated support team immediately at accessibility@trustbank.com. We typically respond to accessibility concerns within 24 hours.</p>
`;


async function main() {
  console.log('Starting seed...');

  // --- 1. SITE SETTINGS (SINGLETON) ---
  console.log('Seeding Site Settings...');

  // Prepare the data object
  const settingsData = {
    site_name: "TrustBank",
    site_logo: "/logo.png",

// --- BRANDING & ANNOUNCEMENT ---
    announcement_active: "true",
    announcement_text: "TrustBank was recently named 'Best Digital Bank 2026' by Global Finance Magazine.",
    announcement_contact_phone: "1-800-TRUST-VIP",

    // --- HOME PAGE TEXT  ---
    hero_title:    "Wealth Management",
    hero_subtitle: "for the Digital Age.",
    hero_cta_text: "Open an Account",

    // Card Highlight Section
    home_card_title: "The Onyx Card",
    home_card_highlight: "Pure Titanium.",
    home_card_desc: "Experience the weight of true purchasing power. No foreign fees, infinite possibilities.",

    // Wealth Section
    home_invest_title: "Institutional Grade",
    home_invest_highlight: "Investing.",
    home_invest_desc: "Access private credit, automated portfolios, and crypto assets on one unified platform.",

    // Global Visuals
    home_hero_img: "/hero-human.png",
    bank_hero_img: "/bank-hero.png",
    save_hero_img: "/save-hero.png",
    borrow_hero_img: "/borrow-hero.png",
    wealth_hero_img: "/wealth-hero.png",
    insure_hero_img: "/insure-hero.png",
    payments_hero_img: "/payments-hero.png",
    learn_hero_img: "/learn-hero.png",
    about_hero_img: "/about-hero.png",
    crypto_hero_img: "/crypto-phone.png",

    // Nav Promos (Defaults)
    nav_bank_title: "Banking Reimagined",
    nav_bank_desc: "Experience a premium checking account with up to 2-day early deposits and fee-free global ATM access.",

    nav_save_title: "Maximize Your Growth",
    nav_save_desc: "Your money should work as hard as you do. Earn 4.50% APY with our industry-leading High Yield Savings.",

    nav_borrow_title: "Unlock Your Potential",
    nav_borrow_desc: "From 0% Intro APR cards to flexible mortgages, access the capital you need to move forward.",

    nav_wealth_title: "Preserve & Grow",
    nav_wealth_desc: "Institutional-grade investment strategies tailored to your personal legacy and timeline.",

    nav_insure_title: "Comprehensive Protection",
    nav_insure_desc: "Safeguard what matters most. Explore coverage for Life, Auto, and Home with our trusted partners.",

    nav_payments_title: "Borderless Payments",
    nav_payments_desc: "Send funds globally in seconds. Real-time exchange rates and zero hidden fees.",

    nav_learn_title: "Market Intelligence",
    nav_learn_desc: "Stay ahead of the curve with expert analysis and breaking financial news delivered daily.",

    nav_company_title: "Building the Future",
    nav_company_desc: "Join a team of innovators redefining the global financial landscape. See open roles.",

    //  JSON Structure
    nav_structure_json: JSON.stringify(SEED_MENUS),

    // Legal Content
    legal_privacy_policy: SEED_LEGAL_PRIVACY,
    legal_terms_service: SEED_LEGAL_TERMS,
    legal_accessibility_statement: SEED_LEGAL_ACCESS
  };

  // Check if settings row exists (Singleton Pattern)
  const existingSettings = await prisma.siteSettings.findFirst();

  if (existingSettings) {
    // Update existing
    await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: settingsData
    });
    console.log('Site Settings updated');
  } else {
    // Create new
    await prisma.siteSettings.create({
      data: settingsData
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
      answer: "For security, automated resets are disabled. Please visit the 'Forgot Password' page and follow the instructions to verify your identity with our security team.",
      order: 1
    },
    {
      id: "faq_sec_02",
      category: "Security",
      question: "Is my data secure?",
      answer: "Yes, we use 256-bit AES encryption for all data at rest and in transit.",
      order: 2
    },
    {
      id: "faq_sec_03",
      category: "Security",
      question: "Why is my account status showing 'Frozen'?",
      answer: "This is a security measure triggered by unusual activity or multiple failed login attempts. While frozen, you cannot make withdrawals. Please contact support immediately to verify your identity and restore access.",
      order: 3
    },

    // --- TRANSFERS ---
    {
      id: "faq_trf_01",
      category: "Transfers",
      question: "What are the fees for wire and local transfers?",
      answer: "Local transfers between TrustBank accounts are always free ($0). International Wire Transfers incur a flat base fee of $25.00, plus a variable percentage (0.5%) based on the total transaction amount.",
      order: 4
    },
    {
      id: "faq_trf_02",
      category: "Transfers",
      question: "Why is my transfer status 'Pending' or requesting codes?",
      answer: "Large or international transfers often require regulatory clearance to comply with global banking standards. You may be asked to provide specific clearance codes (such as COT, IMF, or Tax Codes) to finalize the transaction.",
      order: 5
    },
    {
      id: "faq_trf_03",
      category: "Transfers",
      question: "How long do crypto deposits take to reflect?",
      answer: "Crypto deposits are credited automatically after 3 network confirmations. This usually takes between 10 to 30 minutes depending on network congestion (Bitcoin/Ethereum).",
      order: 6
    },

    // --- ACCOUNT & CARDS ---
    {
      id: "faq_acc_01",
      category: "Account & Cards",
      question: "What is my daily transaction limit?",
      answer: "Standard accounts have a daily withdrawal limit of $5,000. Enterprise or Verified accounts enjoy higher limits. You can view your current limit in the 'Account Settings' tab.",
      order: 7
    },
    {
      id: "faq_acc_02",
      category: "Account & Cards",
      question: "How do I report a lost or stolen card?",
      answer: "You can instantly freeze your card in the Mobile App under 'Card Controls'. To request a replacement, click the 'Lost Card' quick action above.",
      order: 8
    },
    {
      id: "faq_acc_03",
      category: "Account & Cards",
      question: "Can I use my card while traveling abroad?",
      answer: "Yes. Your card works globally with no foreign transaction fees. We recommend setting a 'Travel Notice' in your dashboard to prevent fraud alerts.",
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