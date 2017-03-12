THREE.Lut.prototype.addColorMap( 'rainbow_gist', [
[ 0.000000, '0xff0028' ], [ 0.031250, '0xff0100' ], [ 0.062500, '0xff2c00' ],
[ 0.093750, '0xff5700' ], [ 0.125000, '0xff8200' ], [ 0.156250, '0xffae00' ],
[ 0.187500, '0xffd900' ], [ 0.218750, '0xf9ff00' ], [ 0.250000, '0xceff00' ],
[ 0.281250, '0xa3ff00' ], [ 0.312500, '0x78ff00' ], [ 0.343750, '0x4dff00' ],
[ 0.375000, '0x22ff00' ], [ 0.406250, '0x00ff08' ], [ 0.437500, '0x00ff33' ],
[ 0.468750, '0x00ff5e' ], [ 0.500000, '0x00ff89' ], [ 0.531250, '0x00ffb3' ],
[ 0.562500, '0x00ffde' ], [ 0.593750, '0x00f4ff' ], [ 0.625000, '0x00c8ff' ],
[ 0.656250, '0x009dff' ], [ 0.687500, '0x0072ff' ], [ 0.718750, '0x0047ff' ],
[ 0.750000, '0x001bff' ], [ 0.781250, '0x0f00ff' ], [ 0.812500, '0x3a00ff' ],
[ 0.843750, '0x6600ff' ], [ 0.875000, '0x9100ff' ], [ 0.906250, '0xbc00ff' ],
[ 0.937500, '0xe800ff' ], [ 0.968750, '0xff00ea' ], [ 1.000000, '0xff00bf' ],
]);

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

