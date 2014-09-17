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

  sync.defineCollection('hosts', {
    name: {type: 'text', required: true},
    description: {type: 'text', required: true},
    url: {type: 'text', required: true},
    institution_id: {type: 'integer', required: true},
    layers_count: {type: 'integer', required: true},
    pings_count: {type: 'integer', required: true},
    created_at: {type: 'date', time: true, required: true},
    updated_at: {type: 'date', time: true, required: true}
  });

  sync.defineCollection('institutions', {
    name: {type: 'text', required: true},
    created_at: {type: 'date', time: true, required: true},
    updated_at: {type: 'date', time: true, required: true}
  });

  sync.defineCollection('layers', {
    name: {type: 'text', required: true},
    geoserver_layername: {type: 'text', required: true},
    access: {type: 'text', required: true},
    description: {type: 'text', required: true},
    bbox: {type: 'text', required: true},
    host_id: {type: 'integer', required: true},
    statuses_count: {type: 'integer', required: true},
    created_at: {type: 'date', time: true, required: true},
    updated_at: {type: 'date', time: true, required: true}
  });

  sync.defineCollection('pings', {
    status: {type: 'boolean', required: true},
    latest: {type: 'boolean', required: true},
    host_id: {type: 'integer', required: true},
    created_at: {type: 'date', time: true, required: true},
    updated_at: {type: 'date', time: true, required: true}
  });

  sync.defineCollection('statuses', {
    res_code: {type: 'text', required: true},
    res_message: {type: 'text', required: true},
    res_time: {type: 'number', size: 8, required: true},
    status: {type: 'text', required: true},
    status_message: {type: 'text', required: true},
    submitted_query: {type: 'text', required: true},
    latest: {type: 'boolean', required: true},
    layer_id: {type: 'integer', required: true},
    created_at: {type: 'date', time: true, required: true},
    updated_at: {type: 'date', time: true, required: true}
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