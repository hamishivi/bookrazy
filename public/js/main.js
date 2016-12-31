$("#logout").on('click', function() {
    $.post('/logout', function(err, data) {
        if (err) return err;
    }).done(window.location.reload());
});

$("#city").on('click', function() {
    var city = $("#cityInput").val();
    console.log(city)
    window.location.href = "/addCity/" + city;
});

$("#state").on('click', function() {
    var state = $("#stateInput").val();
    window.location.href = "/addState/" + state;
});

$("#fullname").on('click', function() {
    var name = $("#fullnameInput").val();
    window.location.href = "/addFullName/" + name;
});