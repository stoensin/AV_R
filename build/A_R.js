/**
 * Created by GGC on 2017/2/24.
 */
var A_R=function () {

    this.showTip=false;
    this.frontCamera=false;//true为前置摄像头，否则为后置
    this.constraints={};
    this.video=null;
    this.inclinationAngle=36;
    this._alpha=0;
    this._beta=0;
    this._gamma=0;
    this._gammaFace=0;
    this._windowWidth=window.innerWidth;
    this._windowHeight=window.innerHeight;
    this._bindEvent();
    document.body.style.padding="0px";
    document.body.style.margin="0px";
    document.body.style.overflow="hidden";
    document.body.style.background="#000000";

};

A_R.prototype.init=function () {
    var self=this;

    this._msgTip=this._tip();

    this.video=document.createElement('video');
    this.video.setAttribute("autoplay","autoplay");
    this.video.height="0px";
    document.body.appendChild(this.video);

    self.constraints= self.constraints.length>0?self.constraints: {
        audio: true,
        video: {
            width: {min: this._windowWidth, ideal: this._windowWidth, max: this._windowWidth},
            height: {min: this._windowWidth, ideal: this._windowWidth, max: this._windowWidth},
            facingMode:(self.frontCamera?"user":"environment"),    /* 使用前置/后置摄像头*/
            //Lower frame-rates may be desirable in some cases, like WebRTC transmissions with bandwidth restrictions.
            frameRate:{ideal:10,max:15}
        }
    };
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {

            // First get ahold of the legacy getUserMedia, if present
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;//navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    navigator.mediaDevices.getUserMedia(self.constraints).then(
        function (stream) {
            // Older browsers may not have srcObject
            if ("srcObject" in self.video) {
                self.video.srcObject = stream;
            } else {
                // Avoid using this in new browsers, as it is going away.
                self.video.src = window.URL.createObjectURL(stream);
            }
            self.video.onloadedmetadata=function (e) {
                self.video.play();
            }
        }
    ).catch(
        function (err) {
            self._msgTip.innerHTML=err.name + ": " + err.message;
        }
    );

};
A_R.prototype._createCanvas=function(id){
    var canvasobj=document.getElementById(id);
    if(canvasobj ===null) {
        canvasobj = document.createElement('canvas');
        canvasobj.width = this._windowWidth + "px";
        canvasobj.height = this._windowHeight + "px";
        canvasobj.id = id;
        document.body.appendChild(canvasobj);
    }
    return canvasobj;
};
//拍照
A_R.prototype.showPhoto=function() {
    var canvas1=this._createCanvas('_content');
    var photoCanvas = canvas1.getContext('2d');
    photoCanvas.drawImage(this.video, 0, 0,this._windowWidth,this._windowHeight); //将video对象内指定的区域捕捉绘制到画布上指定的区域，实现拍照。
};

//视频
A_R.prototype.showVedio=function() {
    var canvas2 =this._createCanvas('_content');
    var videoCanvas=canvas2.getContext('2d');
    // 将视频帧绘制到Canvas对象上,Canvas每60ms切换帧，形成肉眼视频效果
    window.setInterval(function () {
        videoCanvas.drawImage(this.video, 0, 0,this._windowWidth,this._windowHeight);
    }, 60);
};
//创建ar场景
A_R.prototype.arScene=function(scene){
    var image = new THREE.VideoTexture(this.video);
    image.generateMipmaps = false;
    image.format    = THREE.RGBAFormat;
    image.maxFilter = THREE.NearestFilter;
    image.minFilter = THREE.NearestFilter;
    scene.background = image;                   // 背景视频纹理
};
A_R.prototype._tip=function () {
    var tipobj=document.createElement('div');
    tipobj.style.position='absolute';
    tipobj.style.top="0px";
    tipobj.style.width='100%';
    tipobj.style.color="#ffffff";
    tipobj.style.padding="5px";
    tipobj.style.fontFamily="Monospace";
    tipobj.style.fontSize="13px";
    tipobj.style.fontWeight="bold";
    tipobj.style.textAlign="center";
    if(!this.showTip) tipobj.style.display="none";
    else tipobj.style.display="";
    document.body.appendChild(tipobj);
    return tipobj;
};
A_R.prototype._bindEvent=function(){
    var that=this;
    /* bind device orientation event */
    if(window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', deviceorientation, false);
    }
    function deviceorientation(e){
        that._gammaFace=(!that._gammaFace)?(e.gamma>0?1:-1):that._gammaFace;
        that._alpha=e.alpha;
        var t_beta=e.beta;
        if(t_beta>90){
            that._beta=90;
        }else if(t_beta<-90){
            that._beta=-90;
        }else{
            that._beta=e.beta;
        }

        if(that._gammaFace*e.gamma>0){
            that._gamma = e.gamma;
        }
    }
};
A_R.prototype.isMobileDevice=function(deviceType) {
    var sUserAgent = navigator.userAgent.toLowerCase();
    if(deviceType){
        return (sUserAgent.match(/ipad/i)|| sUserAgent.match(/iphone os/i) || sUserAgent.match(/midp/i) ||
            sUserAgent.match(/rv:1.2.3.4/i) || sUserAgent.match(/ucweb/i) || sUserAgent.match(/android/i) ||
            sUserAgent.match(/windows ce/i) || sUserAgent.match(/windows mobile/i))
    }

    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        //document.writeln("phone");
        return true;
    } else {
        //document.writeln("pc");
        return false;
    }
}


