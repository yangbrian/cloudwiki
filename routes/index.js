var express = require('express');
var makeHtml = require('../helpers/wikiParser').makeHtml
var makeNavList = require('../helpers/wikiParser').makeNavList
var jade = require('jade');
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
          urlTitle: req.params.title,
          title: req.params.title.replace(/_/g, " "),
          error: true
        });

      var content = makeHtml(article.body,'');

      console.log(article.body);
      res.render('article', {
        urlTitle: req.params.title,
        title: article.title,
        body: content['output'],
        articleNav: jade.render(makeNavList(content['navlist'])),
        timestamp: article.time
      });
    });
});

router.get('/:title/edit', function(req, res) {
  Article
    .find({
      title: req.params.title.replace(/_/g, " ")
    })
    .lean().exec(function (err, content) {
      var article = content[0];

      if (!article || err)
        return res.render('edit', {
          urlTitle: req.params.title,
          title: req.params.title.replace(/_/g, " "),
          body: '',
          error: true
        });


      res.render('edit', {
        urlTitle: req.params.title,
        title: article.title,
        body: article.body
      });
    });
});

module.exports = router;
