var express = require('express')
  , params = require('express-params')
  , routes = require('./routes')
  ;

var server = express();

params.extend(server);

function setParams () {

}

/*******
* POST *
*******/

server.post('/csw/scrape', function (req, res, next) {
  req.routeId = 'scrapeCsw';
  return next();
}, setParams, routes.scrapeCsw);