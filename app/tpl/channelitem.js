define(["support/runtime"],function(jade){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": ('channelitem') }));
buf.push('>');
 if (channel.thumbnail.length > 4)
{
buf.push('<div');
buf.push(attrs({ "class": ('imgcont') }));
buf.push('><img');
buf.push(attrs({ 'src':(channel.thumbnail) }));
buf.push('/></div>');
}
 else 
{
buf.push('<div>No image</div>');
}
buf.push('</div>');
}
return buf.join("");
}return { render: anonymous }; });