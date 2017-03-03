/**
 * Created by GGC on 2017/2/24.
 */
var V_R=function () {
    this.inclinationAngle=36;
    this.views = {
        left: [0.0,0.508],
            bottom: [0.0,0.0],
            width: [0.496,0.496],
            height: [1.0,1.0],
            background: new THREE.Color().setRGB(0.5, 0.5, 0.7),
            eye: [[-0.035, 0, 0],[0.035, 0, 0]], /*left carame position*/
            viewAngleOffset:[-4.0,4.0],
            up: [0, 1, 0],
            fov: 75,
            near:1,
            far:10000,
            camera:[]
    };
    this.helper={'isPC':{
        'tip':'',
    },'isHorizontal':{
        'tip':'',
    },'isVertical':{
        'tip':''
    }};
    this.showTip=false;
    this._alpha=0;
    this._beta=0;
    this._gamma=0;
    this._lon=0;
    this._lat=0;
    this._windowWidth=window.innerWidth;
    this._windowHeight=window.innerHeight;
    this._gammaFace=0;
    this._playVR=false;
    this._msgTip=null;
};
V_R.prototype.init=function () {
    this._playVR=this.isMobileDevice() & this._isCrossScreen();
    //this._playVR=1;
    this._msgTip=this._tip();
    var view=this.views;
    if(this._playVR){
        for (var ii =  0; ii < 2; ii++ ) {
            var camera = new THREE.PerspectiveCamera( view.fov, this._windowWidth / this._windowHeight, view.near, view.far );
            //console.log(new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 ));
            camera.position.set(view.eye[ii][ 0 ],view.eye[ii][ 1 ],view.eye[ii][ 2 ]);
            camera.up.x = view.up[ 0 ];
            camera.up.y = view.up[ 1 ];
            camera.up.z = view.up[ 2 ];
            view.camera[ii] = camera;
        }
    }else{

        this.views.left=0;
        this.views.width=1.0;
        this.views.height=1.0;
        this.views.bottom=0;
        this.views.eye=[0, 0, 0];
        var camera = new THREE.PerspectiveCamera( view.fov, this._windowWidth / this._windowHeight, view.near, view.far );
        //console.log(new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 ));
        camera.position.set(view.eye[ 0 ],view.eye[ 1 ],view.eye[ 2 ]);
        camera.up.x = view.up[ 0 ];
        camera.up.y = view.up[ 1 ];
        camera.up.z = view.up[ 2 ];
        view.camera = camera;
    }
    /*create camera*/
    document.body.style.padding="0px";
    document.body.style.margin='0px';
    this._bindEvent();
};
V_R.prototype.update=function(scene,renderer) {
    var that=this;
    var view = this.views;
    var target = new THREE.Vector3(0, 0, 0);

    if (this._playVR) {

        target.y = Math.sin(THREE.Math.degToRad(-this._gamma -this.inclinationAngle)) ;
        target.z = Math.cos(THREE.Math.degToRad(this._alpha));
        for ( var i = 0; i < 2; i++ ) {
            target.x = Math.sin(THREE.Math.degToRad(this._alpha+view.viewAngleOffset[i]));
            view.camera[i].lookAt(target);
            var left   = Math.floor( this._windowWidth  * view.left[i] );
            var bottom = Math.floor( this._windowHeight * view.bottom[i] );
            var width  = Math.floor( this._windowWidth  * view.width[i] );
            var height = Math.floor( this._windowHeight * view.height[i] );
            renderer.setViewport( left, bottom, width, height );
            renderer.setScissor( left, bottom, width, height );
            renderer.setScissorTest( true );
            renderer.setClearColor( view.background );
            view.camera[i].aspect = width / height;
            view.camera[i].updateProjectionMatrix();
            renderer.render( scene, view.camera[i] );
        }
    }else {

        if (this.isMobileDevice()) {
            this._msgTip.innerHTML=this.helper.isVertical.tip;
            target.x = Math.sin(THREE.Math.degToRad(this._alpha));
            target.y = Math.sin(THREE.Math.degToRad(this._beta - this.inclinationAngle));
            target.z = Math.cos(THREE.Math.degToRad(this._alpha));
        } else {
            this._msgTip.innerHTML=this.helper.isPC.tip;
            var lat = Math.max(-85, Math.min(85, this._lat));
            var phi = THREE.Math.degToRad(90 - this._lat);
            var theta = THREE.Math.degToRad(this._lon);
            target.x = Math.sin(phi) * Math.cos(theta);
            target.y = Math.cos(phi);
            target.z = Math.sin(phi) * Math.sin(theta);
        }
        var camera = view.camera;
        camera.lookAt(target);
        var left = Math.floor(this._windowWidth * view.left);
        var bottom = Math.floor(this._windowHeight * view.bottom);
        var width = Math.floor(this._windowWidth * view.width);
        var height = Math.floor(this._windowHeight * view.height);
        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);
        renderer.setScissorTest(true);
        renderer.setClearColor(view.background);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        //console.log(camera);
        renderer.render(scene, camera);
    }

};
/*
 *check device types[mobile/PC]
 **/
V_R.prototype.isMobileDevice=function(deviceType) {
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
};
/*
 *binding user interaction events
 **/
V_R.prototype._bindEvent=function(){
    var that=this;
    var isUserInteracting=false, /*is user interacting*/
        onPointerDownPointerX=0, /*The location of the X when the mouse is pressed*/
        onPointerDownPointerY=0, /*The location of the Y when the mouse is pressed*/
        onPointerDownLon=0, /*the last location of the X when the mouse is pressed*/
        onPointerDownLat=0; /*the last location of the Y when the mouse is pressed*/
    /*mouse down enent*/
    document.addEventListener( 'mousedown', function( event ) {
        event.preventDefault();

        isUserInteracting = true;

        onPointerDownPointerX = event.clientX;
        onPointerDownPointerY = event.clientY;
        onPointerDownLon = that._lon;
        onPointerDownLat = that._lat;

    }, false );
    /*mouse move event*/
    document.addEventListener( 'mousemove', function( event ) {

        if ( isUserInteracting === true ) {

            that._lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
            that._lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

        }

    }, false );
    /*mouse up event*/
    document.addEventListener( 'mouseup', function( event ) {

        isUserInteracting = false;

    }, false );
    /*mouse wheel enent*/
    document.addEventListener( 'wheel', function( event ) {
        for(i=0;i<that.views.length;i++) {
            camera=that.views[i].camera;
            curFov = camera.fov;
            if (curFov > 90 || curFov < 10) {
                camera.fov -= event.deltaY * 0.05;
                return;
            } else {
                camera.fov += event.deltaY * 0.05;
            }
            camera.updateProjectionMatrix();
        }

    }, false );

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

    /*
     Determine the mobile phone screen event
     */
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function(){
        if(window.orientation==180||window.orientation==0){
            window.location.reload();
        }
        if(window.orientation==90||window.orientation==-90){
            window.location.reload()
        }
    }, false);

};
/*
 Determine the mobile phone screen state
 */
V_R.prototype._tip=function () {
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
V_R.prototype._isCrossScreen=function(){
    if(window.orientation==180||window.orientation==0){
        /*Vertical screen*/
        return false;
    }
    if(window.orientation==90||window.orientation==-90){
        /*is Cross Screen*/
        return true;
    }
};