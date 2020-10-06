const fs = require('fs');

const Service = {
  stdTimeout:60000,
  taskMap:{},
  timer:0,
  status:"",
  result: 2,
  logMonitor(page,notimeout,gtimeout,stdTimeout,reportPrefix){
    this.notimeout=notimeout
    console.log("Initializing logMonitor");
    gtimeout && console.log("Override global timeout: " + gtimeout + " mins");
    stdTimeout && console.log("Override action timeout: " + stdTimeout + " mins");
    if (reportPrefix) {
      console.log("Override report prefix: " + reportPrefix);
      Service.reportPrefix=reportPrefix;
    } 

    Service.stdTimeout=stdTimeout*60000||60000;
    
    
    if(!notimeout&&gtimeout){
      setTimeout(()=>{
        Service.gracefulShutdown("Global timeout triggered - try to do graceful shutdown")
      },gtimeout*60000)
    }
    if(notimeout){
      clearTimeout(Service.status)
    }

    page.on('console', msg => {
      let timeout,t;

      msg = (!!msg && msg.text()) || "def";
      msg=trimPreMsg(msg)
      if(!msg){
        return
      }
      // Todo add noLog conditions
      // console.log(msg);
      
      if(Service.curTask){
        t=Service.curTask
        Service.curTask=0
      }else{
        for(let key in Service.taskMap){
          if(msg.includes(key)){
            t=Service.taskMap[key]           
            break
          }
        }
      }
      if (!t || !t.noLog){
        console.log(msg)
      }
      if(t){
        clearTimeout(Service.timer)
        if(!t.timeout){
          timeout=t.fun(msg)
          //console.log("Get timeout: "+timeout)
        }else{
          timeout=t.timeout
        }
        
        if(!notimeout){
          // console.log("set timeout for shutdown: "+timeout)
          Service.timer=setTimeout(()=>{
            Service.gracefulShutdown("Action timeout triggered - try to do graceful shutdown")
          },timeout)
        }
        
        t.timeout&&t.fun(msg,Service.timer)
        if(t.oneTime){
          Service.removeTask(t)
        }
      }
    })
    
    function trimPreMsg(msg){
      if(msg&&msg.startsWith("BZ-LOG:")){
        msg=msg.substring(7).trim()
      }else{
        return
      }
      return msg
    }
  },
  setBeginningFun(fun){
    Service.beginningFun=fun
  },
  setPopup(popup){
    this.popup=popup
  },
  setPage(page){
    this.page=page
  },
  //task:{key,fun,onTime,timeout}
  addTask(task){
    this.taskMap[task.key]=task
  },
  removeTask(task){
    delete this.taskMap[task.key]
  },
  init(){
    this.status=setTimeout(()=>{
      if(Service.status!="ready"){
        Service.shutdown("Failed to load test")
      }
    },Service.stdTimeout)
    
    Service.addTask({
      key:"ready",
      fun(){
        Service.status="ready"
        console.log("Ready on logService")
        if(Service.beginningFun){
          Service.beginningFun()
        }else{
          Service.setRunTasks()
        }
      },
      oneTime:1,
      timeout:Service.stdTimeout
    })
  },
  setRunTasks(){
    Service.taskMap={}
    Service.addTask({
      key:"ms:",
      fun(msg){
        return (parseInt(msg.split(this.key)[1].trim())||0)+1000
      },
      msg:"Action timeout"
    })

    Service.addTask({
      key:"app-run:",
      fun(msg){
        Service.popup.evaluate(()=>{ msg;  });
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"ide-run:",
      fun(msg){
        Service.page.evaluate(()=>{ msg;  });
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"screenshot:",
      fun(msg){
        let screenshotFile = msg.split("screenshot:")[1]+".png";
        Service.popup.screenshot({path: screenshotFile});
      },
      timeout:Service.stdTimeout
    })

    Service.addTask({
      key:"Stop task!",
      fun(msg){
        Service.setEndTasks()
      },
      timeout:Service.stdTimeout
    })
  },
  setEndTasks(){
    Service.taskMap={}
    Service.addTask({
      key:"Result:",
      fun(msg){
        msg=msg.split("Result:")[1].trim()
        Service.result = msg == "Success" ? 0:2;
        console.log("Exit with status code: ", Service.result);
      },
      timeout:Service.stdTimeout
    })
    Service.addTask({
      key:"All tests completed!",
      fun(msg){
        Service.shutdown(this.key)
      }
    })
    this.insertFileTask()
  },
  insertFileTask(exFun){
    Service.addTask({
      key:"BZ-File output:",
      fun(msg){
        msg=msg.substring(this.key.length).trim()
        if(!this.name){
          this.name=Service.reportPrefix + msg.toLowerCase().replace(/\ /g,"_");
        }else if(msg=="end"){
          let name=this.name
          fs.writeFile(name, this.content, (err)=>{
            if (err) {
              Service.shutdown("Error: on output file: "+name+", "+ err.message)
            }
            console.log("Report "+name+" saved.")
            if(exFun){
              exFun()
            }
          })
          this.name=0
        }else{
          this.content=msg
        }
      },
      timeout:Service.stdTimeout,
      noLog:1
    })
  },
  shutdown(msg){
    msg && console.log(msg)
    if(!this.notimeout){
      process.exit(Service.result)
    }
  },
  gracefulShutdown(msg){
    console.error("Try to get Boozang to exit gracefully and write report");
    Service.popup.screenshot({path: "graceful_shutdown.png"});
    Service.page.evaluate(()=>{  
      BZ.e();console.log("BZ-LOG: Graceful shutdown message received. Exiting... "); 
    });
    // Wait 100 seconds for Boozang to finish before force kill
    setTimeout(function(){
      Service.shutdown(msg);
    },100000)   
  }
}
Service.init()
exports.Service = Service;
