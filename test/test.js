var should = require('should')
	, assert = require('assert')
  , supertest = require('supertest')
  , mocha = requrie('mocha')
  , request = require('request')
  ;

describe('Tests', function () {
  var req
    , productionServer
    , testDataServer
    ;

  before(function (done) {
    testDataServer = require('./test-server');
    productionServer = require('./../source/server');
  });

  describe('Stream metadata docs into text file', function () {
    it('should return 200 when done', function (done) {

      supertest(productionServer)
        .post

    })
  })

});