function FFBOMesh3D(div_id, data, func) {

	this.func = func || undefined;
	this.div_id = div_id;
	this.meshDict = data;
	this.meshNum = (this.meshDict) ? Object.keys(this.meshDict).length : 0;

	this.container = document.getElementById( div_id );
	var height = this.container.clientHeight;
	var width = this.container.clientWidth;

	this.fov = 10;
	this.camera = new THREE.PerspectiveCamera( this.fov, width / height, 0.01, 1000 );
	this.camera.position.z = 20.0;
	this.camera.position.y = 0.0;

	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.renderer.setSize( width, height );
	this.container.appendChild(this.renderer.domElement);

	this.scene = new THREE.Scene();
	this.scene.add( this.camera );



	this.meshGroup = new THREE.Object3D(); // for raycaster detection

	this.currentIntersected;

	this.mouse = new THREE.Vector2(-100000,-100000);

	this.timeliner = {};
	this.timelinerJson = {};

	this.isAnim = false;

	this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
	this.controls.rotateSpeed = 2.0;
	this.controls.zoomSpeed = 1.0;
	this.controls.panSpeed = 2.0;
	this.controls.staticMoving = true;
	this.controls.dynamicDampingFactor = 0.3;
	this.controls.addEventListener('change', this.render.bind(this));

	this.frontlight = new THREE.DirectionalLight();
	this.frontlight.position.set( 0, 0, 5000 );
	this.scene.add( this.frontlight );

	this.backlight = new THREE.PointLight(0xffffff, 1, 50);
	this.backlight.position.set( 0, 0, -4 );
	this.scene.add( this.backlight );
/*
	this.frontlight = new THREE.PointLight(0xffffff, 1, 3);
	this.frontlight.position.set( 0, 0, 0 );
	this.scene.add( this.frontlight );

	this.backlight = new THREE.DirectionalLight();
	this.backlight.position.set( 0, 0, -5000 );
	this.scene.add( this.backlight );
*/
	/*
	 * create color map
	 */
	this.lut = new THREE.Lut( 'rainbow_gist', 2*this.meshNum+1 );
	this.lut.setMax( 1 );
	this.lut.setMin( 0 );

	this.loadingManager = new THREE.LoadingManager();
	var id = 0;
	for ( var key in this.meshDict ) {

		var filetype = this.meshDict[key].filename.split('.').pop();
		this.meshDict[key]['color'] = this.lut.getColor((2*id+1)/(2*this.meshNum+1) );
		if ( !('label' in this.meshDict[key]) )
			this.meshDict[key]['label'] = key;

		/* read mesh */
		var loader = new THREE.XHRLoader( this.loadingManager );
		if (filetype == "json")
			loader.load(this.meshDict[key].filename, this.loadMeshCallBack(key).bind(this));
		else if (filetype == "swc" ) {
			loader.load(this.meshDict[key].filename, this.loadSWCCallBack(key).bind(this));
		}

		id += 1;
	}



	this.scene.add( this.meshGroup );

	this.raycaster = new THREE.Raycaster();
	this.raycaster.linePrecision = 3;

	this.container.addEventListener( 'click', this.onDocumentMouseClick.bind(this), false );

	this.container.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );

	this.container.addEventListener( 'mouseenter', this.onDocumentMouseEnter.bind(this), false );

	this.container.addEventListener( 'mouseleave', this.onDocumentMouseLeave.bind(this), false );

	this.container.addEventListener( 'resize', this.onWindowResize.bind(this), false );

	this.isMouseOver = false;
	/* create tool tip */
	this.toolTipPos = new THREE.Vector2();
	this.createToolTip();
	this.animOpacity = {};
	this.dispatch = {
		'syncControls': undefined,
	};
};
FFBOMesh3D.prototype.setAnim = function(data) {
	for (var key in data) {
		if (this.meshDict[key].object === undefined)
			continue;
		this.animOpacity[key] = 0.1 + 0.9*data[key];
	}
	this.isAnim = true;
}
FFBOMesh3D.prototype.setLuminance = function(data) {
	for (var key in data) {
		if (this.meshDict[key].object === undefined)
			continue;
		var obj3Ds = this.meshDict[key].object.children;
		for (var i = 0; i < obj3Ds.length; ++i )
			obj3Ds[i].material.color.setScalar( data[key] );
	}
	this.isAnim = true;
}
FFBOMesh3D.prototype.stopAnim = function() {
	this.isAnim = false;
	/*
	for (var key in this.meshDict) {
		var obj3Ds = this.meshDict[key].object.children;
		for (var i = 0; i < obj3Ds.length; ++i )
			obj3Ds[i].material.color.setScalar( data[key] );
	}
	*/
}
FFBOMesh3D.prototype.animate = function() {

	requestAnimationFrame( this.animate.bind(this) );

	this.controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true
	if( this.isMouseOver && this.dispatch.syncControls)
		this.dispatch.syncControls(this)

	this.render();
}
FFBOMesh3D.prototype.loadMeshCallBack = function(key) {
	return function (jsonString) {

		var json = JSON.parse(jsonString);
		var color = this.meshDict[key]['color'];
		var geometry  = new THREE.Geometry();
		var vtx = json['vertices'];
		var idx = json['faces'];
		var center = {'x':0.0, 'y':0.0, 'z':0.0};
		var len = vtx.length / 3;
		for (var j = 0; j < len; j++) {
			var x = parseFloat(vtx[3*j+0]);
			var y = parseFloat(vtx[3*j+1]);
			var z = parseFloat(vtx[3*j+2]);
			geometry.vertices.push(
				new THREE.Vector3(x,y,z)
			);
			center.x += x/len;
			center.y += y/len;
			center.z += z/len;
		}
		for (var j = 0; j < idx.length/3; j++) {
			geometry.faces.push(
				new THREE.Face3(
					parseInt(idx[3*j+0]),
					parseInt(idx[3*j+1]),
					parseInt(idx[3*j+2])
				)
			);
		}

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		var materials = [
			//new THREE.MeshPhongMaterial( { color: color, shading: THREE.FlatShading, shininess: 0, transparent: true } ),
			new THREE.MeshLambertMaterial( { color: color, transparent: true, side: 2, shading: THREE.FlatShading} ),
			new THREE.MeshBasicMaterial( { color: color, shading: THREE.FlatShading, wireframe: true, transparent: true} )
		];
		var group = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );

		this._registerGroup(key, group, center);
	};

};
FFBOMesh3D.prototype.loadSWCCallBack = function(key) {
	return function(swcString) {
		/*
		 * process string
		 */
		var swc_ar = swcString.replace(/\r\n/g, "\n");
		var swc_ar = swc_ar.split("\n");
		var len = swc_ar.length;
		var swcObj = {};

		swc_ar.forEach(function (e) {
			//if line is good, put into json
			var seg = e.split(' ');
			if (seg.length == 7) {
				swcObj[parseInt(seg[0])] = {
					'type'   : parseInt  (seg[1]),
					'x'      : parseFloat(seg[2]),
					'y'      : parseFloat(seg[3]),
					'z'      : parseFloat(seg[4]),
					'radius' : parseFloat(seg[5]),
					'parent' : parseInt  (seg[6]),
				};
			}
		});

        var color = this.meshDict[key]['color'];
        var geometry  = new THREE.Geometry();
        var center = {'x':0.0, 'y':0.0, 'z':0.0};
        var sphereGeometry = undefined;
        
        for (var idx in swcObj ) {
            var c = swcObj[idx];
            sphereGeometry = new THREE.SphereGeometry( c.radius, 10, 10 );
            sphereGeometry.translate( c.x, c.y, c.z );
        }
        var group = new THREE.Object3D();
        var sphereMaterial = new THREE.MeshLambertMaterial( {color: color, transparent: false} );
        group.add(new THREE.Mesh( sphereGeometry, sphereMaterial));
        
        this._registerGroup(key, group, center);
	};
};

