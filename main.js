import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './styles.css';

const API_KEY = 'API_KEY'; // Ensure your API key is correct and secured

const initialForm = document.querySelector('#initial-form');
const promptInput = initialForm.querySelector('textarea[name="prompt"]');
const newPromptInput = initialForm.querySelector('input[name="new-prompt"]');
const output1 = document.querySelector('#output1');

initialForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    output1.textContent = 'Thinking...';

    try {
        const combinedPrompt = `${promptInput.value}\n\n${newPromptInput.value}`;

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });

        const contents = [
            {
                role: 'user',
                parts: [
                    { text: combinedPrompt }
                ]
            }
        ];

        const result = await model.generateContentStream({ contents });

        let buffer = [];
        const md = new MarkdownIt();
        for await (let response of result.stream) {
            buffer.push(response.text());
            output1.innerHTML = md.render(buffer.join(''));
        }
    } catch (error) {
        output1.innerHTML = `<hr>${error}`;
        console.error(error);
    }
});

maybeShowApiKeyBanner(API_KEY);
