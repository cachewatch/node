const url = require('url');
const querystring = require('querystring');
const _ = require('underscore');
const request = require('request');
const pack = require('../package.json');

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
		sender : {
		    method : 'get',
			headers: {
				'User-Agent': 'CacheWatch Client'
			},
		},
		auth :  'x-cache-watch',
		lengths : 150,
		useragent : pack.config.useragent,
		url : pack.config.extencion
	});

	var that = this;

	that.watch = function CacheWatch (req, res, next){
		var query = querystring.parse(url.parse(req.url).query);
		if(that.isNot(req, query) || !that.key)
			return next();

		that.get(that.createUrl(req, query), function (err, resp, body) {
			if(err || that.res(resp))
				return next();

			res.setHeader('CacheWatch', Cache.version);
			res.setHeader('last-modified', resp.headers['last-modified']);
			res.setHeader('content-type', resp.headers['content-type']);
			res.send(body);
		});
	};

}

Cache.prototype.res = function (res) {
	if( res.body.length <= this.config.lengths || /Unauthorized/gim.test(res.body) )
		return true;

	var reg = new RegExp(this.config.service, 'gim');

	if( reg.test(res.body) || res.headers['content-type'] != 'text/html' )
		return true;

	return false;
};

Cache.prototype.get = function (url, callback) {
    var sendes = _.clone(this.config.sender);
    sendes.uri = url;
    sendes.headers[this.config.auth] = this.key;
    request(sendes, callback);
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
	if(_.isEmpty(value) || !_.isString(value))
		return new Error('The key no exist');
	this.key = value;
	return this;
};

Cache.prototype.createUrl = function (req, query) {
	var urls = '://' + ( this.config.host || req.headers.host ) + req.url;
	var protocol = 'http';

	if ( req.headers['CF-Visitor'] ) {
		var match = req.headers['CF-Visitor'].match(/"scheme":"(http|https)"/);
		if (match) protocol = match[1];
	}

	if (req.headers['X-Forwarded-Proto'])
		protocol = req.headers['X-Forwarded-Proto'].split(',')[0];

	if( _.has(query, this.config.fragment) )
		urls += encodeURIComponent( '#' + query[ this.config.fragment ] );

	return url.format({
		protocol: this.config.protocol,
		host : this.config.service,
		pathname : this.config.path + protocol + urls
	});

	enc
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

Cache.version = pack.version;