# [CacheWatch](https://cache.watch/) for node

Search engines and social networks are constantly checking your website, but many do not run Javascript. [CacheWatch](https://cache.watch/). Solves this problem, with this plugin, you can send the Javascirpt and executed.

This uses some libraries to build a middleware between your website and spidersweb. It is perfect when angularjs SEO, SEO BackboneJS, EmberJS SEO, and any other javascript framework used.

You can use or not

	<meta name="fragment" content="!">

To learn more about

* [How works?](http://developer.cache.watch/)
* [Rates?](https://cache.watch/info/plans)

## Install

```
$ npm install cachewatch
```

## Use

```javascript
var Cache = require('cachewatch');
app.use(Cache('-- KEY --').watch);
```