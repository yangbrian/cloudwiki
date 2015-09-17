/**
 * Wiki API calls
 *
 */
var express = require('express');
var router = express.Router();
var moment = require('moment');
var parse = require('loose-json');

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

      if (!article[0])
        return res.send(JSON.stringify('null'));

      // Mongo returns an array, but we only want one
      var data = { "title" : article[0].title, "body" : article[0].body };
      return res.send(JSON.stringify(data));
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

  //console.log(req);

  // to deal with the form which doesn't have data

  if (req.body.data) {
    try {
      req.body.data = parse(req.body.data);
    } catch (err) {
      res.setHeader('content-type', 'application/json');
      return res.send('{ "status": "ERROR"}');
    }
  } else if (req.body.title) {
    req.body.data = {};
    req.body.data.title = req.body.title;
    req.body.data.body = req.body.body;

  } else {
    req.body.data = {};
    req.body.data.title = req.params.title.replace(/_/g, " ");
    return res.send('{ "status": "CREATED"}');
  }

  Article.update({
    title: req.params.title.replace(/_/g, " ")
  }, {
    title: req.body.data.title || req.params.title.replace(/_/g, " "),
    body: req.body.data.body,
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

      if (req.params.title.replace(/_/g, " ") != req.body.data.title) {
          status.status = 'ERROR'
          return res.send(JSON.stringify(status))
      }

      var article = new Article({  
        title: req.params.title.replace(/_/g, " "),   
        body: req.body.data.body, 
        time: moment().format('MMMM Do YYYY, h:mm:ss a')   
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
