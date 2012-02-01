define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": ('epg-name-holder') }));
buf.push('><div');
buf.push(attrs({ "class": ('epg-details-name') }));
buf.push('>');
var __val__ = channelname
buf.push(null == __val__ ? "" : __val__);
buf.push('</div></div><div');
buf.push(attrs({ "class": ('epg-details-text') }));
buf.push('>');
 if (noData === true)
{
buf.push('<div');
buf.push(attrs({ "class": ('noData') }));
buf.push('>No EPG information</div>');
}
 else 
{
buf.push('<div');
buf.push(attrs({ "class": ('epg-details-info') }));
buf.push('><span');
buf.push(attrs({ "class": ('startTime') }));
buf.push('>');
var __val__ = startTime
buf.push(null == __val__ ? "" : __val__);
buf.push('</span><span>&nbsp;&nbsp;- </span><span');
buf.push(attrs({ "class": ('endTime') }));
buf.push('>');
var __val__ = endTime
buf.push(null == __val__ ? "" : __val__);
buf.push('</span></div><div');
buf.push(attrs({ "class": ('epg-details-title') }));
buf.push('>');
var __val__ = title
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
buf.push('</div>');
}
return buf.join("");
}return { render: anonymous }; });