export const SITE_NAME = "TrustBank";
export const SITE_DESCRIPTION = "Banking for the Future. Secure, fast, and reliable banking solutions for everyone.";
export const SITE_LOGO = "/logo.png";

export interface MegaMenuLink {
    label: string;
    href: string;
    desc?: string;
}

export interface MegaMenuSection {
    title: string;
    links: MegaMenuLink[][];
    promo?: {
        title: string;
        desc: string;
        btnText: string;
        href: string;
    };
}

export const MEGA_MENUS: Record<string, MegaMenuSection> = {
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

    INSURE: {
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
    },
};