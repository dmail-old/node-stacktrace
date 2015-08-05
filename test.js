var CallSite = require('./call-site');

function parseLine(line){
	return CallSite.parseLine(line);
}

exports['at repl:1:1'] = function(test){
	test.deepEqual(parseLine('at repl:1:1'), {functionName: 'repl', line: 1, column: 1});
};

