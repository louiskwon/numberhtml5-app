/**
Copyright 2012 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Renato Mangini (mangini@chromium.org)
**/

var serial_lib=(function() {
  
  var connectionInfo;
  var readListener;
  
  var logObj=function(obj) {
    console.log(obj);
  }
  var log=function(msg) {
    console.log(msg);
  };
  
  
  var startListening=function(callback) {
    if (!connectionInfo || !connectionInfo.connectionId) {
      throw "You must call openSerial first!";
    }
    reader_automata.init(callback, checkDataFromSerial, logState);
  }

  var logState=function(state, readData, expectedBytes, timeRemaining) {
    //console.log("state="+state+" readData="+readData+" expectedBytes="+expectedBytes+" timeRemaining="+timeRemaining);
  }

  var checkDataFromSerial=function(callback) {
    if (connectionInfo) chrome.experimental.serial.read(connectionInfo.connectionId, callback);
  }

  var flush=function(callback) {
    chrome.experimental.serial.flush(connectionInfo.connectionId, callback);
  }


  var getPorts=function(callback) {
    chrome.experimental.serial.getPorts(callback);
  }
  
  var openSerial=function(serialPort, callback) {
    chrome.experimental.serial.open(serialPort, function(cInfo) {
     onOpen(cInfo, callback)
    });
  };
  
  var onOpen=function(cInfo, callback) {
    if (!cInfo || !cInfo.connectionId || cInfo.connectionId<0) {
      logObj(cInfo);
      throw "could not find device (connectionInfo="+cInfo+")";
    } else {
      connectionInfo=cInfo;
      logObj(cInfo);
      if (callback) callback(cInfo);
    }
  };
  
  var writeBytesSerial=function(bytes) {
    var abv=new Uint8Array(bytes);
    chrome.experimental.serial.write(connectionInfo.connectionId, abv.buffer, onWrite); 
  }
  
  var writeSerial=function(str) {
    chrome.experimental.serial.write(connectionInfo.connectionId, str2ab(str), onWrite); 
  }
  
  var onWrite=function(obj) {
  }
  

  /* the arraybuffer is interpreted as an array of UTF-8 (1-byte Unicode chars) */
  var ab2str=function(buf) {
    var bufView=new Uint8Array(buf);
    var unis=[];
    for (var i=0; i<bufView.length; i++) {
      unis.push(bufView[i]);
    }
    return String.fromCharCode.apply(null, unis);
  };


  var str2ab=function(str) {
    var buf=new ArrayBuffer(str.length);
    var bufView=new Uint8Array(buf);
    for (var i=0; i<str.length; i++) {
      bufView[i]=str.charCodeAt(i);
    }
    return buf;
  }
 
 
  var closeSerial=function(callback) {
   if (connectionInfo) {
     chrome.experimental.serial.close(connectionInfo.connectionId, 
      function(result) {
        onClose(result, callback);
      });
    }
  };
  
  var onClose = function(result, callback) {
   connectionInfo=null;
   if (callback) callback(result);
  };
  
  var isConnected = function() {
    return connectionInfo!=null && connectionInfo.connectionId>=0;
  };

  return {
    "getPorts": getPorts,
    "openSerial": openSerial,
    "isConnected": isConnected,
    "startListening": startListening,
    "writeBytesSerial": writeBytesSerial,
    "writeSerial": writeSerial,
    "flush": flush,
    "closeSerial": closeSerial
  }
})();

