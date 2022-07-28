let _appUrl="https:/"+"/ai.boozang.com",inReload,
    _masterTabId,_masterFrameId,_masterUrl,_ctrlTabId,_ctrlWindowId,curElement,_frameIds={0:1},
    _bzEnvCode,_css,_status=_newStatus=0,_lastExeActionReq,_doingPopCtrl,_curTest,_data,_curAction,_shareData={},_ctrlFrameId;
let _lastErrPage=0,_loadPageInfo,assignfirmeCall,ignoreReqs="",_topFrameId=0,_uncodeFrames=[];
let _ignoreList=["https://vars.hotjar.com"],_lastIframeRequest=0,_dblCheckTime=0,extendTopScript="",extendEndScript="";
let funMap={
  cleanMaster:function(){
    cleanMaster()
  },
  // storeEventGroupData:function(bkScope,bkFun,data){
    // for(var k in data){
      // _lastExeActionReq[k]=data[k]
    // }
  // },
  getExtensions:function(bkScope,bkFun,v,_callback){
    // let blockExtensions={
      // "kbfnbcaeplbcioakkpcpgfkobkghlhen":"Grammarly"
    // }
    //try to find extension: Grammarly, it cause performance issue!
    chrome.management.getAll(vs=>{
      _callback(vs.filter(x=>{
        return x.enabled
      }))
    })
  },
  loadImg:function(s,f,v,t,e,bkFun){
    let img=document.createElement("img")
//    document.body.append(img)
    img.src=v

    let c=document.createElement("canvas")
//    document.body.append(c)
    c.width=img.width
    c.height=img.height
    let cc=c.getContext("2d")
    cc.drawImage(img,0,0)

    img.onload=function(x){
      x=c.toDataURL()
      console.log(x)
      bkFun(x)
//      chrome.tabs.sendMessage(t.id, {scope:s,fun:f,data:{url:c.toDataURL()}});
      c.remove()
      img.remove()
    }
  },
  openWindow:function(s,f,d){
    chrome.windows.create(d)
  },
  isRequestCompleted:function(bkScope,bkFun,_rList){
    _rList.forEach((r,i)=>{
      var v=_responseList[r]
      if(v){
        delete _responseList[r]
        _rList[i]=funMap.buildRequestData(v)
      }else{
        _rList[i]=null
      }
    })
    chrome.tabs.sendMessage(_masterTabId, {tab:"master",scope:bkScope,fun:bkFun,data:{result:!Object.keys(_list).length,data:_rList}},r=>{});
  },
  postRequest:function(v,scope,fun){
    if(["main_frame","xmlhttprequest"].includes(v.type)){
      v=funMap.buildRequestData(v)
      var id=v.requestId
      if(fun=="addReq"){
        _list[id]=v
      }else{
        delete _list[id]
        _responseList[id]=v
      }
      chrome.tabs.sendMessage(_masterTabId, {tab:"master",scope:scope,fun:fun,data:v},r=>{});
    }
  },
  buildRequestData:function(v){
    return {
      requestId:v.requestId,
      url:v.url,
      timeStamp:v.timeStamp,
      statusCode:v.statusCode,
      type:v.type,
      method:v.method
    }
  },
  enableAllIframe:function(){
    _initFrame(0)
    _uncodeFrames.forEach(f=>{_initFrame(f)})
  },
  ajax:function(scope,fun,data,_callback,element,responseFun){
    let asFile=data.notDownloadAsFile
    delete data.notDownloadAsFile
    let hs={},d={
      data:{
        headers:hs
      },
      fun:fun,
      scope:scope,
      tab:"master"
    }
    if(data.contentType){
      data.headers=data.headers||{}
      data.headers["Content-Type"]=data.contentType
      delete data.contentType
    }
    delete data.cache
    data.body=data.body||data.data
    delete data.data
    fetch(data.url,data).then(r=>{
      for (var k of r.headers.entries()) {
        hs[k[0]]=k[1]
      }
      d.data.status=r.status
      if(data.responseType=="arraybuffer"&&!asFile){
        return r.blob()
      }else{
        return r.text()
      }
    }).then(dd=>{
      if(data.responseType=="arraybuffer"&&!asFile){
        return dd.arrayBuffer()
      }else{
        d.data.data=dd;
        if(data.responseType&&this.response){
          d.data.data=String.fromCharCode.apply(null, new Uint8Array(this.response));
        }
        if(_callback&&_callback.constructor==Function){
          _callback(d.data)
        }else if(responseFun){
          responseFun(d.data)
        }
      }
    }).then(dd=>{
      if(data.responseType=="arraybuffer"&&!asFile){
        let o=_handleBold(dd,data.url)
        if(_callback&&_callback.constructor==Function){
          _callback(o)
        }else if(responseFun){
          responseFun(o)
        }
      }
    })
    // var xhttp = new XMLHttpRequest();
    // xhttp.onreadystatechange = function() {
    //   if (this.readyState == 4) {
    //     if(data.responseType=="arraybuffer"&&!asFile){
    //       let o=_handleBold(this.response,data.url)
    //       if(_callback&&_callback.constructor==Function){
    //         _callback(o)
    //       }else if(responseFun){
    //         responseFun(o)
    //       }
    //     }else{
    //       let hs={}
    //       this.getAllResponseHeaders().split("\n").forEach(x=>{
    //         if(x){
    //           let k=x.indexOf(":")
    //           let v=x.substring(k+1)
    //           hs[x.substring(0,k).trim()]=v.trim()
    //         }
    //       })
          
    //       var d={
    //         tab:"master",
    //         scope:scope,
    //         fun:fun,
    //         data:{status:this.status,data:this.response,headers:hs},
            
    //       }
    //       if(data.responseType&&this.response){
    //         d.data.data=String.fromCharCode.apply(null, new Uint8Array(this.response));
    //       }
    //       if(_callback&&_callback.constructor==Function){
    //         _callback(d.data)
    //       }else if(responseFun){
    //         responseFun(d.data)
    //       }
    //     }
    //   }
    // };
    // xhttp.open(data.method, data.url, true);
    // for(var k in data.headers){
    //   xhttp.setRequestHeader(k,data.headers[k])
    // }
    // if(data.responseType){
    //   xhttp.responseType = data.responseType;
    // }
    // xhttp.send(data.data);

    function _handleBold(blob,_url){
      var str=_handleCodePoints(new Uint8Array(blob));
      
      //var str = String.fromCharCode.apply(null, new Uint8Array(blob));
      //var str=new TextDecoder("utf-8").decode(new Uint8Array(blob));
      var v=_url.split("/");
      var n=v.pop()||v.pop()

      var t=n.split(".").pop()||"";
      if(["jpg","png","svg","bmp","gif","jpeg","ico"].includes(t)){
        t="image/"+t;
      }else if("txt"==t){
        t="plant/text"
      }else{
        t="application/"+t;
      }
      return [{
        size:str.length,
        name:n,
        base64Link:"data:"+t+";base64,"+_b64EncodeUnicode(str),
        lastModified:Date.now(),
        lastModifiedDate:new Date(),
        webkitRelativePath:"",
        type:t
      }];
    }
    function _handleCodePoints(array) {
      var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
      var index = 0;
      var length = array.length;
      var result = '';
      var slice;
      while (index < length) {
        slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
      }
      return result;
    }

    function _b64EncodeUnicode(str) {
      try{
        return btoa(str)
      }catch(e){
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode('0x' + p1);
        }));
      }
    }
  },
  getScreenshot:function(bkScope,bkFun,d,t,element){
    let offset={
      left:0,
      top:0
    }
    chrome.tabs.captureVisibleTab((t&&t.tab.windowId)||_ctrlWindowId,(img) => {
      let vs=getIframePath(element||curElement)||[]
      findOffset(vs,img)
    })
    
    function findOffset(vs,img){
      if(vs.length){
        chrome.tabs.sendMessage(_ctrlTabId,{bz:1,findOffset:vs},function(r){
          offset.left+=r.left;
          offset.top+=r.top
          vs.pop()
          findOffset(vs,img)
        });
      }else{
        chrome.tabs.sendMessage((t&&t.tab.id)||_masterTabId, {
          tab:(t&&t.tab.id)||"master",
          scope:bkScope,
          fun:bkFun,
          data:{imgUrl:img,offset:offset}
        },r=>{});
      }
    }
  },
  conIde:function(_req, _sender, _callback) {
    //_console("background (web page): ",_req)
    //check whether the request from BZ pages. If not from BZ do nothing.
    if(!_req.bz){
      return;
    }
    //check whether the request from BZ client web page
    if(_req.bg){
      return funMap[_req.fun](_req.bkScope,_req.bkFun,_req.data,_callback)
    }else if(_req.twPage){
      if(_req.tab=="master"){
  //      _req.frameId=[0];
        delete _req.twPage
        _req.twPage2=1
        chrome.tabs.sendMessage(_masterTabId, _req,r=>{});
      }else{
        _req.frameId=[_sender.frameId];
        chrome.tabs.sendMessage(_ctrlTabId, _req,r=>{});
      }
    //Master tab send dynamic code to background to forward to content
    }else if(_req.bzExeCode){
      if(_req.element){
        let v=getIframePath(_req.element)
        return chrome.tabs.sendMessage(_ctrlTabId,{bz:1,findFrameId:v,element:_req.element,retry:0},function(r){
          _setCodeToContent(_req.bzExeCode,r);
        })
      }else{
        _setCodeToContent(_req.bzExeCode,_req.id);
      }
    //Master send current status
    }else if(_req.status!==undefined){
      //master tab set status before start pop client win
      if(_req.status=="popwin-start"){
        _doingPopCtrl=1
      //master tab set status after end pop client win
      }else if(_req.status=="popwin-end"){
        _doingPopCtrl=0
      }else{
        _newStatus=_status=_req.status;
        if(_ctrlTabId){
          if(_req.data){
            _data=_req.data;
          }
          if(_newStatus=="record"){
            //funMap.enableAllIframe()
          }
          chrome.tabs.sendMessage(_ctrlTabId, {_newStatus:_newStatus,data:_req.data},r=>{});
          _newStatus=0;
        }
      }
    }else if(_req.open){
      window.open(req.url,req.name,req.size);
    //Set BZ code mapping data to unecrypt code from https://ai.boozang.com
    }else if(_req.ecMap){
      ecMap=_req.ecMap;
      _callback("background get ecMap")
    }else if(_req.extendTopScript){
      extendTopScript=_req.extendTopScript
      return
    }else if(_req.extendEndScript){
      extendEndScript=_req.extendEndScript
      return
    //Dynamic code from BZ master page
    }else if(_req.bzCode){
      if(_masterTabId&&_masterTabId!=_sender.tab.id){
        chrome.tabs.sendMessage(_masterTabId, {tab:"master",scope:"window",fun:"close"},r=>{});
        chrome.tabs.sendMessage(_ctrlTabId, {tab:"master",scope:"window",fun:"close"},r=>{});
      }
      
      _masterTabId=_sender.tab.id;
      _masterFrameId=_sender.frameId
      _masterUrl=_sender.url;
      _lastExeActionReq=0;
      ignoreReqs="";
      _callback(1)
      if(inReload){
        inReload=0
        rebuildTabs(_masterTabId)
      }
    //Set CSS file path from BZ master page
    }else if(_req.bzCss){
      _css=_req.bzCss;
    //Dynamic data from BZ master page
    }else if(_req.bzEnvCode){
      _bzEnvCode=_req.bzEnvCode;
    //check whether BZ client tab ready
    }else{
      //for request execution a BZ testing action
      if(_req.exeAction){
        _req.frameId=[_topFrameId];
        _lastExeActionReq=_req;
        if(_req.exeAction.element){
          return _addFrameId(_req,_req.exeAction.element,function(r){
            _doIt(r||_req)
          })
        }else if(_req.exeAction[ecMap.co]){
          //_req.exeAction.code._element
          var e=_req.exeAction[ecMap.co][ecMap.e];
          if(e){
            //_req.exeAction.code._element[0]._css
            e=e[0][ecMap.c];
            return _addFrameId(_req,e,function(r){
              _doIt(r||_req)
            })
          }
        }
      //for request highlight a BZ action element
      }else if(_req.element!==undefined){
        return _addFrameId(_req,_req.element,function(r){
          _doIt(r||_req)
        })
      }else if(_req.data&&_req.data.element){
        _req.frameId=[_topFrameId];
        return _addFrameId(_req,_req.data.element,function(r){
          _doIt(r||_req)
        })
      }else if(_req.curTest!==undefined){
        _curTest=_req.curTest
        if(_req.curAction!==undefined){
          _curAction=_req.curAction;
        }
      }else if(_req.shareData){
        let d=_req.shareData
        for(var k in d){
          _shareData[k]=d[k];
        }
      }else if(_req.updateExpection&&_req.updateExpection.element){
        _req.frameId=[_topFrameId];
        return _addFrameId(_req,_req.updateExpection.element,function(r){
          _doIt(r||_req)
        })
      }
      _doIt(_req)
      function _doIt(_req){
        if(!_ctrlTabId){
          if(_req.exeAction){
            if(_ctrlTabId){
              chrome.tabs.get(_ctrlTabId,function(o){
                chrome.tabs.sendMessage(_masterTabId, {scope:"commAdapter",fun:"crash",data:_lastErrPage,twPage:1,tab:"master",bz:1},r=>{});
              })
            }else{
              chrome.tabs.sendMessage(_masterTabId, {scope:"commAdapter",fun:"crash",twPage:1,tab:"master",bz:1},r=>{});
            }
          }
        }else{
          chrome.tabs.sendMessage(_ctrlTabId, _req,function(v){
            _callback&&_callback(v)
          });
        }
      }
    }
  },
  conApp:function(_msg, t, _sendResponse) {
    if(_msg.pop){
      _sendResponse(1)
      return pop[_msg.fun](_msg.data,function(d){
        _sendResponse(d)
      })
    }else if(!_msg.requestSendResponse){
      
    }else{
      _msg.requestSendResponse=_sendResponse
    }
    if(_msg.keep){
      _sendResponse(1)
      return;
    }
    //_console("background (content): ",_msg)
    /*****************************************************************************************************
    //For REGISTER tab, it only work for new pop window. The new window must pop up from master window.
    *****************************************************************************************************/
    if(_msg.bg){
      funMap[_msg.fun](_msg.bkScope,_msg.bkFun,_msg.data,t,_msg.element,_msg.requestSendResponse)
      return !!_msg.requestSendResponse
    }else if(_msg._registerTab && (_msg.name=="bz-client"||_ctrlTabId==t.tab.id)){
      if(t.url.startsWith(_appUrl)){
        return alert("Testing on Boozang sites not supported!");
      }
      if(isIgnoreFrame(t.url)){
        return
      }
      if(_msg.name=="bz-client"){
        // if(!_plugInCode){
        //   chrome.tabs.sendMessage(_masterTabId, {tab:"master",scope:"_extensionComm",fun:"_loadPlugCode"},r=>{});
        // }
        _ctrlTabId=t.tab.id;
        _ctrlWindowId=t.tab.windowId;
        if(_ctrlTabId==_masterTabId){
          _ctrlFrameId=t.frameId
        }
        _frameIds[0]=1
        //to tell master the current client tab id
        chrome.tabs.sendMessage(_masterTabId, {tw:_ctrlTabId,topFrame:t.frameId,tab:"master"},r=>{});
      }else{
        // chrome.scripting.executeScript(
        //   {
        //     target: {tabId: t.tab.id,frameIds:[t.frameId]},
        //     files: ["override.js"],
        //     world: 'MAIN'
        //   },
        //   ()=>{}
        // )
        _frameIds[t.frameId]=1
        chrome.scripting.executeScript(
          {
            target: {tabId: t.tab.id,frameIds:[t.frameId]},
            func: enableAppCode,
            args:[1],
            world: 'MAIN'
          },
          ()=>{}
        )
        chrome.scripting.executeScript(
          {
            target: {tabId: t.tab.id,frameIds:[t.frameId]},
            func: enableExtensionCode
          },
          ()=>{}
        )
      }
      _topFrameId=_msg.name=="bz-client"||_msg.name=="bz-manager"?t.frameId:_topFrameId;
      _setCodeToContent([{
        k:"bzIframeId",
        v:t.frameId
      },{
        k:"topFrame",
        v:_msg.name=="bz-client"?1:0
      }],t.frameId)
  
      chrome.scripting.executeScript(
        {
          target: {tabId: t.tab.id,frameIds:[t.frameId]},
          func: initTWComm,
          world:"MAIN"
        },
        (a,b,c) => {
          
        }
      )
  /*
      if(_topFrameId!=t.frameId&&_status=="play"){
        _uncodeFrames.push(t.frameId)
        return
      }
  */
      _initFrame(t.frameId,_sendResponse)
    //only work after master window is ready, and the requestion will send to master
    }else if(_masterTabId){
      _msg.ctrlInfo=1;
      if(_msg.result){
        _lastExeActionReq=0;
      }else if(_msg.action){
  //      if(t.frameId&&_frameIds[t.frameId]){
    //      _msg.action.element[0]=_frameIds[t.frameId].path;
      //  }
      }else if(_msg[ecMap.ua]){
        _setCodeToContent(ecMap.dp+"."+ecMap.er+"()")
      }else if(_msg._fun==ecMap.pe){
        if(t.frameId&&_frameIds[t.frameId]){
          _msg[ecMap.d][0]=_frameIds[t.frameId].path
        }
      }else if(_msg._fun==ecMap.lnp){
        _frameIds={0:1}
      }else if(_msg.unloadFrame){
        delete _frameIds[_msg.id]
      }
      _msg.tab="master"
      chrome.tabs.sendMessage(_masterTabId, _msg,r=>{});
    }
    _sendResponse(1)
  }
}
let _list={},_responseList={}
chrome.action.setBadgeText({text: chrome.runtime.getManifest().version=="1.2"?"TEST":"AI"});
/*Get Message from IDE*/
/******************* call ide *************************************************** */
chrome.runtime.onMessageExternal.addListener(funMap.conIde);
var _appRetry=0
function _addFrameId(_req,_element,_fun,_retry){
  curElement=[_element[0]]
  if(_req.exeAction&&_lastIframeRequest&&_req!=_lastIframeRequest._req){
    _lastIframeRequest=0
    clearTimeout(_dblCheckTime)
    _dblCheckTime=0
    _retry=_appRetry+1;
  }
  _retry=_retry||0
  _appRetry=_retry
  _req.frameId=[_topFrameId];
  if(_element&&_element.constructor==Object){
    _element=_element.path
  }
  
  var _badRequest=0;
  if(_req.exeAction){
    _badRequest=setTimeout(function(){
      _appRetry++
      if(_appRetry*1000>(_req.exeAction.max||_req.exAction.min||2000)){
        _fun(_req)
      }else{
        _addFrameId(_req,_element,_fun,_appRetry)
      }
    },1000)
  }
  let v=getIframePath(_element)
  if(v){
    return chrome.tabs.sendMessage(_ctrlTabId,{bz:1,findFrameId:v,element:_element,retry:_appRetry},r=>{
      if(r!==undefined&&r!==null){
        console.log("get iframe: "+r)
        clearTimeout(_badRequest)
        if(_element[0]!="BZ.TW.document"){
          if(_req.exeAction){
            if(!_lastIframeRequest){
              _lastIframeRequest={
                _element:[],
                r:r,
                _req:_req,
                _fun:_fun
              }
              _element.forEach(e=>{
                _lastIframeRequest._element.push(e)
              })
            }else{
              if(_lastIframeRequest.r==r){
                return 
              }else{
                _lastIframeRequest.r=r
              }
            }
            dblCheckForIframe()
          }
          _element[0]="BZ.TW.document";
          _req.frameId=[r];
          if(_uncodeFrames.includes(r)){
            _uncodeFrames.splice(_uncodeFrames.indexOf(r),1)
            _initFrame(r)
          }
          return _fun(_req)
        }
        console.log("error:")
        console.log(JSON.stringify(_element))
      }else{
        console.log("not frame")
      }
    })
  }
  clearTimeout(_badRequest)
  _fun()
}

