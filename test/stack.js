var StackTrace = require('../index.js');
var assert = require('assert');

var stacks = [
	/*
	{
		string: 'Error\n\tat repl:1:1',
		name: 'Error',
		message: ''
	},
	*/
	{
		string: 'Error: message\n\tat ensureEvaluated (file with space.js:2108:26)',
		name: 'Error',
		message: 'message'
	},
	{
		string: [
			'AssertionError: thenable has rejected but actual has 1 differences with expected : code is not ECONNRFUSED',
			'at ensureEvaluated (file:///C:/Users/Damien/Documents/GitHub/system-test/lib/assertion.js!transpiled:74:18)'
		].join('\n\t'),
		name: 'AssertionError',
		message: 'thenable has rejected but actual has 1 differences with expected : code is not ECONNRFUSED'
	}
];

stacks.forEach(function(stack){
	var stackTrace = StackTrace.create({
		stack: stack.string
	});

	assert.equal(stackTrace.name, stack.name);
	assert.equal(stackTrace.message, stack.message);
	assert.equal(stackTrace.stack, stack.string);
});

