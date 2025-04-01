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
  console.log(
    "positiveNegativeArray - priceArray - dateArray - steamItemsArray"
  );

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

  const dateLookupRegex =
    /(?<=\n\t\u003C\/div\u003E\n\t\u003Cdiv class="market_listing_right_cell market_listing_listed_date can_combine"\u003E\n\t\t)\d+\s[a-zA-Z]+/g;

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
  // THE LENGTHS ARE NOT THE SAME!
  console.log(
    "        " +
      positiveNegativeArray.length +
      "           -     " +
      priceArray.length +
      "    -    " +
      dateArray.length +
      "    -    " +
      steamItemsArray.length
  );

  //consolidatedArray: [quantity, itemName, BUY/SELL, price, date][]

  for (let i = 0; i < priceArray.length; i++) {
    if (i === 0) {
      // Initialize the first entry
      entireHistoryArray.push([
        1,
        steamItemsArray[i],
        positiveNegativeArray[i],
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
        // If the entry is the same, increment the quantity of the last element input one
        entireHistoryArray[entireHistoryArray.length - 1][0] += 1;
      } else {
        // Otherwise, add the new entry to the array
        entireHistoryArray.push([
          1,
          steamItemsArray[i],
          positiveNegativeArray[i],
          priceArray[i],
          dateArray[i],
        ]);
      }
    }
  }

  // Writing to an excel sheet
  writeToExcel(entireHistoryArray);
};

export async function scrapeAndCleanHistory() {
  await getEntireHistory(filenames);

  // fill up missing dates and convert +/- to BUY/SELL
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

  for (let arr of updatedArr) {
    arr[2] = arr[2] === "+" ? "BUY" : "SELL"; // Convert + and - to BUY and SELL
  }

  // Remove duplicates based on the first three elements (quantity, itemName, BUY/SELL)
  console.log(updatedArr.slice(170, 200));
  // console.log(updatedArr); // Check the last date in the updated array
  return updatedArr;
}

scrapeAndCleanHistory();