FFBOMesh3D.prototype._registerGroup = function(key, group, center) {

	/* create label for tooltip if not provided */
	group.name = this.meshDict[key].label;
	group.lpu_id = key;

	this.meshDict[key]['object']  = group;
	this.meshGroup.add( group );
	this.meshGroup.translateX(-center.x/this.meshNum);
	this.meshGroup.translateY(-center.y/this.meshNum);
	this.meshGroup.translateZ(-center.z/this.meshNum);
}
FFBOMesh3D.prototype.initTimeliner = function() {
	this.timelinerJson = {};
	for (var key in this.meshDict)
		this.timelinerJson[key] = 0;
	this.timeliner = new Timeliner(this.timelinerJson);
	/*
	 * load a dummy animation script
	 */
	var dummyAnimJson = {
		"version":"1.2.0",
		"modified":"Mon Dec 08 2014 10:41:11 GMT+0800 (SGT)",
		"title":"Untitled",
		"ui": {"totalTime": 1},
		"layers":[]
	}
	for (var key in this.meshDict) {
		var dict = {"name": key, "values": [{"time":0.01, "value":0.55}], "_value":0, "_color":"#6ee167"};
		dummyAnimJson["layers"].push(dict);
	}
	this.timeliner.load(dummyAnimJson);
}

FFBOMesh3D.prototype.onDocumentMouseClick = function( event ) {
	event.preventDefault();

	if ( this.currentIntersected !== undefined ) {
		this.currentIntersected.parent.visible = false;
		if (this.func != undefined) {
			this.func(this.currentIntersected.parent.lpu_id);
		}
	}
}

FFBOMesh3D.prototype.onDocumentMouseMove = function( event ) {
	event.preventDefault();

	var rect = this.container.getBoundingClientRect();

	this.toolTipPos.x = event.clientX + 10;
	this.toolTipPos.y = event.clientY + 10;
	this.mouse.x = ( (event.clientX - rect.left) / this.container.clientWidth ) * 2 - 1;
	this.mouse.y = - ( (event.clientY - rect.top) / this.container.clientHeight ) * 2 + 1;

}

FFBOMesh3D.prototype.onDocumentMouseLeave = function( event ) {
	event.preventDefault();

	this.isMouseOver = false;

	this.hide3dToolTip();

}

FFBOMesh3D.prototype.onDocumentMouseEnter = function( event ) {
	event.preventDefault();

	this.isMouseOver = true;
}

FFBOMesh3D.prototype.onWindowResize = function() {

	var height = this.container.clientHeight;
	var width = this.container.clientWidth;
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( width, height );

	this.controls.handleResize();

	this.render();
}

