define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<span');
buf.push(attrs({ 'style':('left:'+ leftOffset + 'px;width:' + widthByDuration + 'px;'), "class": ('p') }));
buf.push('><div');
buf.push(attrs({ 'style':('display: table;width: 100%;height: 100%;') }));
buf.push('><div');
buf.push(attrs({ "class": ('title-container') }));
buf.push('><div');
buf.push(attrs({ 'style':('width:' + (widthByDuration - 4) + 'px; margin: auto;'), "class": ('title-holder') }));
buf.push('>');
var __val__ = progTitle
buf.push(null == __val__ ? "" : __val__);
buf.push('</div></div></div><div');
buf.push(attrs({ "class": ('title-background') }));
buf.push('></div></span>');
}
return buf.join("");
}return { render: anonymous }; });