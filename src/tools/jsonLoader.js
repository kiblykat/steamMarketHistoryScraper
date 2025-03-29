import { readFile } from "fs/promises";

export const loadJSON = async (filename) => {
    try {
      const jsonString = await readFile(filename, "utf8");
      const jsonData = await JSON.parse(jsonString);
      return jsonData;
    } catch (err) {
      console.error("Error reading JSON file:", err);
    }
  };