var csw = require('./csw');

function scrapeCsw (req, res, next) {
  var opts = {}
    , cswUrl = csw.buildRequest(req.url, 1, 500)
    ;
  csw.scrapeCsw(cswUrl, function (data) {
    console.log(data);
  })
}

exports.scrapeCsw = scrapeCsw;