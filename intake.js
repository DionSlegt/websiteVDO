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
    const privacyNote = document.getElementById('intake-privacy-note');
    const experienceField = document.getElementById('intake-experience-field');
    const selfFields = document.getElementById('intake-self-fields');
    const childFields = document.getElementById('intake-child-fields');

    const CHILD_AGE_MIN = 1;
    const CHILD_AGE_MAX = 17;

    let currentStep = 1;
    const totalSteps = steps.length;

    function showError(message) {
        if (!errorEl) return;
        errorEl.textContent = message || '';
        errorEl.hidden = !message;
    }

    function setFieldError(inputOrGroup, errorId, message) {
        const errorNode = document.getElementById(errorId);
        if (errorNode) {
            errorNode.textContent = message || '';
            errorNode.hidden = !message;
        }

        if (!inputOrGroup) return;

        if (inputOrGroup.classList?.contains('intake-choice-group')) {
            inputOrGroup.classList.toggle('is-invalid', Boolean(message));
            inputOrGroup.setAttribute('aria-invalid', message ? 'true' : 'false');
            return;
        }

        const field = inputOrGroup.closest('.intake-field');
        field?.classList.toggle('is-invalid', Boolean(message));
        inputOrGroup.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function clearFieldErrors() {
        form.querySelectorAll('.is-invalid').forEach((el) => {
            el.classList.remove('is-invalid');
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
            el.setAttribute('aria-invalid', 'false');
        });
        form.querySelectorAll('.intake-field-error').forEach((el) => {
            el.textContent = '';
            el.hidden = true;
        });
    }

    function getIntakeFor() {
        return form.querySelector('input[name="intakeFor"]:checked')?.value || '';
    }

    function clearGroupInputs(group) {
        if (!group) return;
        group.querySelectorAll('input, textarea').forEach((input) => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.removeAttribute('required');
            input.removeAttribute('aria-required');
        });
    }

    function setRequired(input, required) {
        if (!input) return;
        if (required) {
            input.setAttribute('required', '');
            input.setAttribute('aria-required', 'true');
        } else {
            input.removeAttribute('required');
            input.removeAttribute('aria-required');
        }
    }

    function updateAudienceVisibility() {
        const intakeFor = getIntakeFor();
        const showSelf = intakeFor === 'self';
        const showChild = intakeFor === 'child';

        if (selfFields) {
            selfFields.hidden = !showSelf;
            setRequired(form.elements.namedItem('name'), showSelf);
            setRequired(form.elements.namedItem('email'), showSelf);
        }

        if (childFields) {
            childFields.hidden = !showChild;
            setRequired(form.elements.namedItem('parentName'), showChild);
            setRequired(form.elements.namedItem('parentEmail'), showChild);
            setRequired(form.elements.namedItem('childAge'), showChild);
        }

        updateViewportHeight();
    }

    function onIntakeForChange() {
        const intakeFor = getIntakeFor();
        if (intakeFor === 'self') clearGroupInputs(childFields);
        if (intakeFor === 'child') clearGroupInputs(selfFields);
        clearFieldErrors();
        showError('');
        updateAudienceVisibility();
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
        if (privacyNote) privacyNote.hidden = currentStep !== totalSteps;

        showError('');
        clearFieldErrors();
        updateAudienceVisibility();
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

    function parseChildAge(value) {
        const trimmed = String(value || '').trim();
        if (!/^\d{1,2}$/.test(trimmed)) return null;
        const age = Number(trimmed);
        if (!Number.isInteger(age) || age < CHILD_AGE_MIN || age > CHILD_AGE_MAX) return null;
        return age;
    }

    function validateStep(stepNumber) {
        clearFieldErrors();
        showError('');

        if (stepNumber === 1) {
            const intakeFor = getIntakeFor();
            const forGroup = document.getElementById('intake-for-group');
            const messages = [];
            let valid = true;

            if (intakeFor !== 'self' && intakeFor !== 'child') {
                setFieldError(forGroup, 'intake-for-error', 'Geef aan voor wie je deze intake invult.');
                messages.push('Geef aan voor wie je deze intake invult.');
                valid = false;
                showError(messages.join(' '));
                return false;
            }

            if (intakeFor === 'self') {
                const nameInput = form.elements.namedItem('name');
                const emailInput = form.elements.namedItem('email');

                if (!nameInput || !String(nameInput.value).trim()) {
                    setFieldError(nameInput, 'intake-name-error', 'Vul je naam in.');
                    messages.push('Vul je naam in.');
                    valid = false;
                }

                const emailValue = String(emailInput?.value || '').trim();
                if (!emailValue) {
                    setFieldError(emailInput, 'intake-email-error', 'Vul een geldig e-mailadres in.');
                    messages.push('Vul een geldig e-mailadres in.');
                    valid = false;
                } else if (!validateEmail(emailValue)) {
                    setFieldError(emailInput, 'intake-email-error', 'Vul een geldig e-mailadres in.');
                    messages.push('Vul een geldig e-mailadres in.');
                    valid = false;
                }
            } else {
                const parentNameInput = form.elements.namedItem('parentName');
                const parentEmailInput = form.elements.namedItem('parentEmail');
                const childAgeInput = form.elements.namedItem('childAge');

                if (!parentNameInput || !String(parentNameInput.value).trim()) {
                    setFieldError(parentNameInput, 'intake-parent-name-error', 'Vul de naam van de ouder/verzorger in.');
                    messages.push('Vul de naam van de ouder/verzorger in.');
                    valid = false;
                }

                const parentEmailValue = String(parentEmailInput?.value || '').trim();
                if (!parentEmailValue) {
                    setFieldError(parentEmailInput, 'intake-parent-email-error', 'Vul een geldig e-mailadres in.');
                    messages.push('Vul een geldig e-mailadres in.');
                    valid = false;
                } else if (!validateEmail(parentEmailValue)) {
                    setFieldError(parentEmailInput, 'intake-parent-email-error', 'Vul een geldig e-mailadres in.');
                    messages.push('Vul een geldig e-mailadres in.');
                    valid = false;
                }

                if (parseChildAge(childAgeInput?.value) === null) {
                    setFieldError(
                        childAgeInput,
                        'intake-child-age-error',
                        `Vul een geldige leeftijd in (${CHILD_AGE_MIN}–${CHILD_AGE_MAX}).`
                    );
                    messages.push(`Vul een geldige leeftijd in (${CHILD_AGE_MIN}–${CHILD_AGE_MAX}).`);
                    valid = false;
                }
            }

            if (!valid) showError(messages.join(' '));
            return valid;
        }

        if (stepNumber === 2) {
            const played = form.querySelector('input[name="playedBefore"]:checked');
            const interests = [...form.querySelectorAll('input[name="interests"]:checked')];
            const playedGroup = document.getElementById('intake-played-group');
            const interestGroup = document.getElementById('intake-interests-group');
            const messages = [];
            let valid = true;

            if (!played) {
                setFieldError(playedGroup, 'intake-played-error', 'Geef aan of je eerder hebt getafeltennist.');
                messages.push('Geef aan of je eerder hebt getafeltennist.');
                valid = false;
            }

            if (interests.length === 0) {
                setFieldError(interestGroup, 'intake-interests-error', 'Kies minstens één interesse.');
                messages.push('Kies minstens één interesse.');
                valid = false;
            }

            if (!valid) showError(messages.join(' '));
            return valid;
        }

        if (stepNumber === 3) {
            const evenings = [...form.querySelectorAll('input[name="evenings"]:checked')];
            const eveningGroup = document.getElementById('intake-evenings-group');

            if (evenings.length === 0) {
                setFieldError(eveningGroup, 'intake-evenings-error', 'Kies minstens één beschikbare avond.');
                showError('Kies minstens één beschikbare avond.');
                return false;
            }
            return true;
        }

        return true;
    }

    function collectPayload() {
        const intakeFor = getIntakeFor();
        const playedBefore = form.querySelector('input[name="playedBefore"]:checked')?.value || '';
        const shared = {
            intakeFor,
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

        if (intakeFor === 'child') {
            return {
                ...shared,
                parentName: String(form.elements.namedItem('parentName')?.value || '').trim(),
                parentEmail: String(form.elements.namedItem('parentEmail')?.value || '').trim(),
                parentPhone: String(form.elements.namedItem('parentPhone')?.value || '').trim(),
                childName: String(form.elements.namedItem('childName')?.value || '').trim(),
                childAge: parseChildAge(form.elements.namedItem('childAge')?.value)
            };
        }

        return {
            ...shared,
            name: String(form.elements.namedItem('name')?.value || '').trim(),
            email: String(form.elements.namedItem('email')?.value || '').trim(),
            phone: String(form.elements.namedItem('phone')?.value || '').trim()
        };
    }

    function showSuccess() {
        form.reset();
        clearFieldErrors();
        showError('');
        currentStep = 1;
        if (experienceField) experienceField.hidden = true;
        if (selfFields) selfFields.hidden = true;
        if (childFields) childFields.hidden = true;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Intake versturen';
        }
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
        clearFieldErrors();
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

    form.querySelectorAll('input[name="intakeFor"]').forEach((input) => {
        input.addEventListener('change', onIntakeForChange);
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
