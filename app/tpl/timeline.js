define(["support/runtime", "utils/datetime"],function(jade, datetime){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
 for (var a = 0; a < hours; a++, start++)
{
buf.push('<span');
buf.push(attrs({ 'style':("width:" + (pixelsPerHour - 9 )+ 'px;'), "class": ('anhour') }));
buf.push('>');
var __val__ = start + ':00'
buf.push(null == __val__ ? "" : __val__);
buf.push('</span>');
}
}
return buf.join("");
}return { render: anonymous }; });