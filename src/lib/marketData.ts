import { db } from "@/lib/db";

const FALLBACK_CRYPTO = {
    tether: {
        usd: 1.00,
        usd_24h_change: 0.0,
        sparkline: [1, 1, 1, 1, 1, 1, 1]
    },
    bitcoin: {
        usd: 98450.00,
        usd_24h_change: 2.4,
        sparkline: [92000, 94000, 93500, 96000, 97000, 95500, 98450]
    },
    ethereum: {
        usd: 2890.50,
        usd_24h_change: -0.5,
        sparkline: [2950, 2900, 2850, 2880, 2920, 2900, 2890]
    },
    solana: {
        usd: 145.20,
        usd_24h_change: 5.1,
        sparkline: [120, 125, 130, 128, 135, 140, 145]
    },
    binance: {
        usd: 900.00,
        usd_24h_change: 1.1,
        sparkline: [850, 870, 860, 880, 890, 885, 900]
    },
    hyperliquid: {
        usd: 20.00,
        usd_24h_change: 2.0,
        sparkline: [15, 17, 16, 18, 19, 18.5, 20]
    },
    ripple: {
        usd: 0.62,
        usd_24h_change: 1.2,
        sparkline: [0.58, 0.59, 0.60, 0.58, 0.61, 0.60, 0.62]
    },
    cardano: {
        usd: 0.45,
        usd_24h_change: -0.8,
        sparkline: [0.48, 0.47, 0.46, 0.47, 0.45, 0.46, 0.45]
    },
    dogecoin: {
        usd: 0.12,
        usd_24h_change: 8.5,
        sparkline: [0.09, 0.10, 0.09, 0.11, 0.10, 0.11, 0.12]
    },
    polkadot: {
        usd: 7.30,
        usd_24h_change: -1.5,
        sparkline: [7.8, 7.6, 7.5, 7.4, 7.6, 7.4, 7.3]
    },
    chainlink: {
        usd: 18.40,
        usd_24h_change: 3.2,
        sparkline: [16.5, 17.0, 17.5, 17.2, 18.0, 17.8, 18.4]
    }
};

const FALLBACK_STOCKS = {
    sp500: {
        price: 4783.45,
        change: 0.45,
        sparkline: [4750, 4765, 4760, 4775, 4780, 4770, 4783.45]
    },
    nasdaq: {
        price: 15400.20,
        change: 0.85,
        sparkline: [15200, 15300, 15250, 15350, 15450, 15380, 15400.20]
    },
    dow: {
        price: 38100.50,
        change: 0.20,
        sparkline: [37900, 38000, 37950, 38050, 38150, 38080, 38100.50]
    },
    gold: {
        price: 2045.00,
        change: -0.10,
        sparkline: [2055, 2050, 2060, 2055, 2048, 2050, 2045]
    }
};

interface CoinGeckoResponse {
    [key: string]: {
        usd: number;
        usd_24h_change: number;
        sparkline_7d?: {
            price: number[];
        };
    };
}

