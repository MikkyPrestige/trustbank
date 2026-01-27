export const STATIC_MENUS = {
    BANK: {
        title: "BANKING",
        links: [
            [
                { label: "Checking & Savings", href: "/bank" },
                { label: "Business Banking", href: "/bank#business" },
                { label: "Student Banking", href: "/bank#student" },
            ],
            [
                { label: "Current Rates", href: "/rates" },
                { label: "ATMs & Locations", href: "/locations" },
                { label: "Global Transfers", href: "/payments" },
            ]
        ],
        promo: {
            title: "Switch in 3 Minutes",
            desc: "Move your direct deposit to TrustBank and get paid up to 2 days early.",
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
                { label: "Money Market", href: "/save#mma" },
            ],
            [
                { label: "Trust Kids Club", href: "/save#kids" },
                { label: "Retirement (IRAs)", href: "/wealth" },
                { label: "Savings Calculator", href: "/save" },
            ]
        ],
        promo: {
            title: "Earn 4.50% APY",
            desc: "Watch your wealth grow with our industry-leading High Yield Savings account.",
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
                { label: "Mortgages", href: "/borrow#mt" },
            ],
            [
                { label: "Auto Loans", href: "/borrow#al" },
                { label: "Student Loans", href: "/borrow#sl" },
                { label: "Loan Calculator", href: "/borrow" },
            ]
        ],
        promo: {
            title: "0% Intro APR",
            desc: "Pay no interest for 15 months on purchases and balance transfers.",
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
                { label: "Private Client Group", href: "/wealth" },
            ],
            [
                { label: "Retirement Planning", href: "/wealth" },
                { label: "Estate & Trust Services", href: "/wealth" },
                { label: "Wealth Simulator", href: "/wealth" },
            ]
        ],
        promo: {
            title: "Private Consultation",
            desc: "Get a complimentary portfolio strategy review with a dedicated fiduciary advisor.",
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
                { label: "Homeowners & Renters", href: "/insure" },
            ],
            [
                { label: "Life Insurance", href: "/insure" },
                { label: "Accidental Death", href: "/insure" },
                { label: "Hospital Accident", href: "/insure" },
            ]
        ],
        promo: {
            title: "Let's Navigate Medicare",
            desc: "Trust offers dedicated specialists to help you prepare and understand your options.",
            btnText: "Learn More",
            href: "/insure"
        }
    },
    PAYMENTS: {
        title: "PAYMENTS CENTER",
        links: [
            [
                { label: "Pay Bills", href: "/payments" },
                { label: "Send to Friends (P2P)", href: "/payments" },
                { label: "Wire Transfers", href: "/payments" },
            ],
            [
                { label: "Loan Payments", href: "/payments" },
                { label: "Manage AutoPay", href: "/payments" },
                { label: "Global Transfer Estimator", href: "/payments" },
            ]
        ],
        promo: {
            title: "Global Transfers",
            desc: "Send money to 40+ countries instantly with zero hidden fees.",
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
                { label: "Retirement Strategies", href: "/learn" },
            ],
            [
                { label: "Market News & Analysis", href: "/learn" },
                { label: "Business Insights", href: "/learn" },
                { label: "Financial Wellness Pulse", href: "/learn" },
            ]
        ],
        promo: {
            title: "The Weekly Brief",
            desc: "Subscribe to our curated newsletter for the latest market moves.",
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
                { label: "Investor Relations", href: "/investors" },
            ],
            [
                { label: "Help Center (FAQs)", href: "/help" },
                { label: "Contact Support", href: "/contact" },
                { label: "Legal & Privacy", href: "/terms" },
                { label: "Security Center", href: "/security" },
            ]
        ],
        promo: {
            title: "Join the Team",
            desc: "We are building the bank of the future. Come help us change the world.",
            btnText: "View Open Roles",
            href: "/careers"
        }
    }
};