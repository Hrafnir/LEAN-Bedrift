document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackTableBody = document.getElementById('feedbackTableBody');
    const feedbackTable = document.getElementById('feedbackTable');
    const noFeedbackMessage = document.getElementById('noFeedbackMessage');
    const successMessage = document.getElementById('successMessage');
    const clearDataButton = document.getElementById('clearDataButton');

    const STORAGE_KEY = 'workplaceSatisfactionEntries';

    // Funksjon for å hente og vise feedback
    function displayFeedback() {
        const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        feedbackTableBody.innerHTML = ''; // Tøm tabellen før vi fyller den på nytt

        if (entries.length === 0) {
            noFeedbackMessage.style.display = 'block';
            feedbackTable.style.display = 'none';
            return;
        }

        noFeedbackMessage.style.display = 'none';
        feedbackTable.style.display = 'table';

        // Sorter nyeste først (basert på lagret timestamp)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        entries.forEach(entry => {
            const row = feedbackTableBody.insertRow();
            row.insertCell().textContent = new Date(entry.timestamp).toLocaleString('nb-NO', { dateStyle: 'short', timeStyle: 'short'});
            row.insertCell().textContent = entry.employee_satisfaction_score;
            row.insertCell().textContent = entry.employee_comment_positive || '-';
            row.insertCell().textContent = entry.employee_comment_improvement || '-';
            row.insertCell().textContent = entry.customer_experience_score_by_employee || 'N/A';
            row.insertCell().textContent = entry.customer_experience_comment_by_employee || '-';
            row.insertCell().textContent = entry.session_type || '-';
        });
    }

    // Håndter skjemainnsending
    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Forhindre standard side-reload

        const newEntry = {
            timestamp: new Date().toISOString(),
            employee_satisfaction_score: document.getElementById('employee_satisfaction_score').value,
            employee_comment_positive: document.getElementById('employee_comment_positive').value,
            employee_comment_improvement: document.getElementById('employee_comment_improvement').value,
            customer_experience_score_by_employee: document.getElementById('customer_experience_score_by_employee').value,
            customer_experience_comment_by_employee: document.getElementById('customer_experience_comment_by_employee').value,
            session_type: document.getElementById('session_type').value
        };

        const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        entries.push(newEntry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

        displayFeedback();
        feedbackForm.reset(); // Tøm skjemaet
        
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000); // Skjul etter 3 sekunder
    });

    // Knapp for å slette all data
    clearDataButton.addEventListener('click', () => {
        if (confirm('Er du sikker på at du vil slette alle lagrede tilbakemeldinger? Denne handlingen kan ikke angres.')) {
            localStorage.removeItem(STORAGE_KEY);
            displayFeedback();
            alert('Alle tilbakemeldinger er slettet.');
        }
    });

    // Vis eksisterende feedback når siden lastes
    displayFeedback();
});
