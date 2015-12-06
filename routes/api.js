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

var multer  = require('multer');
var upload = multer();

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

      if (!article)
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
router.get('/:title', function (req, res, next) {

  Article
    .find({
      title: req.params.title.replace(/_/g, " ")
    })
    .lean().exec(function (err, article) {
    res.setHeader('content-type', 'application/json');

    if (!article)
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
router.post('/:title', upload.array(), function (req, res, next) {

  function toUpperCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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
    req.body.data.body = null;
  }

  // check if article already exists
  Article
    .find({
      title: req.params.title.replace(/_/g, " ")
    })
    .lean().exec(function (err, article) {
    res.setHeader('content-type', 'application/json');


    var status = {
      status: 'null'
    };

    // check if article already exists
    if (!article || article.length == 0) {
      if (toUpperCase(req.params.title.replace(/_/g, " ")) != toUpperCase(req.body.data.title)) {
        status.status = 'ERROR';
        return res.send(JSON.stringify(status))
      }

      var article = new Article({
        title: toUpperCase(req.params.title.replace(/_/g, " ")),
        body: req.body.data.body,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      });

      article.save(function (err) {
        if (err) {
          console.log(err);
          console.log("\nError creating new article");
          status.status = 'ERROR-CREATE';
        } else {
          console.log("\nNew article - " + req.params.title + " created");
          status.status = 'CREATED';
        }


        return res.send(JSON.stringify(status));
      });
    } else {

      var paramTitle = req.params.title.replace(/_/g, " ");
      var titleUpdated = false;
      if (req.body.data.title && req.body.data.title !== paramTitle)
        titleUpdated = paramTitle;


      res.setHeader('content-type', 'application/json');
      // if title changed
      if (titleUpdated) {
        Article.update({
          title: toUpperCase(paramTitle)
        }, {

          body: '#REDIRECT [[' + req.body.data.title + ']]',
          time: moment().format('MMMM Do YYYY, h:mm:ss a')

        }, function (err, number, raw) {
          if (err) {
            console.log("\nError creating redirect");
            status.status = 'ERROR-REDIRECT';
            return res.send(JSON.stringify(status));
          } else {
            console.log("\nRedirected article = " + req.params.title);

            var article = new Article({
              title: req.body.data.title,
              body: req.body.data.body,
              time: moment().format('MMMM Do YYYY, h:mm:ss a')
            });

            article.save(function (err) {
              if (err) {
                console.log("\nError creating redirected for " + paramTitle + " to " + req.body.data.title);
                status.status = 'ERROR-RENAME';
              } else {
                console.log("\nCreated redirected article for " + paramTitle + " to " + req.body.data.title);
                status.status = 'UPDATED';
              }

              return res.send(JSON.stringify(status));
            });
          }

        });
      } else {
        Article.update({
          title: toUpperCase(paramTitle)
        }, {
          //title: toUpperCase(req.body.data.title) || toUpperCase(paramTitle),
          body: req.body.data.body,
          time: moment().format('MMMM Do YYYY, h:mm:ss a')

        }, function (err, number, raw) {
          if (err) {
            console.log("\nError updating article");
            status.status = 'ERROR-UPDATE';
          } else {
            console.log("\nUpdated article = " + req.params.title);
            status.status = "UPDATED";
          }

          return res.send(JSON.stringify(status));
        });
      }

      // Upsert version of the API

      //var status = {};
      //Article.update({
      //  title: toUpperCase(req.params.title.replace(/_/g, " "))
      //}, { '$set' : {
      //  title: toUpperCase(req.body.data.title) || toUpperCase(req.params.title.replace(/_/g, " ")),
      //  body: req.body.data.body,
      //  time: moment().format('MMMM Do YYYY, h:mm:ss a')
      //
      //}}, { upsert: true }, function (err, number, raw) {
      //
      //  if (err) {
      //    console.log("\nError updating article");
      //    status.status = 'ERROR-UPDATE';
      //    status.error = err;
      //  } else if (number.upserted) {
      //    console.log("\nCreated article = " + req.params.title);
      //    status.status = "CREATED";
      //  } else {
      //    console.log("\nUpdated article = " + req.params.title);
      //    status.status = "UPDATED";
      //  }
      //  return res.send(JSON.stringify(status));
      //});
    }
  });

});

module.exports = router;
