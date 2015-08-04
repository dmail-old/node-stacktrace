var CallSite = require('./call-site');

exports['at repl:1:1'] = function(test){
	test.compare(CallSite.parseLine('at repl:1:1'), {
		functionName: 'repl',
		line: 1,
		column: 1
	});
};

