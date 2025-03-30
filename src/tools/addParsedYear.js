// This tool adds the parsed year to the current date, based on current year and working backwards
/* 
input: [[ 10, 'Fracture Case', 'BUY', '0.74', '25 Feb' ],...]
output: [[ 10, 'Fracture Case', 'BUY', '0.74', 'YYYY-MM-DD' ],...]
*/

export function addParsedYear(currentArr, initialYear) {
  console.log("Adding parsed year to currentArr...");
  const updatedArr = structuredClone(currentArr); // Create a deep copy of currentArr

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

  let updatedYear = initialYear; // Initialize updatedYear with the initial year
  for (let i = 1; i < currentArr.length; i++) {
    if (currentArr[i - 1][4] === undefined) continue; // Skip if date is undefined
    if (currentArr[i][4] === undefined) continue; // Skip if date is undefined
    let prevDate = currentArr[i - 1][4].split(" ");
    let currDate = currentArr[i][4].split(" ");
    let prevMonth = prevDate[1];
    let currMonth = currDate[1];
    prevMonth = hash[prevMonth]; // Convert prevMonth name to number
    currMonth = hash[currMonth]; // Convert currMonth name to number
    if (currMonth > prevMonth) {
      updatedYear -= 1; // Decrease the year if the current month is less than the previous month
    }
    let currDay = currDate[0];
    updatedArr[i][4] = `${updatedYear}-${String(currMonth).padStart(
      2,
      "0"
    )}-${String(currDay).padStart(2, "0")}`; // Update the date with the new year
  }

  // Handle the first entry separately
  let firstDate = currentArr[0][4].split(" ");
  let firstMonth = firstDate[1];
  updatedArr[0][4] = `${initialYear}-${String(hash[firstMonth]).padStart(
    2,
    "0"
  )}-${String(firstDate[0]).padStart(2, "0")}`; // Set the first date to the current year and month
  return updatedArr;
}

// ================================ TEST CASE ================================
// const currentArr = [
//   [15, "Fracture Case", "BUY", "0.74", "3 Mar"], //3-25
//   [10, "Fracture Case", "BUY", "0.74", "25 Feb"], //2-25
//   [5, "Fracture Case", "SELL", "0.74", "26 Mar"], //3-24
//   [1, "Fracture Case", "BUY", "0.74", "27 Mar"], //3-24
//   [2, "Fracture Case", "SELL", "0.74", "28 Dec"], //12-23
//   [2, "Fracture Case", "SELL", "0.74", "23 Mar"], //3-23
// ];

// addParsedYear(currentArr, 2025);
