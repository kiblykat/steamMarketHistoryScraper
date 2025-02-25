import { readFile } from "fs/promises";

let entireHistoryArray = [];
const filenames = [
  "0-500.json",
  "500-1000.json",
  "1000-1500.json",
  "1500-2000.json",
];

const loadJSON = async (filename) => {
  try {
    const jsonString = await readFile(filename, "utf8");
    const jsonData = await JSON.parse(jsonString);
    return jsonData;
  } catch (err) {
    console.error("Error reading JSON file:", err);
  }
};

// Get consolidated arrays of steamItems, price, and +/-, updates entireHistoryArray -> returns void
const getConsolidatedArrays = async (filename, entireHistoryArray) => {
  const jsonData = await loadJSON(filename);

  let priceTransactionData = jsonData.results_html;

  const positiveNegativeLookupRegex =
    /(?<=market_listing_left_cell market_listing_gainorloss\"\u003E\n\t\t)[+-]/g;

  const priceLookupRegex =
    /(?<=market_listing_price\"\u003E\n\t\t\t\t\t\t\t\tS\$)\d+\.\d+/g;

  const dateLookupRegex = /(?<=Purchased:\s)\d+\s[a-zA-Z]+/g;

  //Get array of + and - values
  const positiveNegativeArray = priceTransactionData.match(
    positiveNegativeLookupRegex
  );

  //Get array of prices in string format
  const priceArray = priceTransactionData.match(priceLookupRegex);
  const dateArray = priceTransactionData.match(dateLookupRegex);

  //Get array of steamItems
  const steamItemsArray = [];
  for (let item in jsonData["assets"][730][2]) {
    steamItemsArray.push(jsonData["assets"][730][2][item]["name"]);
  }

  //consolidatedArray: [steamItem, [+-], price][]
  for (let i = 0; i < priceArray.length; i++) {
    entireHistoryArray.push([
      steamItemsArray[i],
      positiveNegativeArray[i],
      priceArray[i],
      dateArray[i],
    ]);
  }
};

async function getEntireHistory(filenames) {
  for (let filename of filenames) {
    await getConsolidatedArrays(filename, entireHistoryArray);
  }
  console.log(entireHistoryArray.length);
  console.log(entireHistoryArray);
}

//current structure: [steamItem, [+-], price]
const countSteamItemsProfit = async () => {
  await getEntireHistory(filenames);
  let hash = {};

  for (let i = 0; i < entireHistoryArray.length; i++) {
    let steamItem = entireHistoryArray[i][0];
    let price = parseFloat(entireHistoryArray[i][2]);
    let positiveNegative = entireHistoryArray[i][1];
    // Ensure hash[steamItem] is always an object
    if (!hash[steamItem]) {
      hash[steamItem] = { totalCost: 0, quantity: 0 };
    }
    // Update costs
    if (positiveNegative === "+") {
      hash[steamItem].totalCost += price;
    } else {
      hash[steamItem].totalCost -= price;
    }
    // Update quantity
    hash[steamItem].quantity += 1;
  }

  return hash;
};

await countSteamItemsProfit();
