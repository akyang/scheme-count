/** 
 * Scheme Interpreter in Javascript
 * Based on Peter Norvig's Lispy scheme interpreter
 */

import * from 'scheme_primitives';

// *** READER ***

// trim implementation from Shantanu Inamdar's Lisp2JS2
// removes whitespace from beginning and end
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};

// Parses scheme into an array of expressions
function parse(input) {
    var tokens = tokenize(input);
    var expressions = [];
    while (tokens.length) {
        expressions.push(read_from_tokens(next_expr(tokens)));
    }
    return expressions;
}

// builds the next expression
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

// tokenizes scheme code
function tokenize(input) {
    return input.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/g);
}

// builds expressions into its syntax tree
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
var HashMap = require("hashmap");

class Env extends HashMap {
    constructor(params=[], args=[], parent=undefined) {
        super(zip(params, args));
        this.parent = parent;
    }

    function find(name) {
        if (this.has(name)) {
            return this;
        } else if (this.parent) {
            return this.parent.find(name);
        } else {
            throw new ReferenceError(`${name} is not defined`);
        }
        throw new ReferenceError('expression not found');
    }
}

function zip(first, second) {
    return first.map(function(e, i) {
        return [e, second[i]];
    });
}

// *** EVALUATE/APPLY ***

function scheme_eval(expr, env) {
    if (scheme_symbolp(expr)) {
        return env.find(expr);
    } else if (self_evaluating(expr)) {
        return expr;
    }

    if (!scheme_listp(expr)) {
        throw new SyntaxError('malformed list');
    }
    var first = expr[0], rest = expr[1];
    if (scheme_symbolp(first) && special_forms.has(first)) {
        return special_forms[first](rest, env);
    } else {
        var operator = scheme_eval(first, env);
        var operands = rest.map(function(x) {
            return scheme_eval(x, env);
        });
        return scheme_apply(operator, operands, env);
    }
}

function scheme_apply(procedure, args, env) {
    check_procedure(procedure);
    return procedure.apply(args, env);
}

function self_evaluating(expr) {
    return scheme_atomp(expr) || scheme_stringp(expr) || expr || (=== undefined);
}

function check_procedure(procedure) {
    if (!scheme_procedurep(procedure)) {
        throw new ReferenceError('procedure not found');
    }
}

// *** SPECIAL_FORMS ***
var special_forms = new Map();
var special_forms_names = ['and', 'begin', 'cond', 'define', 'if', 'lambda', 'let', 'or', 'quote'];
var special_forms_functions = [do_and_form, do_begin_form, do_cond_form, do_define_form, do_if_form, do_lambda_form, do_let_form, do_or_form, do_quote_form];
for (var i = 0; i < special_forms_names.length; i++) {
    special_forms.set(special_forms_names[i], special_forms_functions[i]);
}

function do_define_form(expressions, env) {

}

function do_quote_form(expressions, env) {
    
}

function do_begin_form(expressions, env) {

}

function do_lambda_form(expressions, env) {

}

function do_if_form(expressions, env) {

}

function do_and_form(expressions, env) {

}

function do_or_form(expressions, env) {

}

function do_cond_form(expressions, env) {

}

function do_let_form(expressions, env) {

}

function make_let_frame(bindings, env) {

}

// *** PROCEDURES ***
function Procedure() {
    this.scheme_procedurep = function(x) {
        return x instanceof Procedure;
    }
}

// var repl = function (input) {
//  try {

//  } catch (e) {

//  }
// }
