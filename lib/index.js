const url = require('url');
const querystring = require('querystring');
const _ = require('underscore');
const request = require('request');

module.exports = Cache;
/*
var cache = require('cachewatch');
var watch = cache();
watch.setToken('--My key--');

var opts = {
	// My Opts	
};
app.use(['/MyUrl'], cache('My Key', opts).watch);
app.use(cache('My Key', opts).watch);
app.use(cache('My Key').watch);
app.use(watch.watch);
*/

function Cache (key, opt) {
	if (!(this instanceof Cache))
		return new Cache(key, opt);

	if(key)
		this.setToken(key);

	this.config = _.defaults(opt || {}, {
		protocol :'https',
		fragment : '_escaped_fragment_',
		service : 'service.cache.watch',
		path : '/',
		method : 'get',
		lengths : 150,
		useragent : [
			// 'googlebot',
			// 'yahoo',
			// 'bingbot',
			'baiduspider',
			'facebookexternalhit',
			'twitterbot',
			'rogerbot',
			'linkedinbot',
			'embedly',
			'quora link preview',
			'showyoubot',
			'outbrain',
			'pinterest',
			'developers.google.com/+/web/snippet',
			'slackbot'
		],
		url : [
			'.js',
			'.css',
			'.xml',
			'.less',
			'.png',
			'.jpg',
			'.jpeg',
			'.gif',
			'.pdf',
			'.doc',
			'.txt',
			'.ico',
			'.rss',
			'.zip',
			'.mp3',
			'.rar',
			'.exe',
			'.wmv',
			'.doc',
			'.avi',
			'.ppt',
			'.mpg',
			'.mpeg',
			'.tif',
			'.wav',
			'.mov',
			'.psd',
			'.ai',
			'.xls',
			'.mp4',
			'.m4a',
			'.swf',
			'.dat',
			'.dmg',
			'.iso',
			'.flv',
			'.m4v',
			'.torrent'
		],
	});
	var that = this;

	that.watch = function CacheWatch (req, res, next){
		var query = querystring.parse(url.parse(req.url).query);
		if(that.isNot(req, query) || !that.key)
			return next();
		res.setHeader('CacheWatch', Cache.version);
		that.get(that.createUrl(req, query), function (err, resp, body) {
			if(err || that.res(resp))
				return next();
			res.setHeader('last-modified', resp.headers['last-modified']);
			res.setHeader('content-type', resp.headers['content-type']);
			res.send(body);
		});
	};

}

Cache.prototype.res = function (res) {
	if( res.body.length <= that.config.lengths || res.body == 'Unauthorized' )
		return true;

	var reg = new RegExp(this.config.service, 'gim');

	if( reg.test(res.body) || res.headers['content-type'] != 'text/html' )
		return true;

	return false;
};

Cache.prototype.get = function (url, callback) {
	request[ this.config.method ](url, callback);
};

Cache.prototype.getConfig = function (key) {
	return this.config[key];
};

Cache.prototype.setConfig = function (key, value) {
	this.config[key] = value;
	return this;
};

Cache.prototype.getToken = function (key) {
	return this.key;
};

Cache.prototype.setToken = function (value) {
	if(!value || typeof value != 'string')
		throw new Error('The key no exist');
	this.key = value;
	return this;
};

Cache.prototype.createUrl = function (req, query) {
	var urls = '://' + ( this.config.host || req.headers.host ) + req.url;
	var protocol;

	if ( req.headers['CF-Visitor'] ) {
		var match = req.headers['CF-Visitor'].match(/"scheme":"(http|https)"/);
		if (match) protocol = match[1];
	}

	if (req.headers['X-Forwarded-Proto'])
		protocol = req.headers['X-Forwarded-Proto'].split(',')[0];

	if( _.has(query, this.config.fragment) )
		urls += '#' + query[ this.config.fragment ];

	urls = ( protocol || this.config.protocol ) + urls;

	return url.format({
		protocol:  this.config.protocol,
		hostname : this.config.service,
		path : this.config.path,
		query : {
			access_token : this.key,
			u : url
		}
	});
};

Cache.prototype.isNot = function (req, query) {
	var userAgent = req.headers['user-agent'];

	if( req.method == 'GET' && _.has(query, this.config.fragment) )
		return false;

	if( _.find(this.config.useragent, function (item) {
		var reg = _.isRegExp(item) ? item : new RegExp(item, 'gim');
		return reg.test(userAgent);
	})) return false;

	if( _.find(this.config.url, function (item) {
		var reg = _.isRegExp(item) ? item : new RegExp(item, 'gim');
		return reg.test(req.url);
	})) return true;

	return true;
};

Cache.version = require('../package.json').version;