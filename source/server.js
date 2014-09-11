var express = require('express')
  , params = require('express-params')
  , routes = require('./routes')
  , bodyParser = require('body-parser')
  ;

var server = express();

server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
params.extend(server);

function setParams (req, res, next) {
  var action = req.routeId;
  if (action === 'scrapeCsw') {
    req.url = req.body.cswBaseUrl;
  }
  return next();
}

/*******
* POST *
*******/

server.post('/csw/scrape', function (req, res, next) {
  req.routeId = 'scrapeCsw';
  return next();
}, setParams, routes.scrapeCsw);

server.listen(3000);

module.exports = server;