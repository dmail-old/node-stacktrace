var fs = require('fs');
var CallSite = require('./lib/callsite.js');
var parseStack = require('./lib/stack-parse.js');

function is(error){
	return error && typeof error.stack === 'string';
}

var StackTrace = {
	constructor: function(error){
		var callSites;

		if( typeof error === 'string' ){
			error = {stack: error};
		}

		if( is(error) ){
			this.stack = error.stack;
			if( 'origin' in error && typeof error.origin == 'object' ){
				this.unshift(error.origin);
			}
			this.error = error;

			// this.name = error.name;
			//this.message = error.message;
			/*
			if( error.fileName ){
				Object.defineProperty(this, 'fileName', {value: error.fileName});
			}
			if( error.lineNumber ){
				this.lineNumber = error.lineNumber;
				Object.defineProperty(this, 'lineNumber', {value: error.fileName});
			}
			if( error.columnNumber ){
				this.columnNumber = error.columnNumber;
			}
			*/
		}
		else{
			this.callSites = [];
		}
	},

	create: function(){
		var stackTrace = Object.create(this);
		stackTrace.constructor.apply(stackTrace, arguments);
		return stackTrace;
	},

	get stack(){
		var stack = '';

		stack+= this.name;
		if( this.message ) stack+= ': ' + this.message;
		stack+= this.callSites.map(function(callSite){ return '\n\tat ' + String(callSite); }).join('');

		return stack;
	},

	set stack(value){
		var parts = parseStack(value);

		this.name = parts.name;
		this.message = parts.message;
		this.trace = parts.trace;

		this.callSites = this.trace.split('\n').map(function(line){
			return CallSite.parse(line);
		});
	},

	get fileName(){
		return this.callSites[0] ? this.callSites[0].getFileName() : null;
	},

	/*
	set fileName(value){
		if( !this.calllSites[0] ) this.callSites[0] = CallSite.create();
		this.calllSites[0].fileName = value;
	},
	*/

	get lineNumber(){
		return this.callSites[0] ? this.callSites[0].getLineNumber() : null;
	},

	get columnNumber(){
		return this.callSites[0] ? this.callSites[0].getColumnNumber() : null;
	},

	forEach: function(fn, bind){
		this.callSites.forEach(fn, bind);
	},

	unshift: function(origin){
		var originCallSite = CallSite.create(origin);
		this.callSites.unshift(originCallSite);
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
				if( columnNumber ) string+= ':' + columnNumber;
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
							string+= '\n';
							var i = 0, j = columnNumber -1, char;
							for(;i<j;i++){
								char = lineSource[i];
								// keep \t and space but replace others by spaces
								string+= char === ' ' || char === '\t'  ? char : ' ';
							}
							string+= '^';
						}
					}
				}
			}
			else{
				string+= '\n';
			}
		}

		string+= this.stack;

		return string;
	}
};

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
		return this.stackTrace.stack;
	},

	set stack(value){
		this.stackTrace.stack = value;
	},

	unshift: function(origin){
		this.stackTrace.unshift(origin);
	},

	toString: function(){
		return this.stackTrace.toString();
	}
};

function install(error){
	var stackTrace;

	if( is(error) ){
		if( 'stackTrace' in error ){ // install once
			stackTrace = error.stackTrace;
		}
		else{			
			stackTrace = StackTrace.create(error);
			error.stackTrace = stackTrace;

			Object.keys(properties).forEach(function(key){
				Object.defineProperty(error, key, Object.getOwnPropertyDescriptor(properties, key));
			});
		}
	}
	else{
		stackTrace = StackTrace.create(error);
	}

	return stackTrace;
}

module.exports = {
	properties: properties,

	create: function(error){
		return StackTrace.create(error);
	},

	install: function(error){
		return install(error);
	}
};