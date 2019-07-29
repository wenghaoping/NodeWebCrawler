// 我当方士那些年爬虫
'use strict'
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
let baseUrl='https://www.qu.la/book/2915/';// 笔趣阁公共地址
let url='https://www.qu.la/book/2915/';// 笔趣阁 《我当方士那些年》 首页  ===== 要变小说，只需要更改此处地址就可以
let urlOne = 'http://www.biquge.com.tw/3_3142/1788029.html'; // 笔趣阁 《我当方士那些年》 第一章地址 测试用
let number = 0; // 请求次数

// 开始请求，并且写入数据
let startSave = async function (){
	// 获取所有标题以及内容的地址，整合成一个json，这样标题获取一次就好了，和上次比，少了好多好多请求。
	let urlArr = await titleRequest(url);
	for(let i = 0; i < urlArr.length; i++) {
		number++;
		console.log(`开始爬取 ${urlArr[i].title}`);
		// 开始获取单章内容
		let mainDetail = await mainRequest(urlArr[i].mainUrl);
		console.log(`写入 ${urlArr[i].title}`);
		await savedContent('./data/', `${number} ${urlArr[i].title}`, mainDetail);
	}
	console.log('===========================全部完成===========================');
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
		console.log('开始请求'+ url);
		//采用http模块向服务器发起一次get请求
		https.get(url, function (res) {
			let html = '';        //用来存储请求网页的整个html内容
			//监听data事件，每次取一块数据
			res.on('data', function (chunk) {
				// document.charset 查看编码格式
				html += iconv.decode(chunk, 'UTF-8');
			});
			let allData = [];
			//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
			res.on('end', function () {
				let $ = cheerio.load(html); //采用cheerio模块解析html
				$('#list a').each(function(index, item){
					let title = $(this).text();
					let mainUrl = $(this).attr('href');
					let itemData = {
						// 小说标题
						title: title,
						// 小说详情
						mainUrl: baseUrl + mainUrl,
						//i是用来判断获取了多少篇文章
						i: number
					};
					allData.push(itemData);
				});
				// console.log(allData);     //打印新闻信息
				resolve(allData);
			});
		}).on('error', function (err) {
			console.log(err);
			reject(err);
		});
	});
};

// 请求内容
let mainRequest = (mainUrl) => {
	return new Promise((resolve, reject) => {
		//采用http模块向服务器发起一次get请求
		https.get(mainUrl, function (res) {
			let html = '';        //用来存储请求网页的整个html内容
			//监听data事件，每次取一块数据
			res.on('data', function (chunk) {
				html += iconv.decode(chunk, 'UTF-8');
			});
			//监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
			res.on('end', function () {
				let $ = cheerio.load(html); //采用cheerio模块解析html
				let detail = $('#content').text().replace(/\s+/g,"\r\n\r\n　　　　");
				// console.log(detail);     // 打印详情
				resolve(detail);
			});
			html = '';
		}).on('error', function (err) {
			console.log(err);
			reject(err);
		});
	});
};

startSave();
