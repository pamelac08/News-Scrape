var express = require("express");
var apiRouter = express.Router();

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("../models");


/////////////////////////////
// GET Routes 


// at root, get all articles from database and rendering to index html
apiRouter.get("/", function(req, res) {
  db.Article.find({}).lean()
    .then(function(dbArticle) {
      var articlesObject = {
        article: dbArticle
      };
      // console.log("articles object: " + JSON.stringify(articlesObject));
      res.render("index", articlesObject);
    })
});

// on click of link in index, get all articles from database and rendering to saved html
apiRouter.get("/saved", function(req, res) {
  db.Article.find({}).lean()
    .then(function(dbArticle) {
      var articlesObject = {
        article: dbArticle
      };
      // console.log("articles object: " + JSON.stringify(articlesObject));
      res.render("saved", articlesObject);
    })
});

// on click of link in index, remove all articles from database
apiRouter.get("/clear", function(req, res) {
  db.Article.remove({})
  .then(function() {
    res.redirect("/clearComments");
  });
});

// after removing all articles from database, removes all comments from comments collection and redirects to index
apiRouter.get("/clearComments", function(req, res) {
  db.Comment.remove({})
  .then(function() {
    res.redirect("/");
  });
});


// // route for scraping the ##### website, on click of 'scrape articles' link in index
// apiRouter.get("/scrape", function(req, res) {
//     // First, we grab the body of the html with axios
//     axios.get("https://www.rustonleader.com/category/news").then(function(response) {
//       // Then, we load that into cheerio and save it to $ for a shorthand selector
//       var $ = cheerio.load(response.data);

//       // Now, we grab every h2 within an article tag, and do the following:
//       $("#content .view-content .views-row").each(function(i, element) {
//         // Save an empty result object
//         var result = {};
  
//         // Add the text and href of every link, and save them as properties of the result object
//         result.title = $(this)
//           .children(".node")
//           .children("h2")
//           .children("a")
//           .text();
//         result.summary = $(this)
//           .children(".node")
//           .children(".article-wrap")
//           .children(".article-info")
//           .children(".field")
//           .children(".field-items")
//           .children(".field-item")
//           .children("p")
//           .text(); 
//         result.link = $(this)
//           .children(".node")
//           .children("h2")
//           .children("a")
//           .attr("href");
//         result.saved = false;  
  
//         // Create a new Article using the `result` object built from scraping
//         db.Article.create(result)
//           .then(function(dbArticle) {
//             // View the added result in the console
//             console.log(dbArticle);
//           })
//           .catch(function(err) {
//             // If an error occurred, log it
//             console.log(err);
//           });
//       });
//       res.redirect("/")
//     });
//   });





/////////////working for scraping, not for duplicates///////////////////

// // route for scraping the BBC World News website, on click of 'scrape articles' link in index
apiRouter.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.bbc.com/news/world").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("#topos-component .gs-c-promo-body").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("div")
        .children("a")
        .children("h3")
        .text();
      result.summary = $(this)
        .children("div")
        .children("p")
        .text(); 
      result.link = $(this)
        .children("div")
        .children("a")
        .attr("href");
      result.saved = false;  

      // need validation checks before sending to database

      
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    res.redirect("/");
    // res.redirect("/checkDuplicates");
  });
});
///////////////////////////////////////////////////////////////////////




// route for scraping the BBC World News website, on click of 'scrape articles' link in index
// apiRouter.get("/checkDuplicates", function(req, res) {

//   db.Article.find({}).lean()
//   .then(function(db_articles) {

//     console.log("db_articles in check duplicates route", db_articles);



//     db_articles.forEach(function(currentValue, i, db_articles) {
//       // console.log("current value: ", currentValue);
//       console.log("currentValue.link: ", currentValue.link);
//       console.log("index in first: ", i);



//       db_articles.forEach(function(current, i, currentValue) {
//         // console.log("current inside 2nd: ", current);
//         console.log("current.link inside 2nd: ", current.link);

//         // console.log("currentValue inside 2nd: ", currentValue[i]);
//         console.log("currentValue.link inside 2nd: ", currentValue[i].link);
//         console.log("index in 2nd: ", i);


//         if (current.link === currentValue[i].link) {
        
//             console.log("inside if statement");
//             // remove db_articles[i] from database
//                   // db.Article.remove(
//                   //   {
//                   //     _id: currentValue._id
//                   //   },
//                   //   function(error, removed) {
//                   //     if (error) {
//                   //       console.log(error);
//                   //       // res.send(error);
//                   //     }
//                   //     else {
//                   //       console.log(removed);
//                   //       // res.send(removed);
//                   //     }
//                   //   }
//                   // );
//           };
//       });
//     });
//   }).catch(function(err) {
//     // If an error occurred, log it
//     console.log(err);
//   });
//   res.redirect("/");
// });







// Update routes

// from index page, when the saved button is clicked, the article is moved to the 'saved articles' page because this updates the saved value for the article
apiRouter.put("/saveArticle/:id", function(req, res) {
      db.Article.update({_id: req.params.id}, {$set: {saved:true}})
        .then(function(dbArticle) {
          // console.log("dbArticle - save article: ", dbArticle);
          // res.redirect("/saved");
          res.send(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, send it back to the client
          res.json(err);
        });
    });

// from saved page, when the delete button is clicked, the article is moved from the 'saved articles' page back to the 'home' page because this updates the saved value back to false
apiRouter.put("/removeArticle/:id", function(req, res) {
      db.Article.update({_id: req.params.id}, {$set: {saved: false}})
        .then(function(dbArticle) {
          // console.log("dbArticle - removed article: ", dbArticle);
          // res.redirect("/saved");
          res.send(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, send it back to the client
          res.json(err);
        });
    });





  
// Route for grabbing a specific Article by id, populate it with it's note into the modal
apiRouter.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
    .populate({
      path: "comment",
      model: "Comment"
    })
    .then(function(article) {
      
        var articleComments = {
          comment: article.comment
        }
      console.log("article and notes: ", article);
      // console.log("comments only: ", articleComments);
      // res.json(articleComments);
      res.json(article);
    })
    
    .catch(function(err) {
      console.log(err);
    })
  });
  
  // Route for saving/updating an Article's associated Note
  apiRouter.post("/articles/:id", function(req, res) {

    // console.log("params id: ", req.params.id);
    // console.log("req.body: ", req.body);

    db.Comment.create(req.body)
      .then(function(dbComment) {
        // console.log("new comment: ", dbComment);
        return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { comment: dbComment._id} }, { new: true });
      })
      .then(function(dbArticle) {
        // console.log("article updated: ", dbArticle);
        // If the User was updated successfully, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
  });





//////////// Delete comments ///////////

apiRouter.get("/deleteNote/:commentID", function(req, res) {

  // console.log("commentid: ", req.params.commentID);

  db.Comment.remove({
    _id: req.params.commentID
  },
  function(error, removed) {
    // Log any errors from mongojs
    if (error) {
      // console.log(error);
      res.send(error);
    }
    else {
      // console.log(removed);
      res.send(removed);
    }
  });
});


apiRouter.post("/deleteNote/:articleID", function(req, res) {

  // console.log("articleid: ", req.params.articleID);
  // console.log("comment to remove: ", req.body.comment);
  
  db.Article.findOneAndUpdate({_id: req.params.articleID}, { $pull: { comment: req.body.comment} }, { new: true })
      .then(function(dbArticle) {
        // console.log("article updated: ", dbArticle);
        // If the User was updated successfully, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
});
////////////////////////////////////////////////////////////////////////



module.exports = apiRouter;