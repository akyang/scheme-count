// *** PRIMITIVE OPERATIONS ***

var PRIMITIVES = [];
var add_primitives = [];

/* Given primitive method utilizing @property
function primitive(...names) {
    function add(fn) {
        for (var i = 0; i < names.length; i++) {
            PRIMITIVES.push([names[i], fn, names[0]]);
        }
        return fn;
    }
    return add;
}
*/

// Each pair in primitive_pairs will have form [name, function]
function primitive(...primitive_pairs) {
    for (var i = 0; i < primitive_pairs.length; i++) {
        PRIMITIVES.push([primitive_pairs[i][0], primitive_pairs[i][1]]);
    }
}

function check_type(val, predicate, k, name) {
    if (predicate(val)) {
        return val;
    }
    throw new TypeError(`argument ${k} of ${name} has wrong type ${typeof val}`);
}

function scheme_booleanp(x) {
    return (x === true) || (x === false);
}
add_primitives.push(["boolean?", scheme_booleanp]);

function scheme_truep(val) {
    return val !=== false;
}

function scheme_falsep(val) {
    return val === false;
}

function scheme_not(x) {
    return !scheme_truep(x);
}
add_primitives.push(["not", scheme_not]);

function scheme_equalp(x, y) {
    if (scheme_pairp(x) && scheme_pairp(y)) {
        return scheme_eqp(x.first, y.first) && scheme_eqp(x.second, y.second);
    } else if (scheme_numberp(x) && scheme_numberp(y)) {
        return x === y;
    } else {
        return (typeof x === typeof y) && (x === y);
    }
}
add_primitives.push(["equal?", scheme_equalp]);

function scheme_eqp(x, y) {
    if (scheme_numberp(x) && scheme_numberp(y)) {
        return x === y;
    } else {
        return (typeof x === typeof y) && (x === y);
    }
}
add_primitives.push(["eq?", scheme_eqp]);

function scheme_pairp(x) {
    return x instanceof Pair;
}
add_primitives.push(["pair?", scheme_pairp]);

function scheme_promisep(x) {
    return typeof x === 'Promise';
}
add_primitives.push(["promise?", scheme_promisep]);

function scheme_force(x) {
    check_type(x, scheme_promisep, 0, 'promise');
    return x.evaluate();
}
add_primitives.push(["force", scheme_force]);

function scheme_cdr_stream(x) {
    check_type(x, function(x) {
        return scheme_pairp(x) && scheme_promisep(x.second);
    }, 0, 'cdr-stream');
    return scheme_force(x.second);
}
add_primitives(["cdr-stream", scheme_cdr_stream]);

function scheme_nullp(x) {
    return x instanceof nil;
}
add_primitives(["null?", scheme_nullp]);

function scheme_listp(x) {
    while (!(x instanceof nil)) {
        if (!(x instanceof Pair)) {
            return false;
        }
        x = x.second;
    }
    return true;
}
add_primitives(["list?", scheme_listp]);

function scheme_length(x) {
    check_type(x, scheme_listp, 0, 'length');
    if (x instanceof nil) {
        return 0;
    }
    return x.length;
}
add_primitives(["length", scheme_length]);

function scheme_cons(x, y) {
    return Pair(x, y);
}
add_primitives(["cons", scheme_cons]);

function scheme_car(x) {
    check_type(x, scheme_pairp, 0, 'car');
    return x.first;
}
add_primitives(["car", scheme_car]);

function scheme_cdr(x) {
    check_type(x, scheme_pairp, 0, 'cdr');
    return x.second;
}
add_primitives(["cdr", scheme_cdr]);

function scheme_list(...vals) {
    var result = new nil();
    var reversed = reversed(vals);
    for (var i = 0; i < reversed.length; i++) {
        result = Pair(reversed[i], result);
    }
    return result;
}
add_primitives(["list", scheme_list]);

function scheme_append(...vals) {
    if (vals.length === 0) {
        return new nil();
    }
    var result = vals[vals.length - 1];
    for (var i = vals.length - 2; i > -1; i--) {
        var v = vals[i];
        if (!(v instanceof nil)) {
            check_type(v, scheme_pairp, i, 'append');
            var r = Pair(v.first, result);
            var p = r;
            v = v.second;
            while (scheme_pairp(v)) {
                p.second = Pair(v.first, result);
                p = p.second;
                v = v.second;
            }
            result = r;
        }
    }
    return result;
}
add_primitives(["append", scheme_append]);

function scheme_stringp(x) {
    return (x instanceof String) && x.startswith('"');
}
add_primitives(["string?", scheme_stringp]);

function scheme_symbolp(x) {
    return (x instanceof String) && !(scheme_stringp(x));
}
add_primitives(["symbol?", scheme_symbolp]);

function scheme_numberp(x) {
    return (x instanceof Number) && !(scheme_booleanp(x));
}
add_primitives(["number?", scheme_numberp]);

function scheme_integerp(x) {
    return scheme_numberp(x) && Math.round(x) === x;
}
add_primitives(["integer?", scheme_integerp]);

function _check_nums(...vals) {
    var enumerated = enumerate(vals);
    var i;
    var v;
    for (var n = 0; i < enumerated.length; i++) {
        i = enumerated[n][0];
        v = enumerated[n][1];
        if (!scheme_numberp(v)) {
            throw new TypeError(`${v} has wrong type ${typeof v}`);
        }
    }
}

function _arith(fn, init, vals) {
    _check_nums(vals);
    var s = init;
    for (var i = 0; i < vals.length; i++) {
        s = fn(s, vals[i]);
    }
    if (Math.round(s) === s) {
        s = Math.round(s);
    }
    return s;
}

function scheme_add(...vals) {
    return _arith(operator.add, 0, vals);
}
add_primitives(["+", scheme_add]);

function scheme_sub(val0, ...vals) {
    _check_nums(vals0, vals);
    if (vals.length === 0) {
        return -val0;
    }
    return _arith(operator.sub, val0, vals);
}
add_primitives(["-", scheme_sub]);

function scheme_mul(...vals) {
    return _arith(operator.mul, 1, vals);
}
add_primitives(["*", scheme_mul]);

function scheme_div(val0, ...vals) {
    _check_nums(val0, vals);
    try {
        if (vals.length === 0) {
            return 1 / val0;
        }
        return _arith(operator.truediv, val0, vals);
    }
    catch(err) {
        throw new Error('zeroDivisionError');
    }
}
add_primitives(["/", scheme_div]);

function scheme_expt(val0, val1) {
    _check_nums(val0, val1);
    return Math.pow(val0, val1);
}
add_primitives(["expt", scheme_expt]);

function scheme_abs(val0) {
    return Math.abs(val0);
}
add_primitives(["abs", scheme_abs]);

function scheme_quo(val0, val1) {
    _check_nums(val0, val1);
    try {
        return Math.trunc(val0 / val1);
    }
    catch(err) {
        throw new Error('zeroDivisionError');
    }
}
add_primitives(["quotient", scheme_quo]);

function scheme_modulo(val0, val1) {
    _check_nums(val0, val1);
    try {
        return val0 % val1;
    }
    catch(err) {
        throw new Error('zeroDivisionError');
    }
}
add_primitives(["modulo", scheme_modulo]);

function scheme_remainder(val0, val1) {
    _check_nums(val0, val1);
    try {
        var result = val0 % val1;
    }
    catch(err) {
        throw new Error('zeroDivisionError');
    }
    while (result < 0 && val0 > 0 || result > 0 && val0 < 0) {
        result -= val1;
    }
    return result;
}
add_primitives(["remainder", scheme_remainder]);

function number_fn(module, name) {
    var js_fn = module.getAttribute(name);
    function scheme_fn(...vals) {
        _check_nums(vals);
        return js_fn(vals);
    }
    return scheme_fn;
}

function copysign(x, y) {
    if (y < 0) {
        return -Math.abs(x);
    }
    return Math.abs(x);
}

function degrees(x) {
    return x * 180 / Math.PI;
}

function radians(x) {
    return x * Math.PI / 180;
}

var mathjs_fn_names = ["acos", "acosh", "asin", "asinh", "atan", "atan2", "atanh",
                         "ceil", "cos", "cosh", "floor", "log", "log10", "log1p",
                         "log2", "sin", "sinh", "sqrt", "tan", "tanh", "trunc"];
var non_mathjs_fn_names = ["copysign", "degrees", "radians"];
var non_mathjs_fns = [copysign, degrees, radians];

function set_functions(mathjs_names, non_mathjs_names, non_mathjs_fns) {
    for (var i = 0; i < mathjs_names.length; i++) {
        add_primitives([mathjs_names[i], number_fn(Math, mathjs_names[i])]);
    }
    for (var j = 0; j < non_mathjs_names.length; j++) {
        add_primitives([non_mathjs_names[j], non_mathjs_fns[i]]);
    }
}
set_functions(mathjs_fn_names, non_mathjs_fn_names, non_mathjs_fns);

function _numcomp(op, x, y) {
    _check_nums(x, y);
    return op(x, y);
}

function scheme_eq(x, y) {
    return _numcomp(operator.eq, x, y);
}
add_primitives(["=", scheme_eq]);

function scheme_lt(x, y) {
    return _numcomp(operator.lt, x, y);
}
add_primitives(["<", scheme_lt]);

function scheme_gt(x, y) {
    return _numcomp(operator.gt, x, y);
}
add_primitives([">", scheme_gt]);

function scheme_le(x, y) {
    return _numcomp(operator.le, x, y);
}
add_primitives(["<=", scheme_le]);

function scheme_ge(x, y) {
    return _numcomp(operator.ge, x, y);
}
add_primitives([">=", scheme_ge]);

function scheme_evenp(x) {
    _check_nums(x);
    return x % 2 === 0;
}
add_primitives(["even?", scheme_evenp]);

function scheme_oddp(x) {
    _check_nums(x);
    return x % 2 === 1;
}
add_primitives(["odd?", scheme_oddp]);

function scheme_zerop(x) {
    _check_nums(x);
    return x === 0;
}
add_primitives(["zero?", scheme_zerop]);

function scheme_atomp(x) {
    return scheme_booleanp(x) || scheme_numberp(x)
           || scheme_symbolp(x) || scheme_nullp(x);
}
add_primitives(["atom?", scheme_atomp]);

function scheme_display(val) {
    if (scheme_stringp(val)) {
        val = eval(val);
    }
    document.write(String(val));        // *** in Python, print() ***
}
add_primitives(["display", scheme_display]);

function scheme_print(val) {
    document.write(String(val));        // *** in Python, print() ***
}
add_primitives(["print", scheme_print]);

function scheme_newline() {
    document.write("\n");               // *** or document.write("<br>"); for HTML
}
add_primitives(["newline", scheme_newline]);

function scheme_error(msg = undefined) {
    if (msg === undefined) {
        throw new Error();
    } else {
        throw new Error(String(msg));
    }
}
add_primitives(["error", scheme_error]);

function scheme_exit() {
    throw new Error('EOF Error');
}
add_primitives(["exit", scheme_exit]);

// Adds all primitive functions to PRIMITIVES
primitive(add_primitives);

function nil() {
    function map(fn) {
        return this;
    }
}
