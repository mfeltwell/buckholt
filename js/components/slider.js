// Slider ________________________________________________________________________
document.addEventListener('DOMContentLoaded', () => {
    // Select all sliders on the page (in case there are multiple)
    const sliders = document.querySelectorAll('.form-slider');

    sliders.forEach(slider => {
        const container = slider.closest('.slider-container');
        const numberInput = container.querySelector('.form-control');

        // Function to update slider gradient fill
        const updateSliderBackground = () => {
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            const val = ((slider.value - min) / (max - min)) * 100;
            slider.style.backgroundImage = `linear-gradient(to right, var(--form-slider-filled-background) 0%, var(--form-slider-filled-background) ${val}%, transparent ${val}%, transparent 100%)`;
        };

        // Initial update (in case slider loads with a preset value)
        updateSliderBackground();

        // When the slider moves...
        slider.addEventListener('input', () => {
            updateSliderBackground();
            if (numberInput) {
                numberInput.value = slider.value;
            }
        });

        // If there's a number input, sync back when it's typed in
        if (numberInput) {
            numberInput.addEventListener('input', () => {
                slider.value = numberInput.value;
                updateSliderBackground();
            });
        }
    });
});