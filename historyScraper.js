import { readFile } from "fs/promises";
import ExcelJS from "exceljs";

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
        // If the entry is the same, increment the count of the previous one
        entireHistoryArray[entireHistoryArrayCounter][0] += 1;
      } else {
        // Otherwise, add the new entry to the array
        entireHistoryArray.push([
          1,
          steamItemsArray[i],
          positiveNegativeArray[i],
          priceArray[i],
          dateArray[i],
        ]);
        entireHistoryArrayCounter++;
      }
    }
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  worksheet.addRows(entireHistoryArray);

  // Writing to a file
  workbook.xlsx
    .writeFile("output.xlsx")
    .then(() => {
      console.log("File is written");
    })
    .catch((err) => {
      console.error(err);
    });

  // console.log(entireHistoryArray);
};

async function getEntireHistory(filenames) {
  for (let filename of filenames) {
    await getConsolidatedArrays(filename, entireHistoryArray);
  }
  // console.log(entireHistoryArray.length);
}

//current structure: [steamItem, [+-], price]
const countSteamItemsProfit = async () => {
  await getEntireHistory(filenames);
  let hash = {};
  console.log("entireHistoryArray: ", entireHistoryArray);

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

await countSteamItemsProfit();