// Helper for Stock API (Alpha Vantage)
async function getLiveStock(apiId: string, symbol: string) {
    const API_KEY = process.env.ALPHA_VANTAGE_KEY;
    const fallback = FALLBACK_STOCKS[symbol as keyof typeof FALLBACK_STOCKS];

    try {
        const res = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${apiId}&apikey=${API_KEY}`,
           { next: { revalidate: 3600 } } // Cache for 1 hour
        );
        const data = await res.json();
        const quote = data["Global Quote"];

       if (!quote || !quote["05. price"]) {
            console.warn(`⚠️ Alpha Vantage limit or invalid ID for ${symbol}`);
            return { symbol, price: null, change: null, isLive: false };
        }

        const price = parseFloat(quote["05. price"]);
        const change = parseFloat(quote["10. change percent"].replace('%', ''));

        return { symbol, price, change, isLive: true };
    } catch (e) {
        console.error(`Stock Fetch Failed for ${symbol}:`, e);
        return {
            symbol,
            price: fallback?.price ?? 0,
            change: fallback?.change ?? 0,
            isLive: false
         };
    }
}

export async function getLiveMarketData() {
    // 1. Fetch intended assets
    const managedAssets = await db.managedAsset.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });

    // 2. Prep Crypto Batch
    const cryptoAssets = managedAssets.filter(a => a.type === 'CRYPTO');
    const cryptoIds = cryptoAssets.map(a => a.api_id).join(',');

    // 3. Prep Stock Individual Requests
    const stockAssets = managedAssets.filter(a => a.type === 'STOCK');

    // 4. Execute API Calls
    const cryptoRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true&include_7d_sparkline=true`,
        { next: { revalidate: 60 } }
    );
    const cryptoData: CoinGeckoResponse = cryptoRes.ok ? await cryptoRes.json() : {};

    const now = new Date().getTime();
    const COOLDOWN = 15 * 60 * 1000;

    const stockDataResults = await Promise.all(
        stockAssets.map(async (asset) => {
            const lastUpdate = asset.last_updated?.getTime() || 0;
            if (now - lastUpdate < COOLDOWN && asset.last_good_price) {
                return { symbol: asset.symbol, price: asset.last_good_price, change: 0, isLive: true };
            }
            return getLiveStock(asset.api_id, asset.symbol);
        })
    );

 // 5. Final Mapping & DB Sync
const finalData = await Promise.all(managedAssets.map(async (asset) => {
    let currentPrice = asset.last_good_price ?? 0;
    let currentChange = 0;
    let isLive = false;

    // 1. Get Price/Change
    if (asset.type === 'CRYPTO') {
        const live = cryptoData?.[asset.api_id];
        if (live) {
            currentPrice = live.usd;
            currentChange = live.usd_24h_change;
            isLive = true;
        }
    } else {
        const live = stockDataResults.find(s => s.symbol === asset.symbol);
        if (live && live.isLive) {
            currentPrice = live.price ?? asset.last_good_price ?? 0;
            currentChange = live.change ?? 0;
            isLive = true;
        }
    }

    // 2. THE SPARKLINE "KILL SWITCH"
    let spark = (asset.sparkline as number[]) || [];

    if (spark.length < 5 || spark.every(v => v === spark[0])) {
        const points = 20;
        const volatility = Math.abs(currentChange) > 0 ? Math.abs(currentChange) / 100 : 0.02;
        spark = [];
        let lastVal = currentPrice;
        for (let i = 0; i < points; i++) {
            lastVal = lastVal * (1 + (Math.random() - 0.5) * volatility);
            spark.push(lastVal);
        }
    }

    if (isLive) {
        await db.managedAsset.update({
            where: { id: asset.id },
            data: {
                last_good_price: currentPrice,
                last_updated: new Date(),
                sparkline: spark
            }
        }).catch(() => {});
    }

    return {
        ...asset,
        isCrypto: asset.type === 'CRYPTO',
        price: currentPrice,
        change: currentChange,
        sparkline: spark,
        isLive: isLive,
        lastUpdated: asset.last_updated
    };
}));

    const lastUpdateAttempt = finalData.reduce((latest, asset) => {
        if (!asset.last_updated) return latest;
        return asset.last_updated > latest ? asset.last_updated : latest;
    }, new Date(0));

    return {
        assets: finalData,
        lastUpdated: lastUpdateAttempt
    };
}

// async function getLiveStock(apiId: string, symbol: string) {
//     const API_KEY = process.env.ALPHA_VANTAGE_KEY;
//     const fallback = FALLBACK_STOCKS[symbol as keyof typeof FALLBACK_STOCKS];

//     // If no API key is set, go straight to fallback
//     if (!API_KEY) return { ...fallback, isLive: false };

//     try {
//         const res = await fetch(
//             `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`,
//             { next: { revalidate: 3600 } } // Cache for 1 hour
//         );

//         const data = await res.json();
//         const quote = data["Global Quote"];

//         // if (!quote) throw new Error("No data");
//         // If API limit reached or symbol not found, use fallback
//         if (!quote || !quote["05. price"]) {
//             return { ...fallback, isLive: false };
//         }

//         return {
//             symbol,
//             price: parseFloat(quote["05. price"]),
//             change: parseFloat(quote["10. change percent"].replace('%', '')),
//             sparkline: fallback?.sparkline || [],
//             isLive: true
//         };
//     } catch (error) {
//         return { ...fallback, symbol, isLive: false };
//     }
// }


// export async function getLiveMarketData() {
//     // 1. Get the list from Postgres
//     const managedAssets = await db.managedAsset.findMany({
//         where: { isActive: true },
//         orderBy: { sortOrder: 'asc' }
//     });

//     // 2. Separate them for the APIs
//     const cryptoIds = managedAssets.filter(a => a.type === 'CRYPTO').map(a => a.api_id).join(',');
//     const stockAssets = managedAssets.filter(a => a.type === 'STOCK');

