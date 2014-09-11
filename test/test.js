var should = require('should')
  , supertest = require('supertest')
  , mocha = require('mocha')
  , request = require('request')
  ;

describe('Tests', function () {
  var productionServer
    , testDataServer
    ;

  before(function (done) {
    testDataServer = require('./test-server');
    productionServer = require('./../source/server');
    done();
  });

  describe('Stream metadata docs into text file', function () {
    it('should return 200 when done', function (done) {
      var req = {'cswBaseUrl': 'http://geothermaldata.org/csw?'};
      supertest(productionServer)
        .post('/csw/scrape')
        .send(req)
        .expect(200, done)
    })
  });

});