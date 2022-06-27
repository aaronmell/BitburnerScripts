// import { expect } from "chai";
import { tradeStocks } from "../src/stock_market";
import * as td from "testdouble";
import { NS } from "../NetscriptDefinitions";

describe("Stock Trading Tests", () => {
  const mockNS = td.object<NS>();

  it("Trades without error", async () => {
    td.when(mockNS.stock.getSymbols()).thenReturn([]);
    await tradeStocks(mockNS);
  });
});
