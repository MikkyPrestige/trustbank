// 1. Separate Crypto Fallback (Structure: usd, usd_24h_change)
const FALLBACK_CRYPTO = {
    bitcoin: { usd: 98450.00, usd_24h_change: 2.4 },
    ethereum: { usd: 2890.50, usd_24h_change: -0.5 },
    solana: { usd: 145.20, usd_24h_change: 5.1 },
    ripple: { usd: 0.62, usd_24h_change: 1.2 },
    cardano: { usd: 0.45, usd_24h_change: -0.8 },
    dogecoin: { usd: 0.12, usd_24h_change: 8.5 },
    polkadot: { usd: 7.30, usd_24h_change: -1.5 },
    chainlink: { usd: 18.40, usd_24h_change: 3.2 },
};

// 2. Separate Stock Fallback (Structure: price, change)
const FALLBACK_STOCKS = {
    sp500: { price: 4783.45, change: 0.45 },
    nasdaq: { price: 15400.20, change: 0.85 },
    dow: { price: 38100.50, change: 0.20 },
    gold: { price: 2045.00, change: -0.10 }
};

// Define the shape of our API response to help TS
interface CoinGeckoResponse {
    [key: string]: {
        usd: number;
        usd_24h_change: number;
    };
}

export async function getLiveMarketData() {
    try {
        const coinIds = "bitcoin,ethereum,solana,ripple,cardano,dogecoin,polkadot,chainlink";

        const cryptoResponse = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
            { next: { revalidate: 60 } }
        );

        let cryptoData: CoinGeckoResponse = {};

        if (cryptoResponse.ok) {
            cryptoData = await cryptoResponse.json();
        } else {
            console.warn("CoinGecko rate limit, using fallback.");
        }

        // Helper: Now strictly types 'key' as a key of FALLBACK_CRYPTO only
        const getCoin = (id: string, key: keyof typeof FALLBACK_CRYPTO) => {
            const live = cryptoData[id];
            const fallback = FALLBACK_CRYPTO[key];

            // Normalize everything to 'price' and 'change'
            return {
                price: live?.usd ?? fallback.usd,
                change: live?.usd_24h_change ?? fallback.usd_24h_change
            };
        };

        // Simulate Stocks
        const sp500 = simulateStockMovement(FALLBACK_STOCKS.sp500.price);
        const nasdaq = simulateStockMovement(FALLBACK_STOCKS.nasdaq.price);
        const dow = simulateStockMovement(FALLBACK_STOCKS.dow.price);
        const gold = simulateStockMovement(FALLBACK_STOCKS.gold.price);

        // Return a clean, uniform array
        return [
            { symbol: "S&P 500", price: sp500.price, change: sp500.change, isCrypto: false },
            { symbol: "BTC", ...getCoin('bitcoin', 'bitcoin'), isCrypto: true },
            { symbol: "NSDQ", price: nasdaq.price, change: nasdaq.change, isCrypto: false },
            { symbol: "ETH", ...getCoin('ethereum', 'ethereum'), isCrypto: true },
            { symbol: "DOW", price: dow.price, change: dow.change, isCrypto: false },
            { symbol: "SOL", ...getCoin('solana', 'solana'), isCrypto: true },
            { symbol: "GOLD", price: gold.price, change: gold.change, isCrypto: false },
            { symbol: "XRP", ...getCoin('ripple', 'ripple'), isCrypto: true },
            { symbol: "ADA", ...getCoin('cardano', 'cardano'), isCrypto: true },
            { symbol: "DOGE", ...getCoin('dogecoin', 'dogecoin'), isCrypto: true },
            { symbol: "LINK", ...getCoin('chainlink', 'chainlink'), isCrypto: true },
        ];

    } catch (error) {
        console.error("Market Data Error:", error);
        return [];
    }
}

function simulateStockMovement(basePrice: number) {
    const randomFluctuation = (Math.random() - 0.5) * (basePrice * 0.002);
    const randomChange = (Math.random() - 0.5) * 1.5;
    return {
        price: basePrice + randomFluctuation,
        change: randomChange
    };
}