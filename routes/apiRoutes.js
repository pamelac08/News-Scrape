var express = require("express");

var apiRouter = express.Router();

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("../models");


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


apiRouter.get("/clear", function(req, res) {
  db.Article.remove({})
  .then(function() {
    res.redirect("/clearComments");
  });
});

apiRouter.get("/clearComments", function(req, res) {
  db.Comment.remove({})
  .then(function() {
    res.redirect("/");
  });
});

// A GET route for scraping the echoJS website
// apiRouter.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with axios
//   axios.get("http://www.echojs.com/").then(function(response) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(response.data);
//     console.log("cheerio load: " , $);

//     // Now, we grab every h2 within an article tag, and do the following:
//     $("article h2").each(function(i, element) {
//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this)
//         .children("a")
//         .text();
//       result.link = $(this)
//         .children("a")
//         .attr("href");

//       // Create a new Article using the `result` object built from scraping
//       db.Article.create(result)
//         .then(function(dbArticle) {
//           // View the added result in the console
//           console.log(dbArticle);
//         })
//         .catch(function(err) {
//           // If an error occurred, log it
//           console.log(err);
//         });
//     });

//     // Send a message to the client
//     res.redirect("/")
//   });
// });

// A GET route for scraping the echoJS website
apiRouter.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.rustonleader.com/category/news").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("#content .view-content .views-row").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children(".node")
          .children("h2")
          .children("a")
          .text();
        result.summary = $(this)
            .children(".node")
            .children(".article-wrap")
            .children(".article-info")
            .children(".field")
            .children(".field-items")
            .children(".field-item")
            .children("p")
            .text(); 
        result.link = $(this)
          .children(".node")
          .children("h2")
          .children("a")
          .attr("href");
        result.saved = false;  
  
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
  
      res.redirect("/")
    });
  });

  
  apiRouter.put("/saveArticle/:id", function(req, res) {

      db.Article.update({_id: req.params.id}, {$set: {saved:true}})
        .then(function(dbArticle) {
          console.log("dbArticle - save article: ", dbArticle);
          // res.redirect("/saved");
          res.send(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, send it back to the client
          res.json(err);
        });
    });

  apiRouter.put("/removeArticle/:id", function(req, res) {


      db.Article.update({_id: req.params.id}, {$set: {saved: false}})
        .then(function(dbArticle) {
          console.log("dbArticle - removed article: ", dbArticle);
          // res.redirect("/saved");
          res.send(dbArticle);
        })
        .catch(function(err) {
          // If an error occurs, send it back to the client
          res.json(err);
        });
    });

  
  // Route for getting all Articles from the db
  // apiRouter.get("/articles", function(req, res) {
  //   // TODO: Finish the route so it grabs all of the articles
  //   db.Article.find({})
  //     .then(function(dbArticle) {
  //       // If all Users are successfully found, send them back to the client
  //       res.json(dbArticle);
  //       // console.log(dbArticle);
  //     })
  //     .catch(function(err) {
  //       // If an error occurs, send the error back to the client
  //       res.json(err);
  //     });
  // });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  apiRouter.get("/articles/:id", function(req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
  
    db.Article.findOne({_id: req.params.id}).lean()
    // .populate("comment")
    .exec((err, article) => {
      if (err) {
        res.json(err);
      } else {
        var articleComments = {
          comment: article.comment
        }
      console.log("article and notes: ", article);
      console.log("comments only: ", articleComments);
      // res.json(articleComments);
      res.json(article);
      }
    });
  });
  
  // Route for saving/updating an Article's associated Note
  apiRouter.post("/articles/:id", function(req, res) {

    console.log("params id: ", req.params.id);
    console.log("req.body: ", req.body);
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Comment.create(req.body)
      .then(function(dbComment) {
        console.log("new comment: ", dbComment);
        // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { comment: dbComment._id} }, { new: true });
      })
      .then(function(dbArticle) {
        console.log("article updated: ", dbArticle);
        // If the User was updated successfully, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
  });


 apiRouter.get("/deleteNote/:commentID", function(req, res) {

  console.log("commentid: ", req.params.commentID);

  db.Comment.remove({
    _id: req.params.commentID
  },
  function(error, removed) {
    // Log any errors from mongojs
    if (error) {
      console.log(error);
      res.send(error);
    }
    else {
      console.log(removed);
      res.send(removed);
    }
  });

});


apiRouter.post("/deleteNote/:articleID", function(req, res) {

  console.log("articleid: ", req.params.articleID);
  console.log("comment to remove: ", req.body.comment);
  

db.Article.findOneAndUpdate({_id: req.params.articleID}, { $pull: { comment: req.body.comment} }, { new: true })

      .then(function(dbArticle) {
        console.log("article updated: ", dbArticle);
        // If the User was updated successfully, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });

});

  module.exports = apiRouter;