var fs = require('fs');
var CallSite = require('./call-site');

function is(error){
	return error && typeof error.stack === 'string';
}

var StackTrace = {
	constructor: function(error){
		var callSites;

		if( is(error) ){
			callSites = CallSite.parseStack(error.stack);
		}
		else{
			callSites = [];
		}

		this.callSites = callSites;
	},

	create: function(){
		var stackTrace = Object.create(this);
		stackTrace.constructor.apply(stackTrace, arguments);
		return stackTrace;
	},

	get fileName(){
		return this.callSites[0] ? this.callSites[0].getFileName() : null;
	},

	get lineNumber(){
		return this.callSites[0] ? this.callSites[0].getLineNumber() : null;
	},

	get columnNumber(){
		return this.callSites[0] ? this.callSites[0].getColumnNumber() : null;
	},

	forEach: function(fn, bind){
		this.callSites.forEach(fn, bind);
	},

	toString: function(){
		return this.callSites.map(function(callSite){
			return '\n\tat ' + String(callSite);
		}).join('');
	}
};

var fs = require('fs');

var properties = {
	get fileName(){
		return this.stackTrace.fileName;
	},

	get lineNumber(){
		return this.stackTrace.lineNumber;
	},

	get columnNumber(){
		return this.stackTrace.columnNumber;
	},

	get stack(){
		return this.stackTrace.toString();
	},

	toString: function(){
		var string = '';
		var fileName = this.fileName, lineNumber = this.lineNumber, columnNumber = this.columnNumber;

		// Format the line from the original source code like node does
		if( fileName ){
			string+= '\n';
			string+= fileName;

			if( lineNumber ){
				string+= ':' + lineNumber;
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
					var lineSource = code.split(/(?:\r\n|\r|\n)/)[lineNumber - 1];

					if( lineSource ){
						string+= lineSource;
						if( columnNumber ){
							string+= '\n' + new Array(columnNumber).join(' ') + '^';
						}
					}
				}
			}
			else{
				string+= '\n';
			}
		}

		string+= this.name;
		string+= ': ' + this.message;
		string+= this.stack;

		return string;
	}
};

function install(error){
	var stackTrace;

	stackTrace = StackTrace.create(error);

	if( is(error) && false === 'stackTrace' in error ){ // install once
		error.stackTrace = stackTrace;

		Object.keys(properties).forEach(function(key){
			Object.defineProperty(error, key, Object.getOwnPropertyDescriptor(properties, key));
		});
	}

	return stackTrace;
}

module.exports = {
	create: function(error){
		return StackTrace.create(error);
	},

	install: function(error){
		install(error);
		return error.stackTrace;
	}
};