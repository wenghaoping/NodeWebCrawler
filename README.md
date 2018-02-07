[个人博客地址]
 (http://www.wenghaoping.com/)
# NodeWebCrawler
第一次学习爬虫
爬小说，爬取的是我最喜欢的一步小说，
感兴趣的人，可以clone看看。
可以的话，star呀
# 先上代码，然后在慢慢逼逼 #
 [Git地址，有需要的Clone](https://github.com/wenghaoping/NodeWebCrawler)

==先从小说网站开始练手，然后爬电影网站，可以下最新的电影，这是我的需求。哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈==
演示：

![图片](https://i.imgur.com/rLBXyex.png)

![图片](https://i.imgur.com/qPkOIYS.png)
# 大致流程 #
1 获取 URLs 列表(请求资源 request 模块)
2 根据 URLs 列表获取相关页面源码(可能遇到页面编码问题，iconv-lite 模块)
3 源码解析，获取小说信息( cheerio 模块)
4 保存小说信息到 txt 文件，并且加适当修饰以及章节信息(写文件 fs)
# 具体 #
根据小说的导航页，获取到当前章节，然后获取链接

首选通过 http.get() 方法获取页面源码
获取到源码，打印发现中文乱码，查看发现 charset = 'gbk'，需要进行转码
使用 iconv-lite 模块进行转码，中文显示正常后开始解析源码，获取需要的 URL，
为了更方便地解析，需要引进 cheerio 模块，cheerio 可以理解为运行在后台的 jQuery，用法与 jQuery 也十分相似，熟悉 jQuery 的同学可以很快的上手

```javascript
// 请求标题
let titleRequest = (url) => {
    return new Promise((resolve, reject) => {
        //采用http模块向服务器发起一次get请求
        http.get(url, function (res) {
            let html = '';        //用来存储请求网页的整个html内容
            //监听data事件，每次取一块数据
            res.on('data', function (chunk) {
                html += iconv.decode(chunk, 'GBK');
            });
            //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
            res.on('end', function () {
                let $ = cheerio.load(html); //采用cheerio模块解析html
                // 总的长度
                endNumber = $('#list a').length;
                let title = $('#list a').eq(number).text();
                let mainUrl = baseUrl + $('#list a').eq(number).attr('href');
                let item = {
                    // 小说标题
                    title: title,
                    // 小说详情
                    mainUrl: mainUrl,
                    //i是用来判断获取了多少篇文章
                    i: number
                }
                // console.log(item);     //打印新闻信息
                resolve(item);
            });
        }).on('error', function (err) {
            console.log(err);
            reject(err);
        });
    });
};

```

将源码加载进 cheerio，分析了源码后得知所有章节信息都存于被 div 包裹的 a 标签中，通过 cheerio 取出符合条件的 a 标签组，进行遍历，获取章节的 title 和 URL，保存为对象，存进数组，(因为链接中存储的 URL 不完整，所以存储时需要补齐)
然后在写一个获取详情的爬虫
```javascript
// 请求内容
let mainRequest =  (mainUrl) => {
    return new Promise((resolve, reject) => {
        //采用http模块向服务器发起一次get请求
        http.get(mainUrl, function (res) {
            let html = '';        //用来存储请求网页的整个html内容
            //监听data事件，每次取一块数据
            res.on('data', function (chunk) {
                html += iconv.decode(chunk, 'GBK');
            });
            //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
            res.on('end', function () {
                let $ = cheerio.load(html); //采用cheerio模块解析html
                let detail = $('#content').text().replace(/\s+/g,"\r\n\r\n　　　　");
                // console.log(detail);     // 打印详情
                resolve(detail);
            });
        }).on('error', function (err) {
            console.log(err);
            reject(err);
        });
    });
}
```


```javascript
const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
let baseUrl='http://www.biquge.com.tw';// 笔趣阁公共地址
let url='http://www.biquge.com.tw/3_3142/';// 笔趣阁 《我当方士那些年》 首页  ===== 要变小说，只需要更改此处地址就可以
let urlOne = 'http://www.biquge.com.tw/3_3142/1788029.html'; // 笔趣阁 《我当方士那些年》 第一章地址 测试用
let number = 0; // 请求次数
let endNumber = 0; // 总数  或者可以控制爬取次数。

// 开始请求，并且写入数据
let startRequest =  async function(url) {
    let title = await titleRequest(url);
    let detail = await mainRequest(title.mainUrl);
    console.log(`开始爬取 ${title.title}`);
    number++;
    await savedContent('./data/', `${number} ${title.title}`, detail);
    console.log(`写入 ${title.title}`);
    if (number <= endNumber) {
        startRequest(url);
    } else {
        console.log('===========================全部完成===========================');
    }
};


// 在本地存储
let savedContent = (path, title, detail) => {
    fs.appendFile(path + title + '.txt', detail, (err) => {
        if (err) {
            console.log(err);
        }
    });
}
// 请求标题
let titleRequest = (url) => {
    return new Promise((resolve, reject) => {
        //采用http模块向服务器发起一次get请求
        http.get(url, function (res) {
            let html = '';        //用来存储请求网页的整个html内容
            //监听data事件，每次取一块数据
            res.on('data', function (chunk) {
                html += iconv.decode(chunk, 'GBK');
            });
            //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
            res.on('end', function () {
                let $ = cheerio.load(html); //采用cheerio模块解析html
                // 总的长度
                endNumber = $('#list a').length;
                let title = $('#list a').eq(number).text();
                let mainUrl = baseUrl + $('#list a').eq(number).attr('href');
                let item = {
                    // 小说标题
                    title: title,
                    // 小说详情
                    mainUrl: mainUrl,
                    //i是用来判断获取了多少篇文章
                    i: number
                }
                // console.log(item);     //打印新闻信息
                resolve(item);
            });
        }).on('error', function (err) {
            console.log(err);
            reject(err);
        });
    });
};

// 请求内容
let mainRequest =  (mainUrl) => {
    return new Promise((resolve, reject) => {
        //采用http模块向服务器发起一次get请求
        http.get(mainUrl, function (res) {
            let html = '';        //用来存储请求网页的整个html内容
            //监听data事件，每次取一块数据
            res.on('data', function (chunk) {
                html += iconv.decode(chunk, 'GBK');
            });
            //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
            res.on('end', function () {
                let $ = cheerio.load(html); //采用cheerio模块解析html
                let detail = $('#content').text().replace(/\s+/g,"\r\n\r\n　　　　");
                // console.log(detail);     // 打印详情
                resolve(detail);
            });
        }).on('error', function (err) {
            console.log(err);
            reject(err);
        });
    });
}
// 开始执行
startRequest(url);
```

cheerio是一个node的库，可以理解为一个Node.js版本的jquery，用来从网页中以 css selector取数据，使用方式和jquery基本相同。







::: hljs-center


来加我啊

:::



