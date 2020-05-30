// javascript containing ajax calls for both index and saved html pages

$(document).ready(function () {

  // on index page, when the saved button is clicked, the article is moved to the 'saved articles' page
  $(document).on("click", ".saveButton", function () {
    event.preventDefault();

    var id = $(this).attr("data-id");

    $.ajax({
      type: "PUT",
      url: "/saveArticle/" + id,
    }).then(function () {
      window.location.href = window.location.href;
    });
  });

  // on saved page, when the delete button is clicked, the article is removed from the 'saved articles' page back to the 'home' page
  $(document).on("click", ".deleteSaved", function () {
    event.preventDefault();

    var id = $(this).attr("data-id");

    $.ajax({
      type: "PUT",
      url: "/removeArticle/" + id,
    }).then(function () {
      window.location.href = window.location.href;
    });
  });



  ////////// getting and adding comments per article////////

  // function to get any comments already in database per article and calling the display function
  function openModal(articleID) {
  
    // clearing the saved comments section of any previous content
    $("#savedComments").empty();
    // adding article id as attribute to save button for new comment submissions
    $("#saveComment").attr("data-id", articleID);

    $.ajax({
      method: "GET",
      url: "/articles/" + articleID,
    }).then(function (data) {

      // adding article title to comments modal
      $("#modal-title").empty();
      var modalTitle = $("<p>").html(
        "Comments for Article:  <br>" + data.title
      );
      $("#modal-title").append(modalTitle);

      // if there are comments in database already, display each using "displayComments" function; if not, display no comment message
      if (data.comment.length) {
        $.each(data.comment, function (i, eachComment) {
          displayComments(eachComment, data);
        });
      } else {
        var noComment = $("<div>")
          .addClass("noCommentDiv text-center")
          .html(
            "No comments yet for this article! <br> Be the first to add yours below!"
          );
        $("#savedComments").append(noComment);
      }

      $("#commentsModal").modal("show");
    });
  }

  // function to create elements to display any comments for a given article
  function displayComments(element, article) {
    var newComment = $("<div>").addClass("card comment-div");
    var commentTextDiv = $("<div>").addClass("card-body comment-text-div");

    var title = $("<h6>").addClass("card-title").text(element.title);
    var body = $("<p>").addClass("card-text").text(element.body);

    var deleteButton = $("<button>")
      .attr("data-comment-id", element._id)
      .attr("data-article-id", article._id)
      .addClass("delete-comment")
      .text("Delete Comment");

    commentTextDiv.append(title, body, deleteButton);
    newComment.append(commentTextDiv);

    $("#savedComments").append(newComment);
  }

  // on click event per article to display the "article comments" plus a form to submit new comment in a modal
  $(document).on("click", "#openComments", function () {
    var thisId = $(this).attr("data-id");
    openModal(thisId);
  });

  // on click event to save a new comment to the database associated with the article in the modal
  $(document).on("click", "#saveComment", function () {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "Post",
      url: "/articles/" + thisId,
      data: {
        title: $("#new-comment-title").val().trim(),
        body: $("#new-comment-body").val().trim(),
      }
    });
  });
  /////////////////////////end of saving and displaying comments in modal////////////////




  /////// deleting comments from modal and database////////

  // delete comment from comments collection
  $(document).on("click", ".delete-comment", function () {
    event.preventDefault();

    var commentID = $(this).attr("data-comment-id");

    $.ajax({
      type: "GET",
      url: "/deleteNote/" + commentID,
    }).then(function () {
      window.location.reload();
    });
  });

  // delete comment from corresponding article collection
  $(document).on("click", ".delete-comment", function () {
    event.preventDefault();

    var commentToDelete = {
      comment: $(this).attr("data-comment-id"),
    }

    var articleID = $(this).attr("data-article-id");

    $.ajax({
      type: "POST",
      url: "/deleteNote/" + articleID,
      data: commentToDelete,
    }).then(function () {
      window.location.reload();
    });
  });
  //////////end of delete calls ////////////////////
});
