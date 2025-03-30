// This tool adds the parsed year to the current date, based on current year and working backwards
/* 
input: [[ 10, 'Fracture Case', 'BUY', '0.74', '25 Feb' ],...]
output: [[ 10, 'Fracture Case', 'BUY', '0.74', 'YYYY-MM-DD' ],...]
*/

export function addParsedYear(array, currYear) {
  console.log("Adding parsed year to array...");
  currYear = 2025;
  const hash = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  for (let i = 1; i < array.length; i++) {
    if (array[i - 1][4] === undefined) continue; // Skip if date is undefined
    if (array[i][4] === undefined) continue; // Skip if date is undefined
    let prevDate = array[i - 1][4].split(" ");
    let currDate = array[i][4].split(" ");
    let prevMonth = prevDate[1];
    let currMonth = currDate[1];
    prevMonth = hash[prevMonth]; // Convert prevMonth name to number
    currMonth = hash[currMonth]; // Convert currMonth name to number
    if (currMonth <= prevMonth) {
      currYear -= 1; // Decrease the year if the current month is less than the previous month
    }
    let currDay = currDate[0];
    array[i][4] = `${currYear}-${String(currMonth).padStart(
      2,
      "0"
    )}-${currDay}`;
  }

  // Handle the first entry separately
  let firstDate = array[0][4].split(" ");
  let firstMonth = firstDate[1];
  array[0][4] = `${currYear}-${String(hash[firstMonth]).padStart(2, "0")}-${
    firstDate[0]
  }`; // Set the first date to the current year and month
  console.log(array);
}

addParsedYear(
  [
    [10, "Fracture Case", "BUY", "0.74", "25 Feb"],
    [5, "Fracture Case", "SELL", "0.74", "26 Feb"],
    [1, "Fracture Case", "BUY", "0.74", "27 Mar"],
    [2, "Fracture Case", "SELL", "0.74", "28 Dec"],
    [2, "Fracture Case", "SELL", "0.74", "28 Dec"],
  ],
  2025
);
