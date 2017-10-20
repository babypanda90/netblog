// send comment
$("#send").on("click", function () {
    if ($("#context").val() != "") {
        $.ajax({
            type: "POST",
            url: "/api/comment/post",
            data: {
                cont_id: $("#cont_id").val(),
                context: $("#context").val()
            },
            success: function(responseData) {
                $("#context").val("");
                renderComments(responseData.content.comments.reverse());
            }
        });
    }
    else {

    }
});

// get comments
$.ajax({
    type: "GET",
    url: "/api/comment/",
    data: {
        cont_id: $("#cont_id").val()
    },
    success: function(responseData) {
        $("#context").val("");
        renderComments(responseData.content.comments.reverse());
    }

})

function renderComments(comments) {
    var ctx = "";
    for (var i = 0; i < comments.length; i++) {
        ctx += '<div class="message"> \
            <div class="sender"><p>'+ comments[i].username + " " + formatDate(comments[i].postTime) +'</p></div> \
            <div class="context"><p>'+ comments[i].context +'</p></div> \
        </div>';
    }
    $("#messagesBox").html(ctx);

    var info = comments.length + " " + "comments";
    $("#info").text(info);
};

function formatDate(d) {
    var fd = new Date(d);
    return fd.getFullYear() + "-" + (fd.getMonth() + 1) + "-" + fd.getDate() + " " + 
    fd.getHours() + ":" + fd.getMinutes() + ":" +fd.getSeconds();

}
