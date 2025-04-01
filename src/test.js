import { loadJSON } from "./tools/jsonLoader.js";

const filename = "data/0-500.json";
//output: [+, 0.45, 25 Feb, Fracture Case], [-, 0.36, 25 Mar, Prisma Case], [+ , 12.34, 25 Dec, CS20 Case]

const jsonData = await loadJSON(filename);
const rawData = jsonData.results_html;

// Step 2: Regex to extract details
const regex =
  /market_listing_gainorloss.*?>\s*([\+\-])\s*<\/div>.*?market_listing_price.*?S\$\s*([\d.]+).*?market_listing_listed_date.*?(\d+ \w+).*?market_listing_item_name.*?>(.*?)<\/span>/gs;

// Step 3: Extract matches
const matches = [...rawData.matchAll(regex)];

// Step 4: Format the output
const result = matches.map((match) => [
  match[1].trim(), // Ensure we remove unnecessary spaces or tabs
  parseFloat(match[2]),
  match[3].trim(),
  match[4].trim(),
]);

console.log(result.length); // Number of matches found
console.log(result[0]); // Number of matches found
console.log(result[499]); // Number of matches found
