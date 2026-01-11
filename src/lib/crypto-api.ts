// Fallback data in case API is down or rate-limited
const FALLBACK_PRICES = {
    bitcoin: { usd: 98450.00, usd_24h_change: 2.4 },
    ethereum: { usd: 2890.50, usd_24h_change: -0.5 },
    solana: { usd: 145.20, usd_24h_change: 5.1 },
    hype: { usd: 0.00045, usd_24h_change: 0 } // Custom token not on Gecko
};

export async function getLiveCryptoPrices() {
    try {
        // Fetching BTC, ETH, SOL
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true",
            { next: { revalidate: 60 } } // Cache for 60 seconds
        );

        if (!response.ok) {
            console.warn("CoinGecko API limit reached, using fallback.");
            return FALLBACK_PRICES;
        }

        const data = await response.json();

        // Merge with our custom HYPE coin which isn't on CoinGecko
        return {
            ...data,
            hype: FALLBACK_PRICES.hype
        };
    } catch (error) {
        console.error("Crypto API Error:", error);
        return FALLBACK_PRICES;
    }
}