define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": ('epg-details') }));
buf.push('><div');
buf.push(attrs({ "class": ('epg-details-logo') }));
buf.push('></div><div');
buf.push(attrs({ "class": ('epg-details-text') }));
buf.push('></div></div>');
}
return buf.join("");
}return { render: anonymous }; });