function getIframePath(_element){
  if(_element&&_element[0]&&!_element[0].startsWith("$(BZ.TW.document.body)")&&_element[0][0]=="$"){
    var v=_element[0].match(/\((.+)\)/)
    if(v){
      v=v[1].trim()
      if(v.match(/^[0-9, ]+$/)){
        return v.split(",")
      }else{
        v=v.split("(")
        v=v[1]||v[0]
        v=v.replace(/(^['"]|['"]$)/g,"")
        return [v]
      }
    }
  }
}
function dblCheckForIframe(){
  console.log("dblCheckForIframe ....")
  _dblCheckTime=setTimeout(function(){
    if(_lastIframeRequest&&_dblCheckTime&&_status=="play"){
      _dblCheckTime=0
      console.log("dblCheckForIframe works ....")
      _lastIframeRequest._req.element=_lastIframeRequest._element
      _addFrameId(_lastIframeRequest._req,_lastIframeRequest._element,_lastIframeRequest._fun)
    }else{
      console.log("dblCheckForIframe doesn't work....")
    }
  },3000)
}

//set code to chrome extension content
function _setCodeToContent(c,iFrameId){
  //for set dynamic code to current controled client tab, 
  try{
    chrome.tabs.sendMessage(_masterTabId, {
      scope:"console",
      fun:"log",
      data:"BZ-LOG:set code to client:"+c.length,
      twPage:1,
      tab:"master",
      bz:1
    },r=>{});
    trigger(c,_ctrlTabId,iFrameId)
  }catch(e){
    chrome.tabs.sendMessage(_masterTabId, {scope:"console",fun:"log",data:"BZ-LOG: Set code to extension failed: "+e.message+"\n"+e.stock,twPage:1,tab:"master",bz:1},r=>{});
    console.log(e.stock)
    
    // chrome.tabs.sendMessage(_masterTabId, {scope:"console",fun:"log",data:"BZ-LOG:set code to client get error2:"+e.message,twPage:1,tab:"master",bz:1});
  }
}
function isIgnoreFrame(v){
  for(var i=0;i<_ignoreList.length;i++){
    if(v.startsWith(_ignoreList[i])){
      return 1
    }
  }
}

let pop={
  formatLog:function(tab) {
    chrome.tabs.executeScript(tab.id, {code: `window.formatter&&window.formatter.exeFormag(${JSON.stringify(tab.data)})`,matchAboutBlank:true,allFrames:true},_=>{})
  },
  updateFormatLogSetting:function(tab){
    chrome.tabs.executeScript(tab.id, {code: `window.formatter&&window.formatter.updateFormatLogSetting(${JSON.stringify(tab.data)})`,matchAboutBlank:true,allFrames:true},_=>{})
  },
  getPageInfo:function(tab,_fun){
    chrome.tabs.sendMessage(tab, {scope:"formatter",fun:"getPageInfo"},d=>{
      _fun(d)
    });
  }
}

/******************* call APP *************************************************** */
//get message from app extension content
chrome.runtime.onMessage.addListener(funMap.conApp);

function enableAppCode(){
  insertBzCode(1)
}

function enableExtensionCode(){
  initCode(1)
}

function _initFrame(frameId,rep){
  let c=[]
  if(_status!="play"){
    if(_curAction){
      c.push({
        k:"_IDE._data._curAction",
        v:_curAction
      })
    }
    if(_curTest){
      c.push({
        k:"_IDE._data._curTest",
        v:_curTest
      })
    }
  }
  if(_shareData){
    c.push({
      f:"BZ._setShareData",
      ps:[_shareData]
    })
  }
  c.push(..._bzEnvCode)
  c.push({
    f:"insertCssAndClientCode",
    ps:[{_css:_css,_newStatus:_newStatus||_status,_status:_status,data:_data}]
  })
  if(rep){
    rep(c)
  }else{
    chrome.tabs.sendMessage(_ctrlTabId, {
      acceptData:1,
      code:c
    },r=>{});
  }

  if(_lastExeActionReq && _status=="play"){
    if(_lastExeActionReq.exeAction.token){
      _lastExeActionReq.exeAction.tokenFailed=1
    }
    setTimeout(function(){
      chrome.tabs.sendMessage(_ctrlTabId, _lastExeActionReq,r=>{});
    },100)
  }
  if(_loadPageInfo){
    chrome.tabs.sendMessage(_masterTabId, _loadPageInfo,r=>{})
    _loadPageInfo=0
  }
}

chrome.tabs.onRemoved.addListener(function(_tab, info) {
  //_console("background: remove tab")
  //clear data when master tab close
  if(_masterTabId==_tab){
    //_console("background: remove master")
    cleanMaster()
  //clear client info
  }else if(_ctrlTabId==_tab){
    //_console("background: remove ctrl")
    _ctrlTabId=0;
    chrome.tabs.sendMessage(_masterTabId, {tw:0,tab:"master"},r=>{});
  }else{
    delete _frameIds[_tab]
    return
  }
  
  _frameIds={0:1}
});

chrome.tabs.onCreated.addListener(function(_tab, info) {
  //_console("background add tab")
  //only register the poping up client win
  if(_doingPopCtrl){
    //_console("background add ctrl tab")
    if(_ctrlTabId && _ctrlTabId!=_tab.id){
      chrome.tabs.sendMessage(_ctrlTabId, {close:1},r=>{})
    }
    _ctrlTabId=_tab.id;
    _frameIds={0:1};
    //to tell master the current client tab id
    chrome.tabs.sendMessage(_masterTabId, {tw:_ctrlTabId,tab:"master"},r=>{});
  }
});

chrome.runtime.onUpdateAvailable.addListener(function(details) {
  console.log("updating to version " + details.version);

  chrome.runtime.reload();
});

chrome.runtime.requestUpdateCheck(function(s) {
  if (s == "update_available") {
    console.log("update pending...");
  } else if (s == "no_update") {
    console.log("no update found");
  } else if (s == "throttled") {
    console.log("Oops, I'm asking too frequently - I need to back off.");
  }
});

function _isDownloading(rs){
  for(var i=0;rs && i<rs.length;i++){
    var r=rs[i];
    if(r.name=="Content-Disposition" && (r.value.includes("attachment")||r.value.includes("filename"))){
      return 1
    }else if((r.name||"").toLowerCase()=="content-type" && (r.value.includes("application")||r.value.includes("stream"))){
      return 1
    }
  }
}

function cleanMaster(){
  var tabId=_ctrlTabId
  _setCodeToContent("window.close()");
  _status=""
  _masterTabId=0;
  _masterFrameId=0;
  _shareData={}
  ignoreReqs=0
  _newStatus=_status=_topFrameId=0
  _ctrlTabId=0;
  _uncodeFrames=[]
}

chrome.webRequest.onBeforeRequest.addListener(function(a,b){
  if(a.tabId==_ctrlTabId&&_ctrlTabId){
    if(a.type=="main_frame"){
      _list={}
      _responseList={}
      //console.clear()
    }
    funMap.postRequest(a,"BZ","addReq")
  }
},{urls: ["<all_urls>"]})


chrome.webRequest.onBeforeRedirect.addListener(function(a,b){
  if(a.tabId==_ctrlTabId&&_ctrlTabId){
    funMap.postRequest(a,"BZ","addRep")
  }
},{urls: ["<all_urls>"]})

chrome.webRequest.onCompleted.addListener(function(v){
  if(v.tabId!=_ctrlTabId){
    return
  }
  funMap.postRequest(v,"BZ","addRep")
  
  if(_masterTabId&&v.tabId==_masterTabId&&v.frameId==0&&_masterFrameId){
    cleanMaster()
  }
  if((v.tabId==_ctrlTabId||v.tabId==-1)&&_masterTabId){
    if(!v.url.includes("bzInsert.css")&&!v.url.includes("insert.icons.css")){
      chrome.tabs.sendMessage(_masterTabId, {twUpdate:1,tab:"master"},r=>{});
    }
    var r={ctrlInfo:1,url:v.url,from:"complete"}
    if(v.statusCode>=400){
      r.failed=1;
      r.code=v.statusCode
    }
    if(v.type=="main_frame"||v.tabId==-1||(v.type=="sub_frame"&&v.frameId==_topFrameId)){
      if(_isDownloading(v.responseHeaders)){
        r.download=1
      }else{
        r.ready=1;//mainPage
        _lastErrPage=0
        if(_loadPageInfo){
          chrome.tabs.sendMessage(_masterTabId, _loadPageInfo,r=>{});
        }
        setTimeout(function(){
          if(_loadPageInfo){
            chrome.tabs.sendMessage(_masterTabId, _loadPageInfo,r=>{});
          }
        },1000)
        r.tab="master"
        r.type=v.type
        _loadPageInfo=r;
        return
      }
    }else if(v.type=="other"){
      /*****************************
      * NOT SURE, NEED CHECK AGAIN!!!
      *****************************/
      r.download=1
    }else if(r.failed){
      r.extraFile=1;
      r.initUrl=v.initiator
    }else{
      return;
    }
    r.tab="master"
    chrome.tabs.sendMessage(_masterTabId, r,r=>{})
  }
},{urls: ["<all_urls>"]},["responseHeaders"]);

chrome.webRequest.onErrorOccurred.addListener(function(v){
  if(v.tabId==_ctrlTabId||(_masterFrameId&&!_ctrlTabId)){
    var r={ctrlInfo:1,url:v.url,error:v.error};
    funMap.postRequest(v,"BZ","addRep")
    
    if(v.type=="main_frame"||(v.type=="sub_frame"&&((_masterFrameId&&!_ctrlTabId)||v.frameId==_topFrameId))){
      if(_isDownloading(v.responseHeaders)){
        r.download=1
      }else{
        r.ready=1
      }
      if(_lastErrPage && _lastErrPage.url==r.url && Date.now()-_lastErrPage.time<1000){
        _lastErrPage.time=Date.now()
        return;
      }
      _lastErrPage={url:r.url,time:Date.now(),type:v.type}
      console.log(_lastErrPage)
    }else if(v.type=="other"){
      r.download=1
    }else{
      r.error=0
      r.extraFile=1;
      r.initUrl=v.initiator
    }
    r.tab="master"
    chrome.tabs.sendMessage(_masterTabId, r,r=>{})
  }
},{urls: ["<all_urls>"]});

chrome.webRequest.onActionIgnored.addListener(function(v){
  if(v.tabId!=_ctrlTabId){
    return
  }
  funMap.postRequest(v,"BZ","addRep")
})


chrome.runtime.onInstalled.addListener(addPageScript);

async function addPageScript() {
  const scripts = [{
    id: 'override',
    js: ['override.js'],
    matches: ['<all_urls>'],
    runAt: 'document_start',
    world: 'MAIN',
    allFrames:true
  }];
  const ids = scripts.map(s => s.id);
  await chrome.scripting.unregisterContentScripts({ ids }).catch(() => {});
  await chrome.scripting.registerContentScripts(scripts);
}

function initTWComm(){
  bzTwComm.init(chrome.runtime.id)
}

async function rebuildTabs(ignoreId){
  let tabs = await chrome.tabs.query({status:"complete"})
  tabs.forEach(x=>{
    if(x.id<=ignoreId){
      return
    }
    chrome.scripting.executeScript(
      {
        target: {tabId: x.id},
        func: toReloadContent,
      },
      () => {}
    )
  })
}

async function rebuildIDE(){
  let tabs = await chrome.tabs.query({status:"complete"});
  inReload=1
  setTimeout(()=>{
    inReload=0
  },2000)
  tabs.forEach(x=>{
    chrome.scripting.executeScript(
      {
        target: {tabId: x.id},
        func: reloadIDE,
        world:"MAIN"
      },
      (a,b,c) => {
      }
    )
  })
}
rebuildIDE()
function reloadIDE(){
  BZ.reloadIDE()
}
function toReloadContent(){
  reloadContent()
}
/*
function trigger(v,tabId,iframeId){
  let t={tabId: tabId}
  if(iframeId!==undefined){
    iframeId=[iframeId]
  }else{
    iframeId=Object.keys(_frameIds).map(x=>parseInt(x))
  }
  for(let i=0;i<iframeId.length;i++){
    let j=iframeId[i]
    t.frameIds=[j]
    try{
      chrome.scripting.executeScript(
        {
          target: t,
          func: triggerFun,
          args:[v]
        },
        (a,b,c) => {
          console.log(a)
        }
      )
    }catch(e){
      debugger
      delete _frameIds[j]
    }
  }

  function triggerFun(v){
    BZ.trigger(v)
  }
}
*/
function trigger(v,tabId,iframeId){
  let t={tabId: tabId}
  if(iframeId){
    t.frameIds=[iframeId]
  }else if(iframeId===undefined){
    t.frameIds=Object.keys(_frameIds).map(x=>parseInt(x))
  }
  chrome.scripting.executeScript(
    {
      target: t,
      func: triggerFun,
      args:[v]
    },
    () => {}
  )

  function triggerFun(v){
    BZ.trigger(v)
  }
}


console.clear()