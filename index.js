var path 		= require('path');
var ServeStatic = require('serve-static');
var util 		= require('util');
var _ 			= require('underscore');
var fs 			= require('fs');

function MDL(core, options){
	var self = this;
	options 		= options || {};
	var combiner 	= options.httpCombiner || core.httpCombiner;

	self.initHttp = function(app) {
		var depsComponetsPath = path.join(__dirname,'/bower_components/');
		var componetsPath = path.join(__dirname,'/http/mdl/');
		var scriptsPath   = path.join(__dirname,'/http/scripts/');

		if (combiner && combiner.addHttpFolders) {
			combiner.addHttpFolders([
				scriptsPath,
				componetsPath,
				depsComponetsPath
			]);
			combiner.addHttpFolderAlias({
				deps: depsComponetsPath,
				MDL:componetsPath,
				'MDL/scripts': scriptsPath
			})
		};

		var list = fs.readdirSync(componetsPath);
		var ignoreList = ['.', '..', '.DS_Store'];
		if (_.isArray(app.get('views'))) {
			app.get('views').push(componetsPath);
		}else{
			app.set('views', [app.get('views'), componetsPath]);
		}

		_.each(list, function(file){
			if (_.contains(ignoreList, file))
				return;
			// console.log("file", file)
			app.get('/MDL/'+file, function(req, res, next) {
	            res.render(file, {req: req});
	        });
		});

		var digestRootPath = ServeStatic(depsComponetsPath+"/material-design-lite");
		app.get('/material.min.css.map', digestRootPath);
		app.get('/material.min.js.map', digestRootPath);
		app.get('/material.min.js', digestRootPath);
		app.get('/material.min.css', digestRootPath);
		app.get('/material.js', digestRootPath);
		app.get('/material.css', digestRootPath);

		app.use('/source', ServeStatic(depsComponetsPath+"/material-design-lite/src"));

		app.use('/deps', ServeStatic(depsComponetsPath));
		app.use('/MDL/scripts', ServeStatic(scriptsPath));
	    app.use('/MDL', ServeStatic(componetsPath));
	}
}

module.exports = MDL;