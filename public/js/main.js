$("#logout").on('click', function() {
    $.post('/logout', function(err, data) {
        if (err) return err;
    }).done(window.location.reload())
})