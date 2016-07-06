/*
* @Author: foolishcui
* @Date:   2016-07-03 17:21:43
* @Last Modified by:   foolishcui
* @Last Modified time: 2016-07-04 11:27:35
*/

'use strict';var websocket = null;

//websocket连接
function connect() {

    //判断当前浏览器是否支持WebSocket
    if('WebSocket' in window){
      var  url="ws://172.20.10.7:8080/shiyan/websocket?username=${sessionScope.userid}";
      websocket = new WebSocket(url);
    }
    else{
      alert('Not support websocket');
    }

    //连接发生错误的回调方法
    websocket.onerror = function(){
    document.getElementById('message').innerHTML += '<div class="chat-message"><div class="chat-user-name-chat"></div><div class="message"><span>error</span></div></div>';
      //setMessageInnerHTML("error");
    };

    //连接成功建立的回调方法
    websocket.onopen = function(){
      document.getElementById('message').innerHTML += '<div class="chat-message"><div class="chat-user-name-chat"></div><div class="message"><span>open</span></div></div>';
        //setMessageInnerHTML("open");
    };

    //接收到消息的回调方法
    websocket.onmessage = function(event){
      setMessageInnerHTML(event.data);
    };

    //连接关闭的回调方法
    websocket.onclose = function(){
      //setMessageInnerHTML("close");
    };

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function(){
      websocket.close();
    };
}
//将消息显示在网页上
function setMessageInnerHTML(innerHTML){
    eval("var result="+innerHTML);
    var username=result.from;
    if(result.alert!==undefined){
        document.getElementById('message').innerHTML += '<div class="chat-message"><div class="chat-user-name-chat">'+username+'</div><div class="message"><span> '+result.alert+' </span></div></div>';
    }

    if(result.names != undefined) {
        $("#userList").html("");
        $(result.names).each(function() {
            $("userList").append('<li><a class="chat-user J_menuItem"><img class="chat-avatar" src="img/2.png" alt="" /><div class="chatonline chat-user-name-list">'+this +'</div></a></li>');
        });
    }

    if (result.from !== undefined) {
        if(result.messagetype==1) {
          document.getElementById('message').innerHTML += '<div class="chat-message"><div class="chat-user-name-chat"></div>'+username+'<div class="message"><span> '+result.sendMsg+' </span></div></div>';
        }else if(result.messagetype==2) {
          document.getElementById('message').innerHTML += '<div class="chat-message"><div class="chat-user-name-chat">李欢</div><form action="NewServlet" onsubmit="return fileName();"><div class="message"><span id="filename">'+result.sendMsg+'</span><button type="submit" class="doc-down btn btn-info" name="file" value='+result.sendMsg+'>下载</button><input type="hidden" id="getfilename" value="getfilename"></div></form></div></div>';
        }
    }

    lct = document.getElementById('message');
    lct.scrollTop=Math.max(0,lct.scrollHeight-lct.offsetHeight);
}

//关闭连接
function closeWebSocket(){
    var p = confirm("确定离开聊天室？");
    if(p==true) {
        window.location.href="login.html?backurl="+window.location.href;
        websocket.close();
    }
}

//发送消息
function send(){
    var val = $("#sendtext").val();
    var obj = null;

    if ($("input[type='radio']").is(":checked")){  //定一单选框
        var to = $(this).val();
        console.log(to);
        obj = {
            messaagetype :1, //文本
            to  :to,
            msg :val,
            type:2,  //1广播，2单聊
        };
    }else{
        console.log("asd");
        obj = {
            messagetype :1,//文本
            msg :val,
            type:1,  //1广播，2单聊
        };
    };

    var str = JSON.stringify(obj);  //js将对象转为json
    var sendtext = $('#sendtext');
    websocket.send(str);
    sendtext.val('');
    sendtext.focus();
}

//发送文件
function filesend(){
    var inputElement = document.getElementById('upfile');  //获取文件信息
    var fileList = inputElement.files;

    for ( var i = 0; i < fileList.length; i++) {
        var obj = null;
        if ($("input[type='radio']").is(':checked')){
            var to = $("input[name='onlinepeople']:checked").val();
            console.log("123");
            obj = {
                messagetype :2, //文件
                to  :to,
                msg :fileList[i].name,
                type:2,  //1广播，2单聊
                            //filename :,
            };
        }else{
            obj = {
                messagetype :2,//文件
                msg :fileList[i].name,
                type:1,  //1广播，2单聊
                           // filename :fileList[i].name,
            };
        };
        var str = JSON.stringify(obj);  //js将对象转为json
        websocket.send(str);
        var reader = new FileReader();
        reader.readAsArrayBuffer(fileList[i]);

        reader.onload = function loaded(evt) {
            var binaryString = evt.target.result;
            websocket.send(binaryString);
        };
    };

    var fileInput = $("#upfile");
    fileInput.replaceWith(fileInput.clone());
}

//enter发送消息
document.onkeydown=function(event){
    if(event.keyCode == 13 && event.ctrlKey){
        document.getElementById("sendtext").value += "\n";
    }else if(event.keyCode == 13){
        event.preventDefault();
        send();
    }
}

//更改聊天标题
$("div").on("click",".chatonline",function(){
    var chattitle = $(this).html();
        console.log(chattitle);
    $('div.chattitle').html(chattitle+'<b class="caret"></b>');
});

//改变标题
$("div").on("click",".chatonline",function(){
    var chattitle = $(this).html();
        console.log(chattitle);
    $('div.chattitle').html(chattitle+'<b class="caret"></b>');
});
