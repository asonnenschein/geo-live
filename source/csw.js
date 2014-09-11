var url = require('url')
  , http = require('http')
  , domain = require('domain')
  , dom = require('xmldom').DOMParser
  , sax = require('sax')
  , saxPath = require('saxpath')
  ;

function buildRequest (cswBase, startRecord, maxRecord) {
  var host = url.parse(cswBase)['host']
    , path = url.parse(cswBase)['path']
    ;

    return {
      host: host,
      path: path + 'Request=GetRecords&service=CSW&resultType=results'
        + '&elementSetName=full&startPosition=' + startRecord 
        + '&maxRecords=' + maxRecord
        + '&outputSchema=http://www.isotc211.org/2005/gmd'
        + '&typeNames=gmd:MD_Metadata&version=2.0.2' 
    }
}

function scrapeCsw (parameters, callback) {
  var saxParser = sax.createStream(true, {lowercasetags: true, trim: true})
    , searchResults = new saxpath.SaXPath(saxParser, '//csw:searchResults')
    , fullRecord = new saxpath.SaXPath(saxParser, '//gmd:MD_Metadata')
    , serverDomain = domain.create()
    ;

  serverDomain.on('error', function (err) {
    callback(err);
  });

  serverDomain.run(function () {
    http.get(parameters, function (res) {
      var nextRecord;
      searchResults.on('match', function (xml) {

      });
      fullRecord.on('match', function (xml) {

      });
      fullRecord.on('end', function () {

      });
      res.on('end', function () {

      });
      res.on('error', function (err) {

      })
    })
  });

}

exports.buildRequest = buildRequest;