// Selectable tag ___________________________________________________________________
// Multi
$(document).ready(function () {
    $('.tag-selectable').each(function () {
        const $tag = $(this);
        const $checkbox = $tag.find('input[type="checkbox"]');

        if ($checkbox.prop('checked')) {
            $tag.addClass('active');
        } else {
            $tag.removeClass('active');
        }
    });

    $('.tag-selectable').has('input[type="checkbox"]').on('click', function (e) {
      // Prevent toggling the checkbox twice if the checkbox itself was clicked
        if ($(e.target).is('input[type="checkbox"]')) return;

        const $tag = $(this);
        const $checkbox = $tag.find('input[type="checkbox"]');

      // Toggle the checkbox state
        $checkbox.prop('checked', !$checkbox.prop('checked'));

      // Optional: add or remove a class to style the tag as selected
        $tag.toggleClass('active', $checkbox.prop('checked'));
    });
});

// Radio
$(document).ready(function () {
    $('.tag-selectable').has('input[type="radio"]').on('click', function (e) {
        const $tag = $(this);
        const $radio = $tag.find('input[type="radio"]');
        const groupName = $radio.attr('name');

        // Only trigger if the clicked tag is *not* already selected
        if (!$radio.prop('checked')) {
            // Uncheck all radios in the group and remove active class
            $(`input[name="${groupName}"]`).each(function () {
                $tag.closest('.tag-selectable').removeClass('active');
            });

            // Check the clicked radio and add active class
            $radio.prop('checked', true).trigger('change');
            $tag.addClass('active');
        }
    });

    $('.tag-selectable input[type="radio"]').on('change', function () {
        const $tag = $(this).closest('.tag');
        const groupName = $(this).attr('name');

        // Remove 'active' from all tags in the same radio group
        $(`.tag-selectable input[name="${groupName}"]`).closest('.tag').removeClass('active');

        // Add 'active' to the selected tag
        if (this.checked) {
            $(this).addClass('active');
        }
    });

    // Optional: sync the .active class if radios are pre-selected via HTML
    $('input[type="radio"]:checked').each(function () {
        $(this).closest('.tag-selectable').addClass('active');
    });
});


// Dismissible tag _______________________________________________________________
$(document).ready(function(){
    $('.tag .btn-close').click(function(){
        $(this).parent('.tag').remove();
    });
});