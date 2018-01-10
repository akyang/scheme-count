// Scheme Interpreter in Javascript

String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, '');
}

// var parse = function (input) {
// 	return read_from_tokens(tokenize(input));
// }

// var read_from_tokens = function () {
// 	if ()
// }

var tokenize = function (input) {
	input = input.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
	return input.trim().split(/\s+/g);
}

// var repl = function (input) {
// 	try {

// 	} catch (e) {

// 	}
// }
