(function () {
    const form = document.getElementById('intake-form');
    if (!form) return;

    const successEl = document.getElementById('intake-success');
    const stepLabel = document.getElementById('intake-step-label');
    const progressFill = document.getElementById('intake-progress-fill');
    const viewport = form.querySelector('.intake-steps-viewport');
    const steps = [...form.querySelectorAll('.intake-step')];
    const prevBtn = document.getElementById('intake-prev');
    const nextBtn = document.getElementById('intake-next');
    const submitBtn = document.getElementById('intake-submit');
    const resetBtn = document.getElementById('intake-reset');
    const errorEl = document.getElementById('intake-error');
    const experienceField = document.getElementById('intake-experience-field');

    let currentStep = 1;
    const totalSteps = steps.length;

    function showError(message) {
        if (!errorEl) return;
        errorEl.textContent = message || '';
        errorEl.hidden = !message;
    }

    function clearFieldErrors() {
        form.querySelectorAll('.is-invalid').forEach((el) => {
            el.classList.remove('is-invalid');
        });
    }

    function updateExperienceVisibility() {
        const playedYes = form.querySelector('input[name="playedBefore"][value="ja"]');
        const show = playedYes && playedYes.checked;
        if (experienceField) {
            experienceField.hidden = !show;
            if (!show) {
                const textarea = experienceField.querySelector('textarea');
                if (textarea) textarea.value = '';
            }
        }
        updateViewportHeight();
    }

    function updateViewportHeight() {
        if (!viewport) return;
        const active = steps.find((step) => Number(step.dataset.step) === currentStep && !step.hidden);
        if (!active) return;
        viewport.style.minHeight = `${Math.max(active.offsetHeight, 280)}px`;
    }

    function updateUI() {
        steps.forEach((step) => {
            const stepNum = Number(step.dataset.step);
            step.hidden = stepNum !== currentStep;
            step.classList.remove('is-leaving');
        });

        if (stepLabel) stepLabel.textContent = `Stap ${currentStep} van ${totalSteps}`;
        if (progressFill) {
            progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
        }

        if (prevBtn) prevBtn.hidden = currentStep === 1;
        if (nextBtn) nextBtn.hidden = currentStep === totalSteps;
        if (submitBtn) submitBtn.hidden = currentStep !== totalSteps;

        showError('');
        clearFieldErrors();
        updateExperienceVisibility();
        updateViewportHeight();
    }

    function goToStep(next) {
        const current = steps.find((step) => Number(step.dataset.step) === currentStep);
        if (current) {
            current.classList.add('is-leaving');
            window.setTimeout(() => {
                currentStep = next;
                updateUI();
                const active = steps.find((step) => Number(step.dataset.step) === currentStep);
                if (active) active.classList.add('is-entering');
            }, 180);
        } else {
            currentStep = next;
            updateUI();
        }
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateStep(stepNumber) {
        clearFieldErrors();
        showError('');

        if (stepNumber === 1) {
            const nameInput = form.elements.namedItem('name');
            const emailInput = form.elements.namedItem('email');
            let valid = true;

            if (!nameInput || !String(nameInput.value).trim()) {
                nameInput?.closest('.intake-field')?.classList.add('is-invalid');
                valid = false;
            }
            if (!emailInput || !validateEmail(String(emailInput.value).trim())) {
                emailInput?.closest('.intake-field')?.classList.add('is-invalid');
                valid = false;
            }

            if (!valid) showError('Vul de verplichte velden correct in.');
            return valid;
        }

        if (stepNumber === 2) {
            const played = form.querySelector('input[name="playedBefore"]:checked');
            const interests = [...form.querySelectorAll('input[name="interests"]:checked')];
            let valid = true;

            const playedGroup = form.querySelector('fieldset.intake-choice-group');
            if (!played) {
                playedGroup?.classList.add('is-invalid');
                valid = false;
            }

            const interestGroup = [...form.querySelectorAll('fieldset.intake-choice-group')]
                .find((group) => group.querySelector('input[name="interests"]'));
            if (interests.length === 0) {
                interestGroup?.classList.add('is-invalid');
                valid = false;
            }

            if (!valid) showError('Maak je keuzes voordat je verdergaat.');
            return valid;
        }

        if (stepNumber === 3) {
            const evenings = [...form.querySelectorAll('input[name="evenings"]:checked')];
            const eveningGroup = [...form.querySelectorAll('fieldset.intake-choice-group')]
                .find((group) => group.querySelector('input[name="evenings"]'));

            if (evenings.length === 0) {
                eveningGroup?.classList.add('is-invalid');
                showError('Kies minstens één beschikbare avond.');
                return false;
            }
            return true;
        }

        return true;
    }

    function collectPayload() {
        const playedBefore = form.querySelector('input[name="playedBefore"]:checked')?.value || '';
        return {
            name: String(form.elements.namedItem('name')?.value || '').trim(),
            email: String(form.elements.namedItem('email')?.value || '').trim(),
            phone: String(form.elements.namedItem('phone')?.value || '').trim(),
            playedBefore,
            experience:
                playedBefore === 'ja'
                    ? String(form.elements.namedItem('experience')?.value || '').trim()
                    : '',
            interests: [...form.querySelectorAll('input[name="interests"]:checked')].map(
                (input) => input.value
            ),
            evenings: [...form.querySelectorAll('input[name="evenings"]:checked')].map(
                (input) => input.value
            ),
            remarks: String(form.elements.namedItem('remarks')?.value || '').trim(),
            website: String(form.elements.namedItem('website')?.value || '').trim()
        };
    }

    function showSuccess() {
        form.hidden = true;
        if (successEl) successEl.hidden = false;
    }

    function resetForm() {
        form.reset();
        currentStep = 1;
        form.hidden = false;
        if (successEl) successEl.hidden = true;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Intake versturen';
        }
        showError('');
        updateUI();
    }

    prevBtn?.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    });

    nextBtn?.addEventListener('click', () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) goToStep(currentStep + 1);
    });

    form.querySelectorAll('input[name="playedBefore"]').forEach((input) => {
        input.addEventListener('change', updateExperienceVisibility);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateStep(3)) return;

        const payload = collectPayload();
        showError('');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Bezig met versturen…';
        }

        try {
            const response = await fetch('/api/intake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data = null;
            try {
                data = await response.json();
            } catch (_) {
                data = null;
            }

            if (!response.ok || !data?.success) {
                throw new Error('send-failed');
            }

            showSuccess();
        } catch (_) {
            showError('Het versturen is niet gelukt. Probeer het opnieuw.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Intake versturen';
            }
        }
    });

    resetBtn?.addEventListener('click', resetForm);

    window.addEventListener('resize', updateViewportHeight);
    updateUI();
})();
