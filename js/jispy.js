/** 
 * Scheme Interpreter in Javascript
 * Based on Peter Norvig's Lispy scheme interpreter
 */


// *** READER ***

// trim from Shantanu Inamdar's Lisp2JS2
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};

function parse(input) {
    var tokens = tokenize(input);
    var expressions = [];
    while (tokens.length) {
        expressions.push(read_from_tokens(next_expr(tokens)));
    }
    return expressions;
}

function next_expr(tokens) {
    var expression = [tokens.shift()];
    var nests = 0;
    while (tokens[0] !== ")" || nests !== 0) {
        var token = tokens.shift();
        if (tokens.length === 0) {
            throw new SyntaxError("unexpected EOF missing )");
        }
        if (token === "(") {
            nests++;
        } else if (token === ")") {
            nests--;
        }
        expression.push(token);
    }
    expression.push(tokens.shift());    // push last ")"
    return expression;
}

function tokenize(input) {
    return input.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/g);
}

function read_from_tokens(tokens) {
    if (tokens.length === 0) {
        throw new SyntaxError("unexpected EOF while reading");
    }
    var token = tokens.shift();
    if (token === "(") {
        var L = [];
        while (tokens[0] != ")") {
            L.push(read_from_tokens(tokens));
        }
        tokens.shift();    // pop off ")"
        return L;
    } else if (token === ")") {
        throw new SyntaxError('unexpected )');
    } else {
        return atom(token);
    }
}

function atom(token) {
    if (isNaN(token)) {
        return token;
    } else {
        return +token;
    }
}

// *** ENVIRONMENTS ***
class Env {
    constructor(params=[], args=[], parent=undefined) {
        this.bindings = new Map(zip(params, args));
        this.parent = parent;
    }
    function find(name) {
        if (this.bindings.has(name)) {
            return this;
        } else {
            return this.parent.find(name);
        }
    }
}

function zip(first, second) {
    return first.map(function(e, i) {
        return [e, second[i]];
    });
}

// *** EVALUATOR ***

function scheme_eval(expr, env) {

}

function scheme_apply(procedure, args, env) {

}


// var repl = function (input) {
//  try {

//  } catch (e) {

//  }
// }
