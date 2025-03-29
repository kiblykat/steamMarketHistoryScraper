import ExcelJS from "exceljs";

export function writeToExcel(array){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
  
    worksheet.addRows(array);
  
    // Writing to a file
    workbook.xlsx
      .writeFile("output.xlsx")
      .then(() => {
        console.log("File is written");
      })
      .catch((err) => {
        console.error(err);
      });
}