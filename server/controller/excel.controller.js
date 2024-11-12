import xlsx from 'xlsx';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { quizes, quizQuestion } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const addQuestion = (req, res) => {
    try {
        const filePath = req.file.path;
        const quizId = String(req.body.quizId);
        console.log(quizId);

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        const questions = data.map(row => ({
            question: row.Question,
            options: [row.Option1, row.Option2, row.Option3, row.Option4],
            answer: row.Answer
        }));

        let existingData = {};
        try {
            existingData = JSON.parse(fs.readFileSync(__dirname + '/../questions.json', 'utf8'));
        } catch (error) {
            console.log('No existing data found, creating new file.');
        }

        existingData[quizId] = questions;

        fs.writeFileSync(__dirname + '/../questions.json', JSON.stringify(existingData, null, 2));
        quizQuestion.push({ [quizId]: questions });

        existingData[quizId] = questions;

        fs.writeFileSync(__dirname + '/../questions.json', JSON.stringify(existingData, null, 2));
        res.status(200).send({ message: 'File uploaded and data extracted successfully', data: { questions: questions } });
    }
    catch (error) {
        res.status(500).send({ message: 'Error processing file', error });
    }
};

export const getQuestions = (req, res) => {
    try {
        const quizId = String(req.query.quizId);
        const questionsData = JSON.parse(fs.readFileSync(__dirname + '/../questions.json', 'utf8'));

        if (!questionsData[quizId]) {
            return res.status(404).send({ message: 'quiz not found' });
        }

        res.status(200).send({ questions: questionsData[quizId] });
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving questions', error });
    }
};
