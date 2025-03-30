import { addParsedYear } from "./tools/addParsedYear.js";
import { writeToExcel } from "./tools/excelWriter.js"; // Assuming you have a function to write to Excel
import { loadJSON } from "./tools/jsonLoader.js";
const filenames = [
  "data/0-500.json",
  "data/500-1000.json",
  "data/1000-1500.json",
  "data/1500-2000.json",
];
let entireHistoryArray = [];

async function getEntireHistory(filenames) {
  for (let filename of filenames) {
    await getConsolidatedArrays(filename, entireHistoryArray);
  }
  // console.log(entireHistoryArray.length);
}

// Get consolidated arrays of steamItems, price, and +/-, updates entireHistoryArray, mutates entireHistoryArray -> returns void
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
  let entireHistoryArrayCounter = 0; // counter for entireHistoryArrayCounter

  for (let i = 0; i < priceArray.length; i++) {
    if (i === 0) {
      // Initialize the first entry
      entireHistoryArray.push([
        1,
        steamItemsArray[i],
        positiveNegativeArray[i] == "+" ? "BUY" : "SELL",
        priceArray[i],
        dateArray[i],
      ]);
    } else {
      // Check if the current entry is the same as the previous one
      if (
        steamItemsArray[i] === steamItemsArray[i - 1] &&
        positiveNegativeArray[i] === positiveNegativeArray[i - 1] &&
        priceArray[i] === priceArray[i - 1] &&
        dateArray[i] === dateArray[i - 1]
      ) {
        // If the entry is the same, increment the count of the previous one
        entireHistoryArray[entireHistoryArrayCounter][0] += 1;
      } else {
        // Otherwise, add the new entry to the array
        entireHistoryArray.push([
          1,
          steamItemsArray[i],
          positiveNegativeArray[i] == "+" ? "BUY" : "SELL",
          priceArray[i],
          dateArray[i],
        ]);
        entireHistoryArrayCounter++;
      }
    }
  }
  // Writing to an excel sheet
  writeToExcel(entireHistoryArray);
};

//current structure: [steamItem, [+-], price]
const countSteamItemsProfit = async () => {
  await getEntireHistory(filenames);
  let hash = {};

  for (let i = 0; i < entireHistoryArray.length; i++) {
    let steamItem = entireHistoryArray[i][1];
    let price = parseFloat(entireHistoryArray[i][3]);
    let positiveNegative = entireHistoryArray[i][2];
    // Ensure hash[steamItem] is always an object
    if (!hash[steamItem]) {
      hash[steamItem] = { totalCost: 0, quantity: 0 };
    }
    // Update costs
    if (positiveNegative === "+") {
      hash[steamItem].totalCost += price;
      hash[steamItem].quantity += 1;
    } else {
      hash[steamItem].totalCost -= price;
      hash[steamItem].quantity -= 1;
    }
  }
  return hash;
};

export async function scrapeAndCleanHistory() {
  await getEntireHistory(filenames);

  // fill up missing dates
  for (let i = 1; i < entireHistoryArray.length; i++) {
    if (entireHistoryArray[i][4] === undefined) {
      entireHistoryArray[i][4] = entireHistoryArray[i - 1][4]; // Fill with the previous date
    }
  }
  // Remove undefined items
  for (let i = 1; i < entireHistoryArray.length; i++) {
    if (entireHistoryArray[i][1] === undefined) {
      entireHistoryArray.splice(i, 1); // Remove the item
      i--; // Decrement i to account for the removed item
    }
  }
  let updatedArr = addParsedYear(entireHistoryArray, 2025); // Assuming the initial year is 2025
  console.log(updatedArr[updatedArr.length - 1]); // Check the last date in the updated array
  return updatedArr;
}
