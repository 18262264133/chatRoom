/**
 * Created by xunxi on 2016/12/11.
 */
$(function(){
    //鼠标移动在头像中时,显示选择头像提示
    $(".head_portrait").hover(function(){
        $(".remand").show();
    },function(){
        $(".remand").hide();
    });

    //点击头像,从弹出div中选择其他头像
    var allpic="";      //储存图片
    for(var i=1;i<37;i++){      //循环,找到所有的图片
        allpic+='<div><img src="images/pic'+i+'.jpg"></div>';
    }
    //把找到的图片插入的到change_head中
    $("#change_head").append(allpic);
    //给头像绑定点击事件
    $(".head_portrait").on("click",function(){
        $("#change_head").show();
        $("#change_head div").on("click", function () {
            //把选中的头像路径替换
            var thispic=$(this).find("img").eq(0).attr("src");
            $(".head_portrait").find("img").attr("src",thispic);
            //然后隐藏change_head
            $("#change_head").hide();
        })

    });

    //给性别添加一个点击事件,增加一个类
    $(".sex").find("div").on("click",function(){
        $(this).css("border-color","red").siblings().css("border-color","transparent");
        $(this).addClass("selected").siblings().removeClass("selected");
    });
//--------------------------------------------------------------------------

    // 标志变量，标志用户是否已登录
    var isLogin = false;

    // 和socket服务器建立连接，获得客户端的socket对象
    // 会发起向服务器的连接请求
    var clientSocket = io();

    // 监听服务器端发过来的消息
    clientSocket.on("hello", function (data) {
        alert("服务器端说：" + data);
    });

    // 客户端socket监听服务器发过来的消息
    clientSocket.on("message", function (data) {
        var type = data.type;   // 提交消息类型
        // 根据消息类型，作出相应的处理
        switch (type) {
            case "100": // 自己已经登入聊天室
                isLogin = true;
                showChatPanel(data);    // 显示聊天面板
                otherInfor(data);
                break;
            case "101": // 系统消息，有新用户进入聊天室
                if(isLogin) showWelcomeMsg(data);
                otherInfor(data);
                break;
            case "102": // 系统消息，有用户离开聊天室
                if(isLogin) showUserLeave(data);
                otherInfor(data);
                break;
            case "200": // 自身的聊天信息
                if(isLogin) showSelfChatMsg(data);
                break;
            case "201": // 群发的其他用户聊天信息
                if(isLogin) showChatMsg(data);
                break;
        }
    });

    //------------------------------------------------------------------
    // 滚动窗口的函数
    function scroll(){
        // 有多远，滚多远
        $("#show").scrollTop($("#show").prop("scrollHeight"))
    }

    // 在聊天窗口显示用户离开聊天室的消息
    function showUserLeave(data){
        // 在聊天界面给出提示信息
        var welcome = "<div class=''>[系统消息]" + data.nickname + "离开了聊天室</div>";
        $("#show").append(welcome);
        scroll();   // 滚动窗口到最底部
    }

    // 在聊天窗口显示自己身的聊天信息
    function showSelfChatMsg(data){
        // 在聊天界面给出提示信息
        var welcome = "<div class='message'><div class='selfMsg'>" + data.content + "<img src="+data.pic+"></div></div>";
        $("#show").append(welcome);
        scroll();   // 滚动窗口到最底部
    }

    // 在聊天窗口显示其他用户的聊天信息
    function showChatMsg(data){
        // 在聊天界面给出提示信息
        var welcome = "<div class='other'><img src="+data.pic+">" + data.content + "</div>";
        $("#show").append(welcome);

        scroll();   // 滚动窗口到最底部
    }

    // 在聊天窗口显示欢迎新用户的消息
    function showWelcomeMsg(data){
        // 在聊天界面给出提示信息
        var welcome = "<div class='loginMsg'>[系统消息]欢迎新用户," + data.nickname + "</div>";
        $("#show").append(welcome);

        scroll();   // 滚动窗口到最底部
    }

    // 显示聊天界面的函数
    function showChatPanel(data) {
        // 隐藏登录界面
        $("#register").hide();

        // 显示聊天界面
        $("#chat").show();

        // 在聊天界面给出提示信息
        var welcome = "<div class='loginMsg'>[系统消息]您已进入聊天室，请文明聊天!</div>";
        $("#show").append(welcome);
        /*
         //在侧边栏显示自己的头像，性别，名字
         var mh="<div><img src="+data.pic+"></div>";
         $(".myHead").append(mh);
         $(".myName").html(data.nickname);
         var ms="<div><img src="+data.gender+"></div>";
         $(".mySex").append(ms);
         */
    }


    // 响应用户登录事件
    $("#btn").on("click", function () {
        // 获取用户输入的昵称
        var nickname = $.trim($("#login").val());

        // 对昵称进行合法性验证(格式(是否为空..),有效性) - 略
        if(nickname==""){
            alert("请输入昵称");
            return;
        }

        var genders=$(".sex div").find("img").prop("src");

        $(".sex").find("div").each(function(){
            if($(this).attr("class").indexOf('selected')!=-1){
                genders=$(this).find("img").attr("src");
            }
        });
        // 构造要发给服务器端的消息内容
        var content = {
            type: "101",    // 代表用户登录
            nickname: nickname,
            gender: genders,
            pic:$(".head_portrait").find("img").prop("src")
        };

        // 发送登录信息给服务器端
        clientSocket.send(content); // send默认发送的是"message"
    });

    // 发送聊天内容
    $("#send").on("click",function(){
        // 获取用户输入的聊天内容
        var content = $.trim($("#message").val());

        // 非空验证、敏感词过滤等，略
        if(content==""){
            alert("请输入内容");
            return;
        }

        // 发送给服务器端：先构造要发送的消息结构
        var message = {
            type: "201",    // 类型是公共聊天内容
            content: content
        };
        clientSocket.send(message);

        // 清空输入框
        $("#message").val("");
    });

    // 回车发送聊天内容
    $("#message").on("keyup",function(e){
        // 判断是否按下了回车键
        if(e.keyCode == 13){
            $("#send").click();
        }
    });

    function otherInfor(data){
        $("#otherStatus").html("");
        $(".pepNum i").html("");
        for(var i=0;i<data.messageArr.length;i++){
            var otherPic="<div class='otherPic'><img src="+data.messageArr[i].pic+"></div>";
            var otherName="<div class='otherName'>"+data.messageArr[i].nickname+"</div>";
            var otherSex="<div class='otherSex'><img src="+data.messageArr[i].gender+"></div>";
            $("#otherStatus").append("<div>"+otherPic+otherName+otherSex+"</div>");
        }
        $(".pepNum i").append("<span>"+data.messageArr.length+"</span>")
    }

});
