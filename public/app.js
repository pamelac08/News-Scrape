$(document).ready(function() { 


$(document).on("click", "#saveButton", function() {
    event.preventDefault();
  
    var id = $(this).attr("data-id");
    console.log("id: ", id);
    
    $.ajax({
      type: "PUT",
      url: "/saveArticle/" + id
    }).then(function() {
      window.location.href = window.location.href;
    });
  });

  

$(document).on("click", "#deleteSaved", function() {
    event.preventDefault();
  
    var id = $(this).attr("data-id");
    console.log("id: ", id);
    
    $.ajax({
      type: "PUT",
      url: "/removeArticle/" + id
    }).then(function() {
        window.location.href = window.location.href;
    });
  });


// delete comment from comments collection
$(document).on("click", ".delete-comment", function() {
    event.preventDefault();
  
    var commentID = $(this).attr("data-comment-id");
    console.log("id: ", commentID);
    
    $.ajax({
      type: "GET",
      url: "/deleteNote/" + commentID
    }).then(function() {
        window.location.reload();

    });
});

// delete comment from corresponding article collection
$(document).on("click", ".delete-comment", function() {
    event.preventDefault();
  
    var commentToDelete = {
        comment: $(this).attr("data-comment-id")
    }

    var articleID = $(this).attr("data-article-id");
    console.log("id: ", articleID);
    
    $.ajax({
      type: "POST",
      url: "/deleteNote/" + articleID,
      data: commentToDelete
    }).then(function() {
        window.location.reload();
    });
  });


  




  function displayComments(element, articleID) {

    $("#modal-title").empty();

    var modalTitle = $("<p>").text("Comments for Article: " + articleID);

    $("#modal-title").append(modalTitle);


    var title = $("<p>").text(element);
    
    var deleteButton = $("<button>")
        .attr("data-comment-id", element)
        .attr("data-article-id", articleID)
        .addClass("delete-comment")
        .text("Delete Comment")
    
    var newComment = $("<div>").append(title, deleteButton)

    $("#savedComments").append(newComment);
  }




  function openModal(articleID) {
    //   console.log("articleID inside openModal function: ", articleID);
      $("#saveComment").attr("data-id", articleID);
    $.ajax({
        method: "GET",
        url: "/articles/" + articleID
    }).then(function(data) {
        // console.log("open modal data: " + JSON.stringify(data));

        $.each(data.comment, function(i, eachComment) {
            displayComments(eachComment, articleID)
        })
       
        $("#commentsModal").modal("show");
    });
  }


$(document).on("click", "#openComments", function() {

    var thisId = $(this).attr("data-id");
    // console.log("thisID when opening modal: ", thisId);

    $("#savedComments").empty();

    openModal(thisId);

});

$(document).on("click", "#saveComment", function() {

    var thisId = $(this).attr("data-id");

    $.ajax({
        method: "Post",
        url: "/articles/" + thisId,
        data: {
            title: $("#new-comment-title").val().trim(),
            body: $("#new-comment-body").val().trim()
        }
    }).then(function(data) {
        console.log("post response: ", data);

        openModal(data._id);
    })
});


});