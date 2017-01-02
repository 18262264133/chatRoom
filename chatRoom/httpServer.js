/**
 * Created by hxsd on 2016/11/11.
 *
 * 消息的类型：
 * 1xx: 系统消息
 *     100: 自己登录
 *     101: 用户登录
 *     102: 用户离开
 *     103: ...
 * 2xx: 用户聊天消息
 *     200: 自己的聊天内容
 *     201: 用户公开聊天内容
 *     202: 用户私聊内容
 *     203: ...
 *
 * 定义好消息的格式：
 * {
 *    type: "101",
 *    nickname: "张三",
 *    gender: "男",
 *    state: "忙碌",
 *    pic: "aa.jpg"
 * }
 * {
 *    type: "201",
 *    content: "早上好",
 *    ...
 * }
 *
 * 客户端和服务器之间的数据传送格式我们采用json
 * socket.io会自动将json转为js对象
 */
var http = require("http");
var path = require("path");
var express = require("express");

var app = express();

// 处理对静态资源的请求
var publicPath = path.resolve(__dirname,"public");

app.use(express.static(publicPath));  // 使用中间件

var httpServer = http.createServer(app);

// 运行socket服务器
require("./socketServer")(httpServer);

httpServer.listen(5000,function(){
    console.log("服务器正运行在5000端口...");
});


