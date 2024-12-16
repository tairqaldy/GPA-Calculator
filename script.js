document.addEventListener('DOMContentLoaded', () => {
    // GPA Calculator Elements
    const subjectsContainer = document.getElementById('subjects');
    const addSubjectButton = document.getElementById('add-subject');
    const calculateButton = document.getElementById('calculate-gpa');
    const useTemplateButton = document.getElementById('use-template');
    const saveTemplateButton = document.getElementById('save-template');
    const loadTemplateButton = document.getElementById('load-template');
    const exportPDFButton = document.getElementById('export-pdf');
    const gpaText = document.querySelector('.percentage');
    const gpaCircle = document.querySelector('.circle');

    // AI Assistant Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-prompt');
    const presetPrompt = document.getElementById('preset-prompt');
    const output = document.getElementById('output1');

    const systemRadios = document.querySelectorAll('input[name="system"]');

    // Function to add a subject row
    function addSubjectRow(subject = '', grade = '', credits = '') {
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = `
            <input type="text" placeholder="Название курса" value="${subject}" required>
            <input type="number" placeholder="Оценка" value="${grade}" min="0" max="100" required>
            <input type="number" placeholder="Кредиты" value="${credits}" min="0" required>
            <button type="button" class="delete-button">Удалить</button>
        `;
        subjectsContainer.appendChild(row);

        // Add event listener for delete button
        row.querySelector('.delete-button').addEventListener('click', () => {
            row.remove();
        });
    }

    // Function to use a template
    function useTemplate() {
        const selectedSystem = document.querySelector('input[name="system"]:checked')?.value;
        if (!selectedSystem) {
            alert("Пожалуйста, выберите систему оценки.");
            return;
        }

        const templates = {
            '4': [
                { subject: 'Математика', grade: 3.8, credits: 4 },
                { subject: 'Физика', grade: 3.5, credits: 3 },
                { subject: 'Химия', grade: 4.0, credits: 2 },
            ],
            '5': [
                { subject: 'Математика', grade: 4.5, credits: 4 },
                { subject: 'Физика', grade: 4.2, credits: 3 },
                { subject: 'Химия', grade: 5.0, credits: 2 },
            ],
            '100': [
                { subject: 'Математика', grade: 95, credits: 4 },
                { subject: 'Физика', grade: 88, credits: 3 },
                { subject: 'Химия', grade: 100, credits: 2 },
            ],
        };

        if (!templates[selectedSystem]) {
            alert("Выбранная система оценки не поддерживается.");
            return;
        }

        subjectsContainer.innerHTML = '';
        templates[selectedSystem].forEach(course => {
            addSubjectRow(course.subject, course.grade, course.credits);
        });
    }

    // Function to save a template
    function saveTemplate() {
        const rows = Array.from(subjectsContainer.querySelectorAll('.row')).map(row => {
            const inputs = row.querySelectorAll('input');
            return {
                subject: inputs[0].value,
                grade: inputs[1].value,
                credits: inputs[2].value,
            };
        });
        localStorage.setItem('gpaTemplate', JSON.stringify(rows));
        alert("Шаблон сохранен!");
    }

    // Function to load a template
    function loadTemplate() {
        const savedTemplate = localStorage.getItem('gpaTemplate');
        if (savedTemplate) {
            const courses = JSON.parse(savedTemplate);
            subjectsContainer.innerHTML = '';
            courses.forEach(course => {
                addSubjectRow(course.subject, course.grade, course.credits);
            });
            alert("Шаблон загружен!");
        } else {
            alert("Сохраненных шаблонов не найдено.");
        }
    }

    // Function to calculate GPA
    function calculateGPA() {
        const rows = subjectsContainer.querySelectorAll('.row');
        let totalPoints = 0;
        let totalCredits = 0;
        const system = document.querySelector('input[name="system"]:checked')?.value;

        if (!system) {
            alert("Пожалуйста, выберите систему оценки.");
            return;
        }

        for (let row of rows) {
            const inputs = row.querySelectorAll('input');
            const subject = inputs[0].value.trim();
            const grade = parseFloat(inputs[1].value);
            const credits = parseFloat(inputs[2].value);

            // Data validation
            if (!subject) {
                alert("Пожалуйста, введите название курса.");
                return;
            }
            if (isNaN(grade) || grade < 0) {
                alert(`Пожалуйста, введите корректную оценку для курса "${subject}".`);
                return;
            }
            if (isNaN(credits) || credits <= 0) {
                alert(`Пожалуйста, введите корректные кредиты для курса "${subject}".`);
                return;
            }

            totalPoints += grade * credits;
            totalCredits += credits;
        }

        if (totalCredits === 0) {
            alert("Кредиты не могут быть равны нулю.");
            return;
        }

        let gpa = 0;
        let max = 4;
        if (system === '4') {
            gpa = Math.min((totalPoints / totalCredits).toFixed(2), 4.0);
        } else if (system === '5') {
            gpa = Math.min((totalPoints / totalCredits).toFixed(2), 5.0);
            max = 5;
        } else {
            gpa = Math.min((totalPoints / totalCredits).toFixed(2), 100.0);
            max = 100;
        }

        displayGPA(gpa, max);
    }

    // Function to display GPA
    function displayGPA(gpa, max) {
        gpaText.textContent = gpa;

        const percentage = (gpa / max) * 100;
        gpaCircle.setAttribute('stroke-dasharray', `${percentage}, 100`);

        let color = '#f44336'; // Red
        if (percentage > 66) {
            color = '#ff9800'; // Orange
        }
        if (percentage > 80) {
            color = '#4caf50'; // Green
        }
        gpaCircle.setAttribute('stroke', color);
    }

    // Function to export GPA report to PDF
    async function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("GPA Отчет", 105, 20, null, null, 'center');

        doc.setFontSize(16);
        doc.text("Курсы:", 10, 40);

        const rows = subjectsContainer.querySelectorAll('.row');
        let y = 50;
        rows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const subject = inputs[0].value;
            const grade = inputs[1].value;
            const credits = inputs[2].value;
            doc.text(`${index + 1}. ${subject} - Оценка: ${grade}, Кредиты: ${credits}`, 10, y);
            y += 10;
        });

        const gpaValue = gpaText.textContent;
        doc.text(`Ваш GPA: ${gpaValue}`, 10, y + 10);

        doc.save('GPA_Report.pdf');
    }

    // AI Assistant Functionality
    async function sendMessage(message) {
        addMessage('user', message);
        userInput.value = '';

        try {
            // Replace the URL below with your Gemini API endpoint
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.message) {
                addMessage('ai', data.message);
                output.textContent = data.message;
            } else {
                addMessage('ai', 'Извините, произошла ошибка.');
                output.textContent = 'Извините, произошла ошибка.';
            }
        } catch (error) {
            console.error(error);
            addMessage('ai', 'Извините, не удалось связаться с сервером.');
            output.textContent = 'Извините, не удалось связаться с сервером.';
        }
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        const textElement = document.createElement('div');
        textElement.classList.add('text');
        textElement.textContent = text;
        messageElement.appendChild(textElement);
        document.querySelector('.prompt-section').appendChild(messageElement);
        // Scroll to the bottom
        document.querySelector('.prompt-section').scrollTop = document.querySelector('.prompt-section').scrollHeight;
    }

    // Handle form submission for AI Assistant
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        const presetMessage = presetPrompt.value.trim();
        const combinedMessage = presetMessage + ' ' + userMessage;

        if (userMessage) {
            sendMessage(combinedMessage);
        }
    });

    // Initialize with one subject row
    addSubjectRow();

    // Event Listeners
    addSubjectButton.addEventListener('click', addSubjectRow);
    calculateButton.addEventListener('click', calculateGPA);
    useTemplateButton.addEventListener('click', useTemplate);
    saveTemplateButton.addEventListener('click', saveTemplate);
    loadTemplateButton.addEventListener('click', loadTemplate);
    exportPDFButton.addEventListener('click', exportToPDF);
});
