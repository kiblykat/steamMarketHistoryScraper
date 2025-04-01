# Steam Market History Scraper

## Overview

This project extracts and processes transaction history data from Steam Market JSON files. It parses item listings, cleans the data, consolidates duplicate transactions, and exports the results to an Excel file for further analysis.

## Features

- Parses Steam Market transaction data from multiple JSON files.
- Extracts key details: item name, price, transaction type (BUY/SELL), and date.
- Consolidates duplicate entries and calculates the quantity of identical transactions.
- Handles missing dates and converts transaction symbols (+/-) to BUY/SELL.
- Writes the cleaned and processed data to an Excel file.

## Installation

Ensure you have Node.js installed. Then, install the required dependencies:

`npm install`

## Usage

Fill up data folder with personal market transaction data, from the steam endpoint. Ensure you are signed in to steam, then type this into browser and save it into /data:
`https://steamcommunity.com/market/myhistory/render/?query=&start=0&count=500`
Run the script to extract and clean the data:

`node \src\historyScraper.js`

To populate a database (in my use case, mongoDB)
`node \src\populateTransactions.js`

## Project Structure

.<br>
├── data/                 # JSON files containing Steam Market history <br>
├── src/ <br>
├──├── tools/ <br>
├──├──├── addParsedYear.js  # Function to add the correct year to transaction dates <br>
├──├──├── excelWriter.js    # Function to write processed data to an Excel file <br>
├──├──├── jsonLoader.js     # Function to load JSON data from files <br>
├──├── historyScraper.js             # Main script for processing transaction history <br>
├── README.md             # Documentation <br>

## Functions

### scrapeAndCleanHistory()
- Calls getEntireHistory() to process all JSON files.
- Cleans missing dates and undefined items.
- Converts +/- to BUY/SELL.
- Removes duplicate transactions.
- Returns the final cleaned array.

### getEntireHistory(filenames)
- Iterates through all given JSON filenames and processes them using getConsolidatedArrays().
  
### getConsolidatedArrays(filename, entireHistoryArray)
- Loads the JSON file.
- Extracts transaction details using a regex pattern.
- Consolidates identical transactions by counting duplicates.
- Writes the cleaned data to an Excel file.

## Output Format

The final processed data follows this structure:
[quantity, BUY/SELL, price, date, itemName]

Example: </br>
[ [2, "BUY", 0.74, "2025-02-25", "Fracture Case"], </br>
[1, "SELL", 1.50, "2024-03-06", "Glove Case"], </br>
... ]

## Limitations

For some reason, I can't find any steam endpoint that includes years for the dates within steam market (eg "25 Feb"). I created a function addParsedYear to handle this. The limitation of this function is that the algorithm only works accurately if you frequently trade (i.e the longest duration between any previous trade is 11 months). It is not guaranteed to work properly otherwise.
If you found one, feel free to use your own instead and modify the code.