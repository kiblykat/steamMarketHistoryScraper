import axios from "axios";
import { scrapeAndCleanHistory } from "./historyScraper.js";

// endpoint: http://localhost:5000/transactions/create

async function populateDatabase(req, res) {
  const updatedArr = await scrapeAndCleanHistory(); // [...,[ 1, 'Chroma 3 Case', 'SELL', '0.02', '2023-06-29' ]]
  for (let arr of updatedArr) {
    try {
      const response = await axios.post(
        "http://localhost:5000/transactions/create",
        {
          uid: "kiblykat",
          steamItem: arr[1], //this needs to be changed to itemName once the backend is updated
          price: arr[3],
          type: arr[2],
          quantity: arr[0],
          date: arr[4],
        }
      );
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  }
}

populateDatabase();
