define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<span');
buf.push(attrs({ 'style':('left:'+ leftOffset + 'px;width:' + widthByDuration + 'px;'), "class": ('p') }));
buf.push('>!= progTitle</span>');
}
return buf.join("");
}return { render: anonymous }; });