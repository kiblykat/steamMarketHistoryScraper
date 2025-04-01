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
}

// Get consolidated arrays of steamItems, price, and +/-, updates entireHistoryArray, mutates entireHistoryArray -> returns void
const getConsolidatedArrays = async (filename, entireHistoryArray) => {
  const jsonData = await loadJSON(filename);

  let rawData = jsonData.results_html;

  // Step 2: Regex to extract details
  const regex =
    /market_listing_gainorloss.*?>\s*([\+\-])\s*<\/div>.*?market_listing_price.*?S\$\s*([\d.]+).*?market_listing_listed_date.*?(\d+ \w+).*?market_listing_item_name\".*?>(.*?)<\/span>/gs;

  const matches = [...rawData.matchAll(regex)];

  // Step 4: Format the output
  const result = matches.map((match) => [
    match[1].trim(), // +/-
    parseFloat(match[2]), // Price
    match[3].trim(), // Date
    match[4].trim(), // Item Name
  ]);

  console.log(result.length); // Number of matches found

  //consolidatedArray: [quantity, itemName, BUY/SELL, price, date][]

  for (let i = 0; i < result.length; i++) {
    if (i === 0) {
      // Initialize the first entry
      entireHistoryArray.push([
        1,
        ...result[i], // Item Name
      ]);
    } else {
      // Check if the current entry is the same as the previous one
      if (
        result[i][0] === result[i - 1][0] &&
        result[i][1] === result[i - 1][1] &&
        result[i][2] === result[i - 1][2] &&
        result[i][3] === result[i - 1][3]
      ) {
        // If the entry is the same, increment the quantity of the last element input one
        entireHistoryArray[entireHistoryArray.length - 1][0] += 1;
      } else {
        // Otherwise, add the new entry to the array
        entireHistoryArray.push([
          1,
          ...result[i], // Item Name
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
    arr[1] = arr[1] === "+" ? "BUY" : "SELL"; // Convert + and - to BUY and SELL
  }

  // Remove duplicates based on the first three elements (quantity, itemName, BUY/SELL)
  console.log(updatedArr.slice(0, 100));
  return updatedArr;
}
