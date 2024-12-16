// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// Импортируйте SDK Gemini, если он доступен
// const Gemini = require('gemini-sdk'); // Пример импорта

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Инициализируйте клиент Gemini API
// const gemini = new Gemini({ apiKey: 'API' }); // Пример инициализации

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    try {
        // Замените следующий код на фактический вызов API Gemini
        // const response = await gemini.sendMessage(message);
        // const reply = response.reply;

        // Плейсхолдерный ответ, замените его на реальный ответ от Gemini
        const reply = `Gemini ответил на ваш вопрос: "${message}"`;

        res.json({ message: reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Произошла ошибка при обработке вашего запроса.' });
    }
});

app.listen(port, () => {
    console.log(`Сервер работает на http://localhost:${port}`);
});
