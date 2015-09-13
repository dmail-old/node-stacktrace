var parse = require('../lib/stack-parse.js');
var assert = require('assert');

var stacks = [	
	{
		string: 'Error\n\tat repl:1:1',
		name: 'Error',
		message: '',
		trace: 'at repl:1:1'
	},
	{
		string: 'Error: message\n\tat ensureEvaluated (file with space.js:2108:26)',
		name: 'Error',
		message: 'message',
		trace: 'at ensureEvaluated (file with space.js:2108:26)'
	},
	{
		string: 'AssertionError: thenable expected : code is not FUSED\n\tat ensureEvaluated (assertion.js!transpiled:74:18)',
		name: 'AssertionError',
		message: 'thenable expected : code is not FUSED',
		trace: 'at ensureEvaluated (assertion.js!transpiled:74:18)'
	},
	{
		string: 'Error: message\n\tat repl:1:1\n\tat repl:1:1',
		name: 'Error',
		message: 'message',
		trace: 'at repl:1:1\n\tat repl:1:1'
	}
];

stacks.forEach(function(stack){
	var parts = parse(stack.string);

	assert.equal(parts.name, stack.name);
	assert.equal(parts.message, stack.message);
	assert.equal(parts.trace, stack.trace);
});

