import xlsx from 'xlsx';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { games } from '../index.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addQuestion = (req, res) => {
    try {
        const filePath = req.file.path;
        const gameId = req.body.gameId;
        console.log(gameId);

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const questions = data.map(row => ({
            question: row.Question,
            options: [row.Option1, row.Option2, row.Option3, row.Option4],
            answer: row.Answer
        }));
        const jsonPath = __dirname + '/../questions.json';
        games.set("gameId", gameId);
        games.set("questions", questions);
        console.log(games);
        fs.writeFileSync(jsonPath, JSON.stringify({ gameId: gameId, questions: questions }, null, 2));
        res.status(200).send({ message: 'File uploaded and data extracted successfully', data: { gameId: games.get("gameId"), questions: games.get("questions") } });
    }
    catch (error) {
        res.status(500).send({ message: 'Error processing file', error });
    }
};
