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

## License

The MIT License (MIT)

Copyright (c) 2013 AlejoNext <serice@cache.watch>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
