const KEY = "ax2mmmjj9djmevka9gr4gbua90w76dk4f1a56dkb6nvpwy3raxb0";
const pack = require('../package.json');
const chai = require("chai");

var sendTo = '';
var expect = chai.expect;
var should = chai.should();

var cache = require("../lib");
var _ = require('underscore');

describe("CacheWatch", function(){

	describe("#getToken() & #setToken()", function (argument) {
		var cachewatch = cache();

		it("Is Null", function(done) {
			expect(cachewatch.key).to.deep.equal(undefined);
			done();
		});

		it("Is a instance", function(done) {
			cachewatch.setToken(KEY);
			expect( cachewatch.getToken() ).to.deep.equal(KEY);
			done();
		});
	});

	describe("#getConfig() & #setConfig()", function (argument) {
		var cachewatch = cache();
		var configs = {
			key : ["protocol", "fragment", "service", "path", "sender", "auth", "lengths", "useragent", "url"],
			master : {
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
			},
			change : {
				protocol : "http",
				fragment : "blas",
				path : "/blas",
				useragent : _.sample(pack.config.useragent, _.random(1, pack.config.useragent.length) ),
				auth : 'x-auth',
				url : _.sample(pack.config.extencion, _.random(1, pack.config.extencion.length) ),
				lengths : 10,
				sender : {
					method : 'post'
				}
			}
		};

		for (var i = configs.key.length - 1; i >= 0; i--) {
			it("Is " + configs.key[i], function (done) {
				expect(cachewatch.getConfig(configs.key[i])).to.deep.equal(configs.master[configs.key[i]]);
				cachewatch.setConfig(configs.key[i], configs.change[configs.key[i]]);
				expect(cachewatch.getConfig(configs.key[i])).to.deep.equal(configs.change[configs.key[i]]);
				done();
			});
		}
	});

	describe("#isNot()", function (argument) {
		var cachewatch = cache();
		var send = {
			query : {
				'_escaped_fragment_' : 'blas'
			},
			req : {
				method : 'GET',
				headers : {
					'user-agent' : _.sample(pack.config.useragent)
				},
				url : '/bla' + _.sample(pack.config.extencion)
			}
		};

		it("Is method & fragment", function(done) {
			expect(cachewatch.isNot(send.req, send.query)).to.deep.equal(false);
			done();
		});

		it("Is useragent", function(done) {
			expect(cachewatch.isNot(send.req, {})).to.deep.equal(false);
			done();
		});

		it("Is extencion", function(done) {
			var clone = _.clone(send);
			clone.req.headers['user-agent'] = {};

			expect(cachewatch.isNot(clone.req, {})).to.deep.equal(true);
			done();
		});

		it("Is all", function(done) {
			var clone = _.clone(send);
			clone.req.headers['user-agent'] = {};
			clone.req.url = '/';
			expect(cachewatch.isNot(clone.req, {})).to.deep.equal(true);
			done();
		});

	});

	describe("#createUrl()", function (argument) {
		var cachewatch = cache();
		var send = {
			fragment : _.sample([ '/blas', '/blas?other=blas', '/blas/bla']),
			forHeader : [
			],
			master : "https://service.cache.watch/" ,
			pro : _.sample(['http', 'https']),
			query : {
			},
			req : {
				headers : {
					host : _.sample(['angularjs.org', 'cache.watch', 'alejonext.co'] ),
				},
				url : '/'
			}
		};

		send.forHeader.push({
			name : 'CF-Visitor',
			value : '"scheme":"' + send.pro  + '"'
		});

		send.forHeader.push({
			name : 'X-Forwarded-Proto',
			value : send.pro
		});

		for (var i = send.forHeader.length - 1; i >= 0; i--) {	
			var thatHeader = send.forHeader[i];

			it("Is headers " + thatHeader.name, function(done) {
				var clone = _.clone(send);

				clone.req.headers[ thatHeader.name ] = thatHeader.value;
				clone.master += clone.pro + '://'  + clone.req.headers.host + clone.req.url;
				if(_.random(0,1))
					sendTo = clone.master; 
				expect(cachewatch.createUrl(clone.req, clone.query)).to.deep.equal(clone.master);
				done();
			});
		};

		it("Is headers query", function(done) {
			send.query['_escaped_fragment_'] = send.fragment;
			send.master += send.pro + '://'  + send.req.headers.host + send.req.url + encodeURIComponent( "#" + send.fragment );
			if(!sendTo) sendTo = send.master; 
			expect(cachewatch.createUrl(send.req, send.query)).to.deep.equal(send.master);
			done();
		});

	});

	describe("#get()", function (argument) {
		var cachewatch = cache(KEY);

		it("Run the function", function(done) {
			console.log(sendTo);
			cachewatch.get(sendTo, function (err, data) {
				should.not.exist(err);
				expect(data.request.href).to.deep.equal(sendTo);
				expect(data.status).to.deep.equal(202);
				done();
			});
		});
	});

	describe("#res()", function (argument) {
		var cachewatch = cache(KEY);

		it("Unauthorized", function(done) {
			cachewatch.setToken("blas");
			cachewatch.get(sendTo, function (err, data){
				should.not.exist(err);
				expect(cachewatch.res(data)).to.deep.equal(true);
			});
		});

		it("All", function(done) {
			cachewatch.get(sendTo, function (err, data) {
				should.not.exist(err);
				expect(cachewatch.res(data)).to.deep.equal(false);
				done();
			});
		});
	});
});
