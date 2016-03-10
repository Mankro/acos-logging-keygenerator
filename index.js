var fs = require('fs');
var crypto = require('crypto');
var nunjucks = require('nunjucks');

nunjucks.configure(__dirname);

var keyGenerator = function() {};

keyGenerator.register = function(handlers, app, config) {

  handlers.tools['logging-keygenerator'] = keyGenerator;

  // Give a warning if the logging key is not specified in the config file.
  // The key for the value in the config file is 'logKey'.
  // If the key is not found, a default value 'acos' will be used.
  if (!config.logKey) {
    console.log('[Logging key generator] Warning: Logging key is not specified in the config file.');
  }

  // Register own URL endpoint for this tool
  app.all('/logging-keygenerator', function(req, res) {

    crypto.randomBytes(256, function(err, bytes) {
      if (err) {
        res.sendStatus(500);
      } else {
        var publicHash = crypto.createHash('sha1').update(bytes);
        var secretHash = crypto.createHash('sha1').update(bytes + (config.logKey || 'acos'));
        var result = nunjucks.render('template.html', {
          publicKey: publicHash.digest('hex'),
          secretKey: secretHash.digest('hex'),
          host: config.serverAddress
        });

        res.set('Content-Type', 'text/html');
        res.send(result);

      }
    });

  });

};

keyGenerator.namespace = 'logging-keygenerator';
keyGenerator.packageType = 'tool';

keyGenerator.meta = {
  'name': 'logging-keygenerator',
  'shortDescription': 'A tool for generating public and secret keys for logging.',
  'description': 'A tool for generating public and secret keys for logging.',
  'author': 'Teemu Sirkiä',
  'license': 'MIT',
  'version': '0.0.1',
  'url': ''
};

module.exports = keyGenerator;
