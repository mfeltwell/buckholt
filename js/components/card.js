const $ = window.jQuery;

// Selectable card __________________________________________________________________
// Checkbox
$(document).ready(function () {
    $('.card-selectable').each(function () {
        const $card = $(this);
        const $checkbox = $card.find('input[type="checkbox"]');

        if ($checkbox.prop('checked')) {
            $card.addClass('active');
        } else {
            $card.removeClass('active');
        }
    });

    $('.card-selectable input[type="checkbox"]').on('change', function () {
        const $checkbox = $(this);
        const $card = $checkbox.closest('.card-selectable');
        $card.toggleClass('active', $checkbox.prop('checked'));
    });

    $('.card-selectable').has('input[type="checkbox"]').on('click', function (e) {
      // Prevent toggling the checkbox twice if the checkbox itself was clicked
        if ($(e.target).is('input[type="checkbox"]')) return;

        const $card = $(this);
        const $checkbox = $card.find('input[type="checkbox"]');

      // Toggle the checkbox state
        $checkbox.prop('checked', !$checkbox.prop('checked'));

      // Optional: add or remove a class to style the card as selected
        $card.toggleClass('active', $checkbox.prop('checked'));
    });
});

// Radio
$(document).ready(function () {
    $('.card-selectable').has('input[type="radio"]').on('click', function (e) {
        const $radio = $(this).find('input[type="radio"]');
        const groupName = $radio.attr('name');

        // Only trigger if the clicked card is *not* already selected
        if (!$radio.prop('checked')) {
            // Uncheck all radios in the group and remove active class
            $(`input[name="${groupName}"]`).each(function () {
                $(this).closest('.card-selectable').removeClass('active');
            });

            // Check the clicked radio and add active class
            $radio.prop('checked', true).trigger('change');
            $(this).addClass('active');
        }
    });

    $('.card-selectable input[type="radio"]').on('change', function () {
        const $card = $(this).closest('.card');
        const groupName = $(this).attr('name');

        // Remove 'active' from all cards in the same radio group
        $(`.card-selectable input[name="${groupName}"]`).closest('.card').removeClass('active');

        // Add 'active' to the selected card
        if (this.checked) {
            $card.addClass('active');
        }
    });

    // Optional: sync the .active class if radios are pre-selected via HTML
    $('input[type="radio"]:checked').each(function () {
        $(this).closest('.card-selectable').addClass('active');
    });
});