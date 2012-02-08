define(["support/runtime", "utils/datetime"],function(jade, datetime){function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ "class": (((channel.thumbnail !== null)? "leftCont" : "leftContLong")) }));
buf.push('>');
 if (channel.sortIndex !== '0' && channel.sortIndex !== 0 )
{
buf.push('<h1');
buf.push(attrs({ "class": ('number_id') }));
buf.push('>');
var __val__ = channel.id
buf.push(null == __val__ ? "" : __val__);
buf.push('</h1>');
}
 else 
{
buf.push('<h1');
buf.push(attrs({ "class": ('number_id') }));
buf.push('></h1>');
}
buf.push('<h2');
buf.push(attrs({ "class": ('item_name') }));
buf.push('>');
var __val__ = channel.publishName
buf.push(null == __val__ ? "" : __val__);
buf.push('</h2>');
 if (channel.genre)
{
buf.push('<div');
buf.push(attrs({ "class": ('description') }));
buf.push('>');
var __val__ = "Genre:" + channel.genre
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
 if (channel.time)
{
buf.push('<div');
buf.push(attrs({ "class": ('description') }));
buf.push('>');
var __val__ = "Time:" + datetime.parseTimeFromSeconds( channel.time )
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
 if (channel.cost)
{
buf.push('<div');
buf.push(attrs({ "class": ('description') }));
buf.push('>');
var __val__ = "Cost:" + channel.cost
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
 if (channel.size) 
{
buf.push('<div');
buf.push(attrs({ "class": ('description') }));
buf.push('>');
var __val__ = "Size:" + channel.size
buf.push(null == __val__ ? "" : __val__);
buf.push('</div>');
}
buf.push('</div>');
 if (channel.isDir !== false) 
{
buf.push('<div');
buf.push(attrs({ "class": ('rightCont-folder') }));
buf.push('></div>');
}
 else if (channel.thumbnail.length > 5)
{
buf.push('<div');
buf.push(attrs({ "class": ('rightCont') }));
buf.push('><img');
buf.push(attrs({ 'src':(channel.thumbnail), "class": ('img_thumb') }));
buf.push('/></div>');
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
buf.push('</ul>');
}
return buf.join("");
}return { render: anonymous }; });