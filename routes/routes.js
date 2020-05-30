var express = require("express");
var router = express.Router();

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("../models");

////////////////////////////////////////
// GET Routes

// at root, get all articles from database and rendering to index html
router.get("/", function (req, res) {
  db.Article.find({})
    .lean()
    .then(function (dbArticle) {
      var articlesObject = {
        article: dbArticle,
      };
      res.render("index", articlesObject);
    });
});

// on click of link in index, get all articles from database and rendering to saved html
router.get("/saved", function (req, res) {
  db.Article.find({ saved: true })
    .lean()
    .then(function (dbArticle) {
      var articlesObject = {
        article: dbArticle,
      };
      res.render("saved", articlesObject);
    });
});

// on click of "clear articles" link in index, remove all articles from database
router.get("/clear", function (req, res) {
  db.Article.remove({}).then(function () {
    res.redirect("/clearComments");
  });
});

// after removing all articles from database, removes all comments from comments collection and redirects to index page
router.get("/clearComments", function (req, res) {
  db.Comment.remove({}).then(function () {
    res.redirect("/");
  });
});

// route for scraping top articles from the BBC World News website, on click of 'scrape articles' link in index
router.get("/scrape", function (req, res) {
  
  axios.get("https://www.bbc.com/news/world").then(function (response) {
    
    var $ = cheerio.load(response.data);

    $("#topos-component .gs-c-promo-body").each(function (i, element) {

      var result = {};

      result.title = $(this)
        .children("div")
        .children("a")
        .children("h3")
        .text();
      result.summary = $(this).children("div").children("p").text();
      result.link = $(this).children("div").children("a").attr("href");
      result.saved = false;

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });
    res.redirect("/");
  });
});

// Route for grabbing a specific Article by id, populate it with it's comments into the modal
router.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate({
      path: "comment",
      model: "Comment",
    })
    .then(function (article) {
      res.json(article);
    })
    .catch(function (err) {
      console.log(err);
    });
});
///////////////////////////////////////////////////////////////////////



//////////////// Update routes/////////////////////

// from index page, when the saved button is clicked, the article is moved to the 'saved articles' page because this updates the saved value for the article
router.put("/saveArticle/:id", function (req, res) {
  db.Article.update({ _id: req.params.id }, { $set: { saved: true } })
    .then(function (dbArticle) {
      res.send(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// from saved page, when the delete button is clicked, the article is moved from the 'saved articles' page back to the 'home' page because this updates the saved value back to false
router.put("/removeArticle/:id", function (req, res) {
  db.Article.update({ _id: req.params.id }, { $set: { saved: false } })
    .then(function (dbArticle) {
      res.send(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Comment
router.post("/articles/:id", function (req, res) {

  db.Comment.create(req.body)
    .then(function (dbComment) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: dbComment._id } },
        { new: true }
      );
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});



//////////// Delete Comments ///////////

// removing the deleted comment from the comments collection
router.get("/deleteNote/:commentID", function (req, res) {

  db.Comment.remove(
    {
      _id: req.params.commentID,
    },
    function (error, removed) {
      if (error) {
        res.send(error);
      } else {
        res.send(removed);
      }
    }
  );
});

// removing the comment id from the article it was associated with in the articles collection
router.post("/deleteNote/:articleID", function (req, res) {

  db.Article.findOneAndUpdate(
    { _id: req.params.articleID },
    { $pull: { comment: req.body.comment } },
    { new: true }
  )
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
////////////////////////////////////////////////////////////////////////

module.exports = router;
