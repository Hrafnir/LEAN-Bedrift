document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackTableBody = document.getElementById('feedbackTableBody');
    const feedbackTable = document.getElementById('feedbackTable');
    const noFeedbackMessage = document.getElementById('noFeedbackMessage');
    const successToast = document.getElementById('successMessage'); // Endret ID for klarhet
    const clearDataButton = document.getElementById('clearDataButton');

    const STORAGE_KEY = 'workplaceSatisfactionEntries_v2'; // Ny nøkkel for å unngå konflikt med gammel data

    // --- Stjerne Rating Logikk ---
    function setupStarRating(starContainerId, hiddenInputId) {
        const starsContainer = document.getElementById(starContainerId);
        if (!starsContainer) return; // Hvis elementet ikke finnes (f.eks. customer rating ikke er implementert)
        
        const stars = starsContainer.querySelectorAll('.star');
        const hiddenInput = document.getElementById(hiddenInputId);

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = star.getAttribute('data-value');
                hiddenInput.value = value;
                stars.forEach(s => {
                    s.classList.remove('selected');
                    s.querySelector('i').classList.remove('fas'); // Solid stjerne
                    s.querySelector('i').classList.add('far');   // Outline stjerne
                });
                for (let i = 0; i < value; i++) {
                    stars[i].classList.add('selected');
                    stars[i].querySelector('i').classList.remove('far');
                    stars[i].querySelector('i').classList.add('fas');
                }
            });

            star.addEventListener('mouseover', () => {
                const value = star.getAttribute('data-value');
                stars.forEach(s => {
                    s.classList.remove('hovered');
                    if (!s.classList.contains('selected')) { // Ikke endre fylte stjerner som er selected
                        s.querySelector('i').classList.remove('fas');
                        s.querySelector('i').classList.add('far');
                    }
                });
                for (let i = 0; i < value; i++) {
                    stars[i].classList.add('hovered');
                     if (!stars[i].classList.contains('selected')) {
                        stars[i].querySelector('i').classList.remove('far');
                        stars[i].querySelector('i').classList.add('fas');
                     }
                }
            });

            star.addEventListener('mouseout', () => {
                stars.forEach(s => {
                    s.classList.remove('hovered');
                    if (!s.classList.contains('selected')) { // Tilbakestill til outline hvis ikke selected
                        s.querySelector('i').classList.remove('fas');
                        s.querySelector('i').classList.add('far');
                    }
                });
            });
        });
        
        // Reset stjerner når skjemaet nullstilles
        feedbackForm.addEventListener('reset', () => {
            setTimeout(() => { // Trenger en liten forsinkelse for at hiddenInput skal nullstilles
                hiddenInput.value = '';
                 stars.forEach(s => {
                    s.classList.remove('selected');
                    s.classList.remove('hovered');
                    s.querySelector('i').classList.remove('fas');
                    s.querySelector('i').classList.add('far');
                });
            }, 0);
        });
    }

    setupStarRating('employee_rating_stars', 'employee_satisfaction_score');
    setupStarRating('customer_rating_stars', 'customer_experience_score_by_employee');
    // --- Slutt Stjerne Rating Logikk ---

    function displayFeedback() {
        const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        feedbackTableBody.innerHTML = ''; 

        if (entries.length === 0) {
            noFeedbackMessage.style.display = 'block';
            feedbackTable.style.display = 'none';
            return;
        }

        noFeedbackMessage.style.display = 'none';
        feedbackTable.style.display = 'table';

        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        entries.forEach(entry => {
            const row = feedbackTableBody.insertRow();
            row.insertCell().textContent = new Date(entry.timestamp).toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
            
            const employeeScoreCell = row.insertCell();
            employeeScoreCell.innerHTML = generateStarDisplay(entry.employee_satisfaction_score);
            
            row.insertCell().textContent = entry.employee_comment_positive || '-';
            row.insertCell().textContent = entry.employee_comment_improvement || '-';
            
            const customerScoreCell = row.insertCell();
            customerScoreCell.innerHTML = entry.customer_experience_score_by_employee ? generateStarDisplay(entry.customer_experience_score_by_employee) : 'N/A';

            row.insertCell().textContent = entry.customer_experience_comment_by_employee || '-';
            row.insertCell().textContent = entry.session_type || '-';
        });
    }
    
    // Hjelpefunksjon for å vise stjerner i tabellen
    function generateStarDisplay(score) {
        if (!score || score === '') return 'N/A';
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < score) {
                starsHtml += '<i class="fas fa-star" style="color: var(--star-color);"></i>';
            } else {
                starsHtml += '<i class="far fa-star" style="color: #ccc;"></i>';
            }
        }
        return starsHtml;
    }


    feedbackForm.addEventListener('submit', (event) => {
        event.preventDefault(); 

        // Sjekk om rating er valgt (siden hidden input er 'required', men vi må sjekke om den har verdi)
        if (!document.getElementById('employee_satisfaction_score').value) {
            alert('Vennligst velg en score for din arbeidsøkt.');
            // Du kan legge til mer sofistikert feilhåndtering her, f.eks. markere stjernefeltet
            document.getElementById('employee_rating_stars').scrollIntoView({behavior: 'smooth', block: 'center'});
            return;
        }

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
        feedbackForm.reset(); 
        
        // Vis toast-melding
        successToast.style.display = 'flex'; // Eller 'block' avhengig av styling
        successToast.classList.add('show');
        setTimeout(() => {
            successToast.classList.remove('show');
            // Vent til animasjonen er ferdig før display:none
            setTimeout(() => {
                 successToast.style.display = 'none';
            }, 300); // Matcher transition duration
        }, 3000);

        // Scroll til toppen for å se meldingen og et tomt skjema
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    clearDataButton.addEventListener('click', () => {
        if (confirm('Er du sikker på at du vil slette alle lagrede tilbakemeldinger? Denne handlingen kan ikke angres.')) {
            localStorage.removeItem(STORAGE_KEY);
            displayFeedback();
            // Kan legge til en liten bekreftelses-toast her også hvis ønskelig
            alert('Alle tilbakemeldinger er slettet.');
        }
    });

    displayFeedback();
});