//     // 3. Fetch Crypto Data (CoinGecko) using the dynamic list
//    const cryptoRes = await fetch(
//         `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`,
//         { next: { revalidate: 60 } }
//     );
//     const cryptoData = cryptoRes.ok ? await cryptoRes.json() : null;

//     // 4. Fetch Stock Data (Alpha Vantage) in parallel
//     const stockData = await Promise.all(
//         stockAssets.map(stock => getLiveStock(stock.api_id, stock.symbol))
//     );

//     // 5. Combine and Map
//     return managedAssets.map(asset => {
//         if (asset.type === 'CRYPTO') {
//             const liveData = cryptoData[asset.api_id];
//             const staticFallback = FALLBACK_CRYPTO[asset.symbol as keyof typeof FALLBACK_CRYPTO];
//             return {
//                 ...asset,
//                price: liveData?.usd ?? staticFallback?.usd ?? 0,
//             change: liveData?.usd_24h_change ?? staticFallback?.usd_24h_change ?? 0,
//             sparkline: liveData?.sparkline_7d?.price ?? staticFallback?.sparkline ?? [],
//             isCrypto: true
//             };
//         } else {
//             const data = stockData.find(s => s.symbol === asset.symbol);
//             return {
//                 ...asset,
//                 price: data?.price ?? 0,
//                 change: data?.change ?? 0,
//                 isCrypto: false
//             };
//         }
//     });
// }

// export async function getLiveMarketData() {
//     try {
//         // 1. Fetch Crypto
//         const coinIds = "tether,bitcoin,ethereum,solana,binance,hyperliquid,ripple,cardano,dogecoin,polkadot,chainlink";
//         const cryptoRes = await fetch(
//             `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_7d_sparkline=true`,
//             { next: { revalidate: 60 } }
//         );

//         let cryptoData: CoinGeckoResponse = {};
//         if (cryptoRes.ok) cryptoData = await cryptoRes.json();

//         // 2. Fetch Stocks in Parallel
//         const [sp500, nasdaq, dow, gold] = await Promise.all([
//             getLiveStock('SPY', 'sp500'),
//             getLiveStock('QQQ', 'nasdaq'),
//             getLiveStock('DIA', 'dow'),
//             getLiveStock('GLD', 'gold'),
//         ]);

//         const getCoin = (id: string, key: keyof typeof FALLBACK_CRYPTO) => {
//             const live = cryptoData[id];
//             const fallback = FALLBACK_CRYPTO[key];
//             return {
//                 price: live?.usd ?? fallback.usd,
//                 change: live?.usd_24h_change ?? fallback.usd_24h_change,
//                 sparkline: live?.sparkline_7d?.price ?? fallback.sparkline
//             };
//         };

//         return [
//             { symbol: "USDT", name: "Tether", ...getCoin('tether', 'tether'), isCrypto: true },
//             { symbol: "S&P 500", name: "S&P 500 Index", ...sp500, isCrypto: false },
//             { symbol: "BTC", name: "Bitcoin", ...getCoin('bitcoin', 'bitcoin'), isCrypto: true },
//             { symbol: "ETH", name: "Ethereum", ...getCoin('ethereum', 'ethereum'), isCrypto: true },
//             { symbol: "NSDQ", name: "Nasdaq 100", ...nasdaq, isCrypto: false },
//             { symbol: "SOL", name: "Solana", ...getCoin('solana', 'solana'), isCrypto: true },
//             { symbol: "BNB", name: "Binance", ...getCoin('binance', 'binance'), isCrypto: true },
//             { symbol: "DOW", name: "Dow Jones", ...dow, isCrypto: false },
//             { symbol: "HYPE", name: "Hyperliquid", ...getCoin('hyperliquid', 'hyperliquid'), isCrypto: true },
//             { symbol: "XRP", name: "Ripple", ...getCoin('ripple', 'ripple'), isCrypto: true },
//             { symbol: "GOLD", name: "Gold Spot", ...gold, isCrypto: false },
//             { symbol: "ADA", name: "Cardano", ...getCoin('cardano', 'cardano'), isCrypto: true },
//             { symbol: "DOGE", name: "Dogecoin", ...getCoin('dogecoin', 'dogecoin'), isCrypto: true },
//             { symbol: "DOT", name: "polkadot", ...getCoin('polkadot', 'polkadot'), isCrypto: true },
//             { symbol: "LINK", name: "Chainlink", ...getCoin('chainlink', 'chainlink'), isCrypto: true },
//         ];

//     } catch (error) {
//         console.error("Market Data Error:", error);
//         return [];
//     }
// }
