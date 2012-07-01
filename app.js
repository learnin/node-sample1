
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
var fs = require('fs'),
  path = require('path');

var setupRouting = function(routesDir) {
  var files = fs.readdirSync(routesDir);
  files.forEach(function(e) {
    e = routesDir + '/' + e;
    var stats = fs.statSync(e);
    if (stats.isDirectory()) {
      setupRouting(e);
    } else {
      var urlPath = '/';
      if (path.basename(e, '.js') == 'index') {
        urlPath += path.dirname(path.relative(routesDir, e));
      } else {
        urlPath += path.relative(routesDir, e).replace('.js', '');
      }
      urlPath = path.normalize(urlPath);
      var handler = require(e);
      for (var f in handler) {
        switch(f) {
          case 'index':
            app.get(urlPath, handler[f]);
            break;
          case 'create':
            app.post(urlPath, handler[f]);
            break;
          case 'update':
            app.put(urlPath + '/:id', handler[f]);
            break;
          case 'destroy':
            app.del(urlPath + '/:id', handler[f]);
            break;
          default:
            app.get(urlPath + '/' + f, handler[f]);
        }
      }
    }
  });
}
setupRouting(path.resolve(__dirname + '/routes'));

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
