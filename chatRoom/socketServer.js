/**
 * Created by hxsd on 2016/12/9.
 */
// 引入socket.io模块
var socketIO = require("socket.io");    // 黄牛
var messageArr=[];
module.exports = function(httpServer){
    // 让socket.io服务器监听web服务器
    var socketServer = socketIO.listen(httpServer);

    // socket服务器会监听所有客户端的连接请求
    // 当有客户端连接请求到达时，会触发一个"connect"事件
    // 每一个客户端请求，服务器端都会创建一个新的socket对象，负责和对方通信
    socketServer.on("connect",function(socket){
        console.log("有新的客户端连接:" + socket.id);


        // 向客户端发送消息:
        // 有两个方法：send-发送的是默认叫做"message"的消息,
        //             emit-发送自定义名称的消息
        // 以下方法的两个参数：参数1:消息名称;参数2:消息内容
        //socket.emit("hello","欢迎您，新朋友!");

        // 服务器socket监听客户端发过来的消息
        socket.on("message",function(data){
            // 提取收到的消息的类型
            var type = data.type;
            // 根据收到的消息类型，作用不同的处理
            switch(type){
                case "101": // 用户登录消息
                    messageArr.push(data);
                    handleUserLogin(socket,data);
                    break;
                case "201": // 用户公共聊天信息
                    handleChatMsg(socket,data);
                    break;
            }
        });

        // 监听客户端断开连接的消息 - disconnect
        socket.on("disconnect",function(){
            for(var i=0;i<messageArr.length;i++){
                var messageArrs=messageArr[i];

                if(messageArrs.nickname==socket.nickname){
                    messageArr.splice(i,1);

                    console.log(messageArr);
                    var message = {
                        type: "102",    // 用户离开聊天室
                        nickname: socket.nickname,
                        messageArr:messageArr
                    };
                    // 把用户离开的消息群发(包括该用户的昵称)
                    socket.broadcast.send(message);
                    break;
                }
            }
        });
    });

    // 处理用户发过来的公共聊天信息
    function handleChatMsg(socket,data){
        // 群发该消息:先构造消息的数据结构
        var message = {
            type: "201",    // 是聊天信息
            content: data.content,
            nickname: socket.nickname,   // 从scoket中取出登录时保存的昵称
            pic:socket.pic
        };
        socket.broadcast.send(message);


        // 将消息发给自己
        message.type = "200";   // 表示是自己进入了聊天室
        socket.send(message);   // 谁登录，发给谁
    }

    // 处理用户登录的方法
    function handleUserLogin(socket,data){
        // 保存用户的昵称到socket对象中
        socket.nickname = data.nickname;
        socket.gender=data.gender;
        socket.pic=data.pic;

        // 构造一个群发的消息格式，
        var content = {
            type: "101",    // 有新用户进入聊天室
            nickname: data.nickname,
            gender: data.gender,
            pic:data.pic,
            messageArr:messageArr
        };

        // 将新用户登录的消息群发给聊天室内所有的用户
        // socket.broadcast.send会群发消息给所有的客户端socket，除了自己
        socket.broadcast.send(content);

        // 将消息发给自己
        content.type = "100";   // 表示是自己进入了聊天室
        socket.send(content);   // 谁登录，发给谁
    }
};
