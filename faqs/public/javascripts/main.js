$(document)
    .on('click', '#newCategoryFormSubmit', function (e) {
        if ($('#title').val().length == 0) {
            $('#erralert').show();
            $('#errortxt').html('Invalid Category Name');
            e.preventDefault(); //prevent the default action
        } else if ($('input[name$="icon"]').val().length == 0) {
            $('#erralert').show();
            $('#errortxt').html('You must select a valid icon');

            e.preventDefault(); //prevent the default action
        }
    });