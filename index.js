require('find-index/ponyfill');
var fs = require('fs');
var CallSite = require('./call-site');

function createCallSitesString(callSites){
	return callSites.map(function(callSite){
		return '\n\tat ' + String(callSite);
	}).join('');
}

function createErrorString(error){
	var string = '';
	var fileName = error.fileName;

	// Format the line from the original source code like node does
	if( fileName ){
		string+= '\n';
		string+= fileName;

		if( error.lineNumber ){
			string+= ':' + error.lineNumber;
			string+= '\n';

			var filePath;
			if( fileName.indexOf('file:///') === 0 ){
				filePath = fileName.slice('file:///'.length);
			}
			else{
				filePath = fileName;
			}

			if( fs.existsSync(filePath) ){
				var code = fs.readFileSync(filePath, 'utf8');
				var lineSource = code.split(/(?:\r\n|\r|\n)/)[error.lineNumber - 1];

				if( lineSource ){
					string+= lineSource;
					if( error.columnNumber ){
						string+= '\n' + new Array(error.columnNumber).join(' ') + '^';
					}
				}
			}
		}
		else{
			string+= '\n';
		}
	}

	string+= error.name;
	string+= ': ' + error.message;
	string+= error.stack;

	return string;
}

var properties = {
	get fileName(){
		return this.callSites[0] ? this.callSites[0].getFileName() : null;
	},

	get lineNumber(){
		return this.callSites[0] ? this.callSites[0].getLineNumber() : null;
	},

	get columnNumber(){
		return this.callSites[0] ? this.callSites[0].getColumnNumber() : null;
	},

	get stack(){
		return createCallSitesString(this.callSites);
	},

	toString: function(){
		return createErrorString(this);
	}
};

function is(error){
	return error && typeof error.stack === 'string';
}

function augmentError(error){
	if( error && typeof error.stack === 'string' ){
		// do once
		if( false === 'callSites' in error ){
			var callSites = CallSite.parseStack(error.stack);

			error.callSites = callSites;
			Object.keys(properties).forEach(function(key){
				Object.defineProperty(error, key, Object.getOwnPropertyDescriptor(properties, key));
			});
		}
	}

	return error;
}

function getCallSites(error){
	return is(error) ? augmentError(error).callSites : [];
}

module.exports = {
	is: is,

	sliceIf: function(error, filter, bind){
		var callSites = getCallSites(error);

		if( callSites.length ){
			var callSiteIndex = callSites.findIndex(filter, bind);
			if( callSiteIndex !== -1 ){
				error.callSites = callSites.slice(callSiteIndex);
			}
		}
	},

	excludeFile: function(error, file){
		return this.sliceIf(error, function(callSite){
			return callSite.getFileName() != file;
		});
	},

	forEach: function(error, fn, bind){
		getCallSites(error).forEach(fn, bind);
	}
};