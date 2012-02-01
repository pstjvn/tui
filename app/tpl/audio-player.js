define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": ('audio-pannel') }));
buf.push('><div');
buf.push(attrs({ "class": ('audio-display') }));
buf.push('><div');
buf.push(attrs({ "class": ('audio-icons') }));
buf.push('><div');
buf.push(attrs({ "class": ('play') }));
buf.push('></div></div><div');
buf.push(attrs({ "class": ('audio-bar') }));
buf.push('><div');
buf.push(attrs({ "class": ('audio-fill-cutter') }));
buf.push('><div');
buf.push(attrs({ 'style':('left:-100%;'), "class": ('audio-fill-bar') }));
buf.push('></div></div><div');
buf.push(attrs({ "class": ('audio-bar-bg') }));
buf.push('></div></div><div');
buf.push(attrs({ "class": ('audio-time') }));
buf.push('><span></span><span>/</span><span></span></div></div><div');
buf.push(attrs({ "class": ('audio-title') }));
buf.push('></div></div>');
}
return buf.join("");
}return { render: anonymous }; });