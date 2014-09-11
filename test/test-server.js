var express = require('express')
  , fs = require('fs')
  , path = require('path')
  ;

var app
  , server
  , sampleCsw
  ;

app = express();
sampleCsw = path.join(__dirname, 'test-csw.xml');

app.get('/test-csw.xml', function (req, res) {
  fs.readFile(sampleCsw, 'utf8', function (err, xml) {
    if (err) throw err;
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(xml);
  }
});

server = app.listen(3030);

module.exports = server;