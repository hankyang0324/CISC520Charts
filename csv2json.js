let csvToJson = require('convert-csv-to-json');

let fileInputName1 = './src/assets/historicalPrices.csv'; 
let fileOutputName1 = './src/assets/historicalPrices.json';

let fileInputName2 = './src/assets/dailyTreasuryRates.csv'; 
let fileOutputName2 = './src/assets/dailyTreasuryRates.json';

csvToJson.fieldDelimiter(',').formatValueByType().generateJsonFileFromCsv(fileInputName1,fileOutputName1);
csvToJson.fieldDelimiter(',').formatValueByType().generateJsonFileFromCsv(fileInputName2,fileOutputName2);