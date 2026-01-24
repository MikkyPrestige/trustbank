
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. FAQs
  await prisma.faqItem.createMany({
    data: [
      // --- SECURITY ---
      {
        id: "default-reset",
        category: "Security",
        question: "How do I reset my online banking password?",
        answer: "For security, automated resets are disabled. Please visit the 'Forgot Password' page and follow the instructions to verify your identity with our security team.",
        order: 1
      },
      {
        id: "default-secure",
        category: "Security",
        question: "Is my data secure?",
        answer: "Yes, we use 256-bit AES encryption for all data at rest and in transit.",
        order: 2
      },
      {
        id: "default-frozen",
        category: "Security",
        question: "Why is my account status showing 'Frozen'?",
        answer: "This is a security measure triggered by unusual activity or multiple failed login attempts. While frozen, you cannot make withdrawals. Please contact support immediately to verify your identity and restore access.",
        order: 3
      },

      // --- TRANSFERS ---
      {
        id: "default-fees",
        category: "Transfers",
        question: "What are the fees for wire and local transfers?",
        answer: "Local transfers between TrustBank accounts are always free ($0). International Wire Transfers incur a flat base fee of $25.00, plus a variable percentage (0.5%) based on the total transaction amount.",
        order: 4
      },
      {
        id: "default-codes",
        category: "Transfers",
        question: "Why is my transfer status 'Pending' or requesting codes?",
        answer: "Large or international transfers often require regulatory clearance to comply with global banking standards. You may be asked to provide specific clearance codes (such as COT, IMF, or Tax Codes) to finalize the transaction.",
        order: 5
      },
      {
         id: "default-crypto",
         category: "Transfers",
         question: "How long do crypto deposits take to reflect?",
         answer: "Crypto deposits are credited automatically after 3 network confirmations. This usually takes between 10 to 30 minutes depending on network congestion (Bitcoin/Ethereum).",
         order: 6
      },

      // --- ACCOUNT & CARDS ---
      {
         id: "default-limits",
         category: "Account & Cards",
         question: "What is my daily transaction limit?",
         answer: "Standard accounts have a daily withdrawal limit of $5,000. Enterprise or Verified accounts enjoy higher limits. You can view your current limit in the 'Account Settings' tab.",
         order: 7
      },
      {
         id: "default-card",
         category: "Account & Cards",
         question: "How do I report a lost or stolen card?",
         answer: "You can instantly freeze your card in the Mobile App under 'Card Controls'. To request a replacement, click the 'Lost Card' quick action above.",
         order: 8
      },
      {
        id: "default-travel",
        category: "Account & Cards",
        question: "Can I use my card while traveling abroad?",
        answer: "Yes. Your card works globally with no foreign transaction fees. We recommend setting a 'Travel Notice' in your dashboard to prevent fraud alerts.",
        order: 9
      }
    ]
  });
  console.log('✅ FAQs seeded');

  // 2. JOBS
  await prisma.jobListing.createMany({
    data: [
      {
        title: "Senior Financial Analyst",
        department: "Finance",
        location: "New York, NY",
        type: "Full-time",
        description: "Lead financial forecasting and wealth management strategies for high-net-worth clients.",
        isActive: true
      },
      {
        title: "Compliance Officer",
        department: "Legal",
        location: "London, UK",
        type: "Full-time",
        description: "Oversee regulatory adherence for cross-border payments and international trade finance.",
        isActive: true
      },
      {
        title: "Customer Success Specialist",
        department: "Support",
        location: "Phoenix, AZ",
        type: "Part-time",
        description: "Provide world-class support to our retail banking customers via chat and phone.",
        isActive: true
      },
      {
        title: "Senior Frontend Engineer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        description: "Build the next generation of our mobile and web banking dashboards",
        isActive: true
      },
      {
        title: "Relationship Banker",
        department: "Retail Banking",
        location: "New York, NY",
        type: "Full-time",
        description: "Manage client relationships and assist with account opening, loans, and investment products.",
        isActive: true
      },
      {
        title: "Information Security Analyst",
        department: "Security",
        location: "Remote",
        type: "Full-time",
        description: "Monitor and defend our banking infrastructure against cyber threats and fraud attempts.",
        isActive: true
      }
    ]
  });
  console.log('✅ Jobs seeded');

  // 3. BRANCHES
  await prisma.branch.createMany({
    data: [
      {
        name: "Global Headquarters",
        address: "100 Wall Street, Fl 24",
        city: "New York, NY",
        phone: "+1 (212) 555-0199",
        email: "nyc.main@trustbank.com",
        hours: "Mon - Fri: 8:00 AM - 6:00 PM",
        isActive: true
      },
      {
        name: "London Operations",
        address: "45 Canary Wharf",
        city: "London, UK",
        phone: "+44 20 7946 0958",
        email: "london@trustbank.com",
        hours: "Mon - Fri: 9:00 AM - 5:00 PM",
        isActive: true
      },
      {
        name: "Tech Hub & Innovation",
        address: "500 Howard St",
        city: "San Francisco, CA",
        phone: "+1 (415) 555-0123",
        email: "sf.tech@trustbank.com",
        hours: "Mon - Fri: 10:00 AM - 4:00 PM",
        isActive: true
      },
      {
        name: "Private Wealth Center",
        address: "212 Camelback Rd",
        city: "Phoenix, AZ",
        phone: "+1 (602) 555-6789",
        email: "wealth.az@trustbank.com",
        hours: "By Appointment Only",
        isActive: true
      }
    ]
  });
  console.log('✅ Branches seeded');
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