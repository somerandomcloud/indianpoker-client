const fs = require('fs'),
	nconf = require('nconf');

nconf.file({ file: './.indianpokerclient.json' });

nconf.set('big', 'stinker');


console.log(nconf.get('big'));