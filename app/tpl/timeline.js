define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<for>( var a = 0; a < 24; a++ )<span');
buf.push(attrs({ '"class": hours + a':(true) }));
buf.push('>;</span></for>');
}
return buf.join("");
}return { render: anonymous }; });