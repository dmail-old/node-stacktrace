var regexp = /^(\w+)(?:\: (.+))?(?:\n\s+(at[^$]+))?$/;

function parse(stack){
	var match = stack.match(regexp);
	var parts = {
		name: '',
		message: '',
		trace: ''
	};

	if( match ){
		parts.name = match[1];
		parts.message = match[2] || '';
		parts.trace = match[3] || '';
	}
	
	return parts;
}

module.exports = parse;