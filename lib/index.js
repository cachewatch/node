const packages = require('../package.json');
const url = require('url');
const _ = require('underscore');
const request = require('request');

var cacheWatch = function(req, res, next){
	if(cacheWatch.isNot(req))
		return next();

	var send = request.get(cacheWatch.createUrl(req));

	send.on('response', function(response) {
		if( response.statusCode === 200 )
			return send.pipe(res);
		next();
  	});
};

cacheWatch.key = function (key) {
	this.set('key', key);
	return this;
};

cacheWatch.listTrue = function (name, x) {
	this.set( name + 'Trues', _.isArray(x) ? x : [x] );
	return this;
};

cacheWatch.listFalse = function (name, x) {
	this.set( name + 'Falses', _.isArray(x) ? x : [x] );
	return this;
};

cacheWatch.createUrl = function (req) {
	var query = url.parse( (this.host || req.get('host') ) + req.url );
	query.access_token = this.key;

	if (req.get('CF-Visitor')) {
		var match = req.get('CF-Visitor').match(/"scheme":"(http|https)"/);
		if (match) query.protocol = match[1];
	}

	if (req.get('X-Forwarded-Proto'))
		protocol = req.get('X-Forwarded-Proto').split(',')[0];

	if( _.has(query.query, this.config.fragment) ){
		query.hash = '#' + query.query[ this.config.fragment ];
		delete query.query[ this.config.fragment ];
	}

	return {
		protocol:  'https',
		hostname : 'service.cache.watch',
		path : '/put',
		query : _.omit(query, function (value, key) {
				return _.isEmpty(value) || key == 'href';
			})
	};
};

cacheWatch.isNot = function (req) {
	var userAgent = req.headers['user-agent'],
		parsedQuery = url.parse(req.url, true).query;

	if(!userAgent || req.method == 'GET' && req.method == 'HEAD' || _.has(parsedQuery, this.config.fragment) ) )
		return true;

	if( _.find(this.config.useragents, function (item) {
		var reg = _.isRegExp(item) ? item : new RegExp(item, 'igm');
		return reg.test(userAgent);
	})) return true;

	if(_.find(this.config.url, function (item) {
		var reg = _.isRegExp(item) ? item : new RegExp(item, 'gim');
		return reg.test(userAgent);
	})) return true;

	return false;
};

cacheWatch.set = function (a, b) {
	this.config[a] = b;
	return this;
};


cacheWatch.config = {
	fragment : '_escaped_fragment_',
	key : '',
	useragentsTrue : [
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
};

cacheWatch.version = packages.version;
cacheWatch.name = packages.version;

module.exports = cacheWatch;