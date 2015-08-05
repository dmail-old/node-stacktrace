var CallSite = require('./call-site');

function parseLine(line){
	return CallSite.parseLine(line);
}

exports['at repl:1:1'] = function(test){
	test.deepEqual(parseLine('at repl:1:1'), {fileName: 'repl', line: 1, column: 1});
};

exports['eval at <anonymous> (path\\file.js:4:2), <anonymous>:1:1)'] = function(test){
	test.deepEqual(parseLine('eval at <anonymous> (path\\file.js:4:2), <anonymous>:1:1)'), {functionName: 'eval', line: 4, column: 2});
};

