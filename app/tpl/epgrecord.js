define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<span');
buf.push(attrs({ 'style':('left:'+ leftOffset + 'px;width:' + widthByDuration + 'px;'), 'data-index':(epgRecordIndex), "class": ('p') }));
buf.push('><div');
buf.push(attrs({ 'style':('display: block; overflow: hidden; width:' + ( widthByDuration - 20 ) + 'px;'), "class": ('bordered') }));
buf.push('><div>');
var __val__ = progTitle
buf.push(null == __val__ ? "" : __val__);
buf.push('</div></div></span>');
}
return buf.join("");
}return { render: anonymous }; });