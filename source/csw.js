var url = require('url')
  , http = require('http')
  , domain = require('domain')
  , dom = require('xmldom').DOMParser
  , xpath = require('xpath.js')
  , sax = require('sax')
  , saxpath = require('saxpath')
  , xml2json = require('xml2json')
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
      if (res.statusCode === 200) {
        var nextRecord;

        res.pipe(saxParser);

        searchResults.on('match', function (xml) {
          var doc = new dom().parseFromString(xml);
          nextRecord = xpath(doc, '@nextRecord')[0].value;
        });
        
        fullRecord.on('match', function (xml) {
          console.log(xml2json.toJson(xml));
          //console.log(xml);
        });

        fullRecord.on('end', function () {
          console.log('end');
        });
        
        res.on('end', function () {
          console.log('end');
        });
        
        res.on('error', function (err) {
          console.log(err);
        })        
      }
    })
  });

}

exports.buildRequest = buildRequest;
exports.scrapeCsw = scrapeCsw;