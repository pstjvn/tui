define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": ('title') }));
buf.push('>');
 if (channel.thumbnail.length > 4)
{
buf.push('<div');
buf.push(attrs({ "class": ('imgcont') }));
buf.push('><img');
buf.push(attrs({ 'src':(channel.thumbnail) }));
buf.push('/></div><div');
buf.push(attrs({ "class": ('channel-name') }));
buf.push('>');
var __val__ = channel.publishName
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
 else 
{
buf.push('<div>');
var __val__ = channel.publishName
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
buf.push('<ul');
buf.push(attrs({ "class": ('channel-settings-icons') }));
buf.push('>');
 if (channel.isLocked)
{
buf.push('<li');
buf.push(attrs({ "class": ('icon') + ' ' + ('locked') }));
buf.push('></li>');
}
 if (channel.isBookmarked)
{
buf.push('<li');
buf.push(attrs({ "class": ('icon') + ' ' + ('bookmarked') }));
buf.push('></li>');
}
 if (channel.cost > 0) 
{
buf.push('<li');
buf.push(attrs({ "class": ('icon') + ' ' + ('paid') }));
buf.push('></li>');
}
buf.push('</ul></div>');
}
return buf.join("");
}return { render: anonymous }; });