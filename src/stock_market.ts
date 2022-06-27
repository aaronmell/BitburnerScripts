import { NS } from "NetscriptDefinitions";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog("disableLog");
  ns.disableLog("sleep");
  ns.disableLog("getServerMoneyAvailable");

  await ns.write("stock_ledger.txt", "", "w");

  const initialFunds = ns.getServerMoneyAvailable("home");
  ns.printf("Initial Funds are %s", ns.nFormat(initialFunds, "0.0a"));

  while (true) {
    await tradeStocks(ns);
    await ns.sleep(1000);
  }
}

export async function tradeStocks(ns: NS) {
  const funds = ns.getServerMoneyAvailable("home");

  const stockData = getStockData(ns).sort((x, y) => y.forecast - x.forecast);

  for (const data of stockData) {
    const position = ns.stock.getPosition(data.symbol);

    if (position[0]) {
      await sellPosition(ns, data, position[0]);
    }

    await buyPosition(ns, data, position[0], funds);
  }
}

/** @param {NS} ns */
async function buyPosition(
  ns: NS,
  stock: StockData,
  position: number,
  funds: number
): Promise<void> {
  const minimumFunds = 10000000;
  const minimumForecase = 0.6;
  const maximumVolitility = 0.05;
  //If stock is not trending up, then don't buy
  if (stock.forecast < minimumForecase) {
    return;
  }

  if (stock.volitility > maximumVolitility) {
    return;
  }

  const currentFunds = funds - minimumFunds;

  if (currentFunds < 0) {
    return;
  }

  // ns.printf("Current Funds is %e", currentFunds);

  const availableShares = stock.maxShares - position;
  const minimumShares = await getMinimumShares(
    ns,
    stock.symbol,
    100,
    currentFunds
  );

  if (minimumShares === 0) {
    return;
  }

  const sharesToBuy = Math.min(availableShares, stock.maxShares, minimumShares);
  ns.stock.buy(stock.symbol, sharesToBuy);
  return;
}

/** @param {NS} ns */
async function getMinimumShares(
  ns: NS,
  symbol: string,
  minimumShares: number,
  currentFunds: number
): Promise<number> {
  let sharesToBuy = minimumShares;
  let previousSharesToBuy = sharesToBuy;
  let previousSharesToBuyCost = 0;
  let costMultiplier = 1;

  while (true) {
    const cost = ns.stock.getPurchaseCost(symbol, sharesToBuy, "Long");
    if (currentFunds < cost) {
      if (sharesToBuy === minimumShares) {
        return 0;
      }
      ns.printf(
        "%s %s %s %s %s ",
        sharesToBuy,
        previousSharesToBuy,
        previousSharesToBuyCost,
        costMultiplier,
        currentFunds
      );

      ns.printf(
        "Have %s Buying %s for %s",
        ns.nFormat(currentFunds, "0.0a"),
        ns.nFormat(previousSharesToBuy, "0.0a"),
        ns.nFormat(previousSharesToBuyCost, "0.0a")
      );

      return previousSharesToBuy;
    }
    previousSharesToBuy = sharesToBuy;
    previousSharesToBuyCost = cost;
    sharesToBuy = sharesToBuy * costMultiplier;

    costMultiplier += 2;
    await ns.sleep(20);
  }
}

/** @param {NS} ns */
async function sellPosition(
  ns: NS,
  stock: StockData,
  position: number
): Promise<void> {
  //ns.printf("Position %s forecast is %s", stock.symbol, stock.forecast);
  if (stock.forecast < 0.5) {
    ns.stock.sell(stock.symbol, position);
  }
}

/** @param {NS} ns */
function getStockData(ns: NS): StockData[] {
  const stockDataList = [];
  const symbols = ns.stock.getSymbols();

  for (const symbol of symbols) {
    stockDataList.push({
      symbol,
      ask: ns.stock.getAskPrice(symbol),
      bid: ns.stock.getBidPrice(symbol),
      forecast: ns.stock.getForecast(symbol),
      maxShares: ns.stock.getMaxShares(symbol),
      volitility: ns.stock.getVolatility(symbol),
    });
  }

  return stockDataList;
}

interface StockData {
  symbol: string;
  ask: number;
  bid: number;
  forecast: number;
  maxShares: number;
  volitility: number;
}
