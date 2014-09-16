var orm = require('orm')
  , pg = require('pg')
  , Sync = require('node-sql-ddl-sync').Sync
  ;

var connectPG = 'postgresql://geoliveuser:password@localhost:5432/geolivedb';

orm.connect(connectPG, function (err, db) {
  if (err) throw err;
  
  var driver
    , sync
    ;
  
  driver = db.driver;
  sync = new Sync({
    dialect: 'postgresql',
    driver: driver,
    debug: function (text) {
      console.log('> %s', text);
    }
  });

  sync.defineCollection('adrians_test', {
    id: {type: 'serial', key: true, serial: true},
    name: {type: 'text', required: true},
    age: {type: 'integer'}
  });

  sync.sync(function (err) {
    if (err) {
      console.log('> Sync Error', err);
    } else {
      console.log('> Sync Done');
    }
    process.exit(0);
  })
});