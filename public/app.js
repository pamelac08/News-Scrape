// for both index and saved html pages
$(document).ready(function () {

  

  
  // on index page, when the saved button is clicked, the article is moved to the 'saved articles' page    
  $(document).on("click", ".saveButton", function () {
    event.preventDefault();

    var id = $(this).attr("data-id");
    // console.log("id: ", id);

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
    // console.log("id: ", id);

    $.ajax({
      type: "PUT",
      url: "/removeArticle/" + id,
    }).then(function () {
      window.location.href = window.location.href;
    });
  });



  

  //////// adding and getting comments per article////////


  // function to get any comments already in database per article and calling the display function   
  function openModal(articleID) {
    //   console.log("articleID inside openModal function: ", articleID);
    $("#savedComments").empty();
    $("#saveComment").attr("data-id", articleID);
    $.ajax({
      method: "GET",
      url: "/articles/" + articleID,
    }).then(function (data) {
      console.log("open modal data: " + JSON.stringify(data));
      $.each(data.comment, function (i, eachComment) {
        displayComments(eachComment, data);
      });
      $("#commentsModal").modal("show");
    });
  };

  // function to create elements to display any comments for a given article
  function displayComments(element, article) {

    $("#modal-title").empty();
    var modalTitle = $("<p>").text("Comments for Article: " + article.title);
    $("#modal-title").append(modalTitle);

    
    var newComment = $("<div>").addClass("comment-div");
    var commentTextDiv = $("<div>").addClass("comment-text-div"); 

    var title = $("<p>").text(element.title);
    var body = $("<p>").text(element.body);
    
    commentTextDiv.append(title, body);

    var deleteButton = $("<button>")
    .attr("data-comment-id", element._id)
    .attr("data-article-id", article._id)
    .addClass("delete-comment")
    .text("Delete Comment");

    newComment.append(commentTextDiv, deleteButton);

    $("#savedComments").append(newComment);
  };


  // on click event per article to display the "article comments" plus a form to submit new comment in a modal
  $(document).on("click", "#openComments", function () {
    var thisId = $(this).attr("data-id");
    // console.log("thisID when opening modal: ", thisId);
    // $("#savedComments").empty();
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
      },
    }).then(function (data) {
      // console.log("post response: ", data);
      // openModal(data._id);
    });
  });
/////////////////////////end of saving and displaying comments in modal




/////// deleting comments from modal and database////////

  // delete comment from comments collection
  $(document).on("click", ".delete-comment", function () {
    event.preventDefault();

    var commentID = $(this).attr("data-comment-id");
    // console.log("id: ", commentID);

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
    };

    var articleID = $(this).attr("data-article-id");
    // console.log("id: ", articleID);

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
