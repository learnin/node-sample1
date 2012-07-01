
/**
 * Module dependencies.
 */

var express = require('express'),
  path = require('path'),
  app = exports = express.createServer();

var setupRouting = function(routesDir) {
  var fs = require('fs'),
    files = fs.readdirSync(routesDir);
  files.forEach(function(e) {
    e = routesDir + '/' + e;
    var stats = fs.statSync(e);
    if (stats.isDirectory()) {
      setupRouting(e);
    } else {
      var urlPath = '/',
        handler,
        f;
      if (path.basename(e, '.js') == 'index') {
        urlPath += path.dirname(path.relative(routesDir, e));
      } else {
        urlPath += path.relative(routesDir, e).replace('.js', '');
      }
      urlPath = path.normalize(urlPath);
      handler = require(e);
      for (f in handler) {
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
setupRouting(path.resolve(__dirname + '/routes'));

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
