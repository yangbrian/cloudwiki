/**
 * Wiki API calls
 *
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/**
 * Get article by name
 * /api/Article_Title returns a JSON object describing the requested article
 *
 * If the article doesn't exist, nothing is returned
 */
router.get('/:title', function (req, res, next) {

  Article
    .find({
      title: req.params.title.replace(/_/g, " ")
    })
    .lean().exec(function (err, article) {
      res.setHeader('content-type', 'application/json');

      // Mongo returns an array, but we only want one
      return res.send(JSON.stringify(article[0]));
    });
});

/**
 * Create or update article by name
 * /api/Article_Title searches for the requested article.
 *
 * If the article exists, it will update it with the provided parameters in the POST body.
 *
 * If the article does not exist, it will create it with the provided parameters in the post body.
 */
router.post('/:title', function (req, res, next) {

  Article.update({
    title: req.params.title.replace(/_/g, " ")
  }, {
    title: req.body.title || req.params.title.replace(/_/g, " "),
    body: req.body.body,
    time: moment().format('MMMM Do YYYY, h:mm:ss a')

  }, function (err, number, raw) {

    var status = {
      status: 'null'
    };

    res.setHeader('content-type', 'application/json');

    if (err) {
      console.log("\nError updating article");
      status.status = 'ERROR-UPDATE';
    } else {
      console.log("\nUpdated article - " + req.params.title);
      status.status = 'UPDATED';
    }

    if (!err && !number.n) {

      var article = new Article({
        title: req.params.title.replace(/_/g, " "),
        body: req.body.body
      });

      article.save(function (err) {
        if (err) {
          console.log("\nError creating new article");
          status.status = 'ERROR-CREATE';
        } else {
          console.log("\nNew article - " + req.params.title + " created");
          status.status = 'CREATED';
        }
        return res.send(JSON.stringify(status));
      });
    } else {
      return res.send(JSON.stringify(status));
    }

  });

});

module.exports = router;
