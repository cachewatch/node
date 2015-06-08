const url = require('url');
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
			'.js$',
			'.css$',
			'.xml$',
			'.less$',
			'.png$',
			'.jpg$',
			'.jpeg$',
			'.gif$',
			'.pdf$',
			'.doc$',
			'.txt$',
			'.ico$',
			'.rss$',
			'.zip$',
			'.mp3$',
			'.rar$',
			'.exe$',
			'.wmv$',
			'.doc$',
			'.avi$',
			'.ppt$',
			'.mpg$',
			'.mpeg$',
			'.tif$',
			'.wav$',
			'.mov$',
			'.psd$',
			'.ai$',
			'.xls$',
			'.mp4$',
			'.m4a$',
			'.swf$',
			'.dat$',
			'.dmg$',
			'.iso$',
			'.flv$',
			'.m4v$',
			'.torrent$'
		],
	});
}

Cache.prototype.watch = function (req, res, next){
	if(!this.isGet(req))
		return next();

	res.setHeader('CacheWatch', Cache.version);
	var that = this;
	that.get(that.createUrl(req), function (err, resp, body) {
		if(err || that.res(resp))
			return next();
		res.setHeader('last-modified', resp.headers['last-modified']);
		res.setHeader('content-type', resp.headers['content-type']);
		res.send(body);
	});
};

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

Cache.prototype.createUrl = function (req) {
	var query = url.parse( (this.host || req.get('host') ) + req.url );
	query.access_token = this.key;

	if (req.get('CF-Visitor')) {
		var match = req.get('CF-Visitor').match(/"scheme":"(http|https)"/);
		if (match) query.protocol = match[1];
	}

	if (req.get('X-Forwarded-Proto'))
		query.protocol = req.get('X-Forwarded-Proto').split(',')[0];

	if( _.has(query.query, this.config.fragment) ){
		query.hash = '#' + query.query[ this.config.fragment ];
		delete query.query[ this.config.fragment ];
	}

	if(!query.protocol)
		query.protocol = this.config.protocol;

	return url.format({
		protocol:  this.config.protocol,
		hostname : this.config.service,
		path : this.config.path,
		query : _.omit(query, function (value, key) {
				return _.isEmpty(value) || key == 'href';
			})
	});
};

Cache.prototype.isGet = function (req) {
	var userAgent = req.headers['user-agent'],
		parsedQuery = url.parse(req.url, true).query;

	if( req.method == 'GET' && _.has(parsedQuery, this.config.fragment) )
		return true;

	if( _.find(this.config.useragent, function (item) {
		var reg = _.isRegExp(item) ? item : new RegExp(item, 'gim');
		return reg.test(userAgent);
	})) return true;

	if( !_.find(this.config.url, function (item) {
		var reg = _.isRegExp(item) ? item : new RegExp(item, 'gim');
		return reg.test(req.url);
	})) return true;

	return false;
};

Cache.version = require('../package.json').version;