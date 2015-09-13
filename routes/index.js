var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/* GET article */
router.get('/:title', function(req, res) {
  Article
    .find({
      title: req.params.title.replace(/_/g, " ")
    })
    .lean().exec(function (err, content) {
      var article = content[0];

      if (!article || err)
        return res.render('article', {
          error: true
        });

      console.log(article.body);
      res.render('article', {
        title: article.title,
        body: article.body,
        timestamp: article.time
      });
    });
});

module.exports = router;
