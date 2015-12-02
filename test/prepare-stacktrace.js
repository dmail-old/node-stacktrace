var StackTrace = require('../index.js');
var assert = require('assert');

var error = new Error();

StackTrace.install(error); // error.stack to the same

assert.equal('stackTrace' in error, true);
assert.equal(error.fileName, __filename);
assert.equal(error.lineNumber, 4);

/*
error.unshift({
	fileName: 'myfilename',
	lineNumber: 10,
	columnNumber: 5
});
*/