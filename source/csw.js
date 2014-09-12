var url = require('url')
  , http = require('http')
  , request = require('request')
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
    ;

    var count = 0;

    http.get(parameters, function (res) {
      if (res.statusCode === 200) {

        res.pipe(saxParser);

        searchResults.on('match', function (xml) {
          var doc = new dom().parseFromString(xml);
          nextRecord = xpath(doc, '@nextRecord')[0].value;
        });
        
        fullRecord.on('match', function (xml) {
          try {
            var fileId = new RegExp(rex.fileId)
              , contact = new RegExp(rex.contact)
              , identity = new RegExp(rex.identity)
              , distrib = new RegExp(rex.distrib)
              , nextRecord
              ;

            console.log({
              fileId: fileId.exec(xml)[1],
            });

        });
        
        res.on('end', function () {
          console.log('end');
        });
        
        res.on('error', function (err) {
          console.log(err);
        })        
      }
    })

}

exports.buildRequest = buildRequest;
exports.scrapeCsw = scrapeCsw;