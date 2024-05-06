import fs from 'fs';
import path from 'path';

const folderPath = './data/cities_metadata'; // Replace with the actual folder path
const outputFilePath = './data/cities.json'; // Replace with the desired output file path

const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

const jsonArray = jsonFiles.map(file => {
    const filePath = path.join(folderPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
});

const outputContent = JSON.stringify(jsonArray);

fs.writeFileSync(outputFilePath, outputContent, 'utf-8');

console.log('JSON array created successfully!');