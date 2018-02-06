// 我当方士那些年爬虫

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