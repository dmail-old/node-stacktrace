var CallSite = require('./call-site');

function parseLine(line){
	return CallSite.parseLine(line);
}

var lines = {
	'at repl:1:1' : {fileName: 'repl', line: 1, column: 1},
	'at REPLServer.defaultEval (repl.js:132:27)' : {methodName: 'defaultEval', fileName: 'repl.js', line: 132, column: 27},
	'at REPLServer.runBound [as eval] (domain.js:267:12)' : {methodName: 'runBound', functionName: 'eval', fileName: 'domain.js', line: 267, column: 12},
	'at eval (eval at <anonymous> (file.js:4:2), <anonymous>:1:1)' : {functionName: 'eval', fileName: 'file.js', line: 4, column: 2, evalFileName: null, evalLineNumber: 1, evalColumnNumber: 1}
};

exports['parsing'] = function(test){
	Object.keys(lines).forEach(function(line){
		test.compareProperties(parseLine(line), lines[line]);
	});
};