FFBOMesh3D.prototype.render = function() {

	if (this.isAnim) {
		for (var key in this.meshDict) {
			if (this.meshDict[key].object === undefined)
				continue;
			this.meshDict[key].object.children[0].material.opacity = this.animOpacity[key];
			if (this.meshDict[key].object.children.length > 1 )
				this.meshDict[key].object.children[1].material.opacity = 0.1;
		}
	} else {
		for (var key in this.meshDict) {
			if (this.meshDict[key].object === undefined)
				continue;
			var x = new Date().getTime();
			if (this.meshDict[key].object.children.length > 1 ) {
				this.meshDict[key].object.children[0].material.opacity = 0.05 + 0.05*Math.sin(x * .0005);
				//this.meshDict[key].object.children[1].material.opacity = 0.15 - 0.15*Math.sin(x * .0005);
				this.meshDict[key].object.children[1].material.opacity = 0.1;
				//this.meshDict[key].object.children[0].material.opacity = 0.2;
			} else {
				this.meshDict[key].object.children[0].material.opacity = 0.7 - 0.1*Math.sin(x * .0005);
				//this.meshDict[key].object.children[0].material.opacity = 0.8;
			}
		}
	}

	/*
	 * show label of mesh object when it intersects with cursor
	 */
	this.raycaster.setFromCamera( this.mouse, this.camera );

	var intersects = this.raycaster.intersectObjects( this.meshGroup.children, true);
	if ( intersects.length > 0 ) {
		if ( this.currentIntersected !== undefined ) {
			this.show3dToolTip(this.currentIntersected.parent.name);
		}
		this.currentIntersected = intersects[ 0 ].object;
	} else {
		if ( this.currentIntersected !== undefined ) {
			this.hide3dToolTip();
		}
		this.currentIntersected = undefined;
	}

	this.renderer.render( this.scene, this.camera );
}
/*
 * load Mesh Data from file system on server
 */

FFBOMesh3D.prototype.showAll = function() {
	for (var key in this.meshDict)
		this.meshDict[key].object.visible = true;
};

FFBOMesh3D.prototype.hideAll = function() {
	for (var key in this.meshDict)
		this.meshDict[key].object.visible = false;
};

FFBOMesh3D.prototype.show = function(key) {
	if (key in this.meshDict)
		this.meshDict[key].object.visible = true;
}

FFBOMesh3D.prototype.hide = function(key) {
	if (key in this.meshDict)
		this.meshDict[key].object.visible = false;
}

FFBOMesh3D.prototype.toggleVis = function(key) {
	if (key in this.meshDict)
		this.meshDict[key].object.visible = !this.meshDict[key].object.visible;
}

FFBOMesh3D.prototype.createToolTip = function() {
	this.toolTipDiv = document.createElement('div');
	this.toolTipDiv.style.cssText = 'position: fixed; text-align: center; width: auto; height: auto; padding: 2px; font: 12px arial; z-index: 999; background: lightsteelblue; border: 0px; border-radius: 8px; pointer-events: none; opacity: 0.0;';
	this.toolTipDiv.style.transition = "opacity 0.5s";
	document.body.appendChild(this.toolTipDiv);
}

FFBOMesh3D.prototype.show3dToolTip = function (d) {
	this.toolTipDiv.style.opacity = .9;
	this.toolTipDiv.style.left = this.toolTipPos.x + "px";
	this.toolTipDiv.style.top = this.toolTipPos.y + "px";
	this.toolTipDiv.innerHTML = "<h5>" + d + "</h5>";
}

FFBOMesh3D.prototype.hide3dToolTip = function () {
	this.toolTipDiv.style.opacity = 0.0;
}
FFBOMesh3D.prototype.initScreen = function () {
	var geometry = new THREE.SphereGeometry( 1, 80, 50, Math.PI, Math.PI, 0, Math.PI);

	var data = new Float32Array( 80 * 50 );
	for (var i = 0; i < data.length; ++i) data[i] = 0.5;
	var texture = new THREE.DataTexture( data, 80, 50, THREE.LuminanceFormat, THREE.FloatType);

	texture.needsUpdate = true; // required
	var material = new THREE.MeshPhongMaterial( { map: texture, overdraw: 0.5 } );
	this.screen = new THREE.Mesh( geometry, material );
	this.screen.material.side = THREE.DoubleSide;
	this.screen.material.needsUpdate = true;
	this.scene.add( this.screen );

	var ringGeometry = new THREE.RingGeometry( 0.99, 1.01, 1024 );
	var ringMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
	this.ringMesh = new THREE.Mesh( ringGeometry, ringMaterial );
	this.scene.add( this.ringMesh );

}
FFBOMesh3D.prototype.setScreenTexture = function (map) {
	this.screen.material.map = map;
	this.screen.material.map.minFilter = THREE.LinearFilter;
	this.screen.material.map.needsUpdate = true;
	this.screen.material.needsUpdate = true;
}
FFBOMesh3D.prototype.syncControls = function (ffbomesh) {
	if (this === ffbomesh)
		return;

	this.controls.target.copy( ffbomesh.controls.target );
	this.camera.position.copy( ffbomesh.camera.position );
	this.camera.up.copy( ffbomesh.camera.up );

	this.camera.lookAt( ffbomesh.controls.target );
}

