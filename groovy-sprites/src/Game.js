require([
   
	'goo/entities/GooRunner',
	'goo/util/rsvp',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/components/ScriptComponent',
	'goo/math/Vector3',
	
	'src/GroovySprite'

], function (	
	GooRunner,
	RSVP,
	TextureCreator,
	Texture,
	Camera,
	CameraComponent,
	ScriptComponent,
	Vector3,
	
	GroovySprite
) {
	'use strict';
	
	/*************
	 * Constants *
	 *************/
	
	
	/********
	 * Init *
	 ********/
	var goo = new GooRunner({
		debugKeys: true,
		showStats: true,
		antialias: false,
		logo: false
	});
	window.goo = goo;
	
	goo.renderer.domElement.id 	= 'goo';

	goo.renderer.setClearColor(0.60, 0.8, 0.55, 1);
	goo.doRender = true;

	document.body.appendChild(goo.renderer.domElement);
	
	goo.worldHeight = 3;
	goo.ratio = goo.renderer.domElement.clientHeight / goo.renderer.domElement.clientWidth;
	
	// Object loading
	var textureSettings = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettingsGroovy = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettings2 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettingsGroovy2 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettings3 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettingsGroovy3 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettings4 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	var textureSettingsGroovy4 = {
		magFilter: 'NearestNeighbor',
		minFilter: 'NearestNeighborNoMipMaps',
		generateMipmaps: 'false'
	};
	
	var castleTexturePromise = new RSVP.Promise();
	var castleGroovyPromise = new RSVP.Promise();
	var towerTexturePromise = new RSVP.Promise();
	var towerGroovyPromise = new RSVP.Promise();
	var screwTexturePromise = new RSVP.Promise();
	var screwGroovyPromise = new RSVP.Promise();
	var gooTexturePromise = new RSVP.Promise();
	var gooGroovyPromise = new RSVP.Promise();
	
	var textureCreator = new TextureCreator();
	var castleTexture = textureCreator.loadTexture2D('res/sprites/castle.png',textureSettings, function () { castleTexturePromise.resolve()});
	var castleGroovyTexture = textureCreator.loadTexture2D('res/sprites/castle_h.png',textureSettingsGroovy, function () { castleGroovyPromise.resolve();});
	var towerTexture = textureCreator.loadTexture2D('res/sprites/tower.png',textureSettings2, function () { towerTexturePromise.resolve()});
	var towerGroovyTexture = textureCreator.loadTexture2D('res/sprites/tower_h.png',textureSettingsGroovy2, function () { towerGroovyPromise.resolve();});
	var screwTexture = textureCreator.loadTexture2D('res/sprites/screw.png',textureSettings3, function () {	screwTexturePromise.resolve()});
	var screwGroovyTexture = textureCreator.loadTexture2D('res/sprites/screw_h.png',textureSettingsGroovy3, function () {	screwGroovyPromise.resolve()});
	var gooTexture = textureCreator.loadTexture2D('res/sprites/goo_logo.png',textureSettings4, function () { gooTexturePromise.resolve()});
	var gooGroovyTexture = textureCreator.loadTexture2D('res/sprites/goo_logo_h.png',textureSettingsGroovy4, function () { gooGroovyPromise.resolve()}); 
	
	new RSVP.all([
		castleTexturePromise, castleGroovyPromise,
		towerTexturePromise, towerGroovyPromise,
		screwTexturePromise, screwGroovyPromise,
		gooTexturePromise, gooGroovyPromise
	]).then(init);

	
	var centerRotation = 0;
	var rotationSpeed = 1;
	var rotationDrag = 1;
	var impulse = 1;

	var mouseStatus = {
		down: false,
		downTime: 0.0,
		moveTime: 0.0,
		moved: false,
		lastMouseDown: new Vector3()
	};
	window.ms = mouseStatus;

	function mousedown (event) {
		mouseStatus.down = true;
		mouseStatus.downTime = goo.world.time;
		mouseStatus.moveTime = goo.world.time;
		mouseStatus.lastMouseDown.x = event.pageX || event.touches[0].clientX;
		mouseStatus.lastMouseDown.y = event.pageY || event.touches[0].clientY;
	}

	function mousemove (event) {
		var pos = new Vector3(
			event.pageX || event.touches[0].clientX,
			event.pageY || event.touches[0].clientY,
			0.0
		);
		var diffTime = goo.world.time - mouseStatus.moveTime;
		if (diffTime > 0) {

			// Sometimes when touch screens, this event fires but the user
			// has not moved the finger (really low movement, now 10 px)
			if (pos.distance(mouseStatus.lastMouseDown) > 10) {
				mouseStatus.moved = true;

				if (mouseStatus.down) {
					var sign = (pos.y > goo.renderer.domElement.height/2)? -1 : 1;
					var speed = sign*((mouseStatus.lastMouseDown.x - pos.x)/goo.renderer.domElement.width)/diffTime;
					
					if (rotationSpeed*speed < 0) { // Changing speed
						rotationSpeed = speed;
					}
					else {
						var sign = (speed < 0)? -1 : 1;
						rotationSpeed = sign*Math.max(Math.abs(rotationSpeed), Math.abs(speed));
					}
				}
			}
		}			

		mouseStatus.moveTime = goo.world.time;
		mouseStatus.lastMouseDown.x = event.pageX || event.touches[0].clientX;
		mouseStatus.lastMouseDown.y = event.pageY || event.touches[0].clientY;
	}

	function mouseup (event) {
		var diffTime = goo.world.time - mouseStatus.downTime;

		if ((!mouseStatus.moved || diffTime < 0.2) && diffTime < 0.5) { // Tap/fast click
			rotationSpeed += Math.random()*impulse;
		}

		mouseStatus.moved = event.touches && event.touches.length == 0;
		mouseStatus.down = event.touches && event.touches.length != 0;
	}

	document.addEventListener('mousedown', mousedown);
	document.addEventListener('touchstart', mousedown);
	document.addEventListener('mousemove', mousemove);
	document.addEventListener('touchmove', mousemove);
	document.addEventListener('mouseup', mouseup);
	document.addEventListener('touchend', mouseup);

	function run (entity) {
		var t = entity._world.time;

		var pos = new Vector3().copy(entity.transformComponent.worldTransform.translation);
		pos.normalize();
		pos.z = entity.height;

		entity.gameObject.material.shader.uniforms.grooveDir = [pos.x, pos.z, pos.y];
		entity.setRotation([0,0,-centerRotation])
	}

	function rotate (entity) {
		var t = entity._world.time;
		var tpf = entity._world.tpf;

		var frameDrag = tpf*rotationDrag;
		rotationSpeed = rotationSpeed*(1.0 - frameDrag) + 0.0*frameDrag;
		centerRotation += tpf*rotationSpeed;

		entity.setRotation([0,0,centerRotation]);
		entity.setUpdated();
	}

	function init() {
		var center = goo.world.createEntity();
		center.addToWorld();
		center.set([0,0,0]);
		center.setComponent(new ScriptComponent({run: rotate}));

		var castleRatio = castleTexture.image.height / castleTexture.image.width;
		var castleLevels = 8;
		var castle = new GroovySprite(goo, 1/castleRatio, 1, castleLevels, 1, castleTexture, castleGroovyTexture);
		castle.entity.set([0, 1, 0]);
		castle.entity.setComponent(new ScriptComponent({run: run}));
		center.transformComponent.attachChild(castle.entity.transformComponent);
		castle.entity.height = 0.4;

		var towerRatio = towerTexture.image.height / towerTexture.image.width;
		var towerLevels = 8;
		var tower = new GroovySprite(goo, 1/towerRatio, 1, towerLevels, 1, towerTexture, towerGroovyTexture);
		tower.entity.set([1, 0, 0]);
		tower.entity.setComponent(new ScriptComponent({run: run}));
		center.transformComponent.attachChild(tower.entity.transformComponent);
		tower.entity.height = 0.5;

		var screwLevels = 8;
		var screwRatio = screwTexture.image.height / screwTexture.image.width;
		var screw = new GroovySprite(goo, 1/screwRatio, 1, screwLevels, (screwTexture.image.width/castleTexture.image.width)/(screwLevels/castleLevels), screwTexture, screwGroovyTexture);
		screw.entity.set([0, -1, 0]);
		screw.entity.setComponent(new ScriptComponent({run: run}));
		center.transformComponent.attachChild(screw.entity.transformComponent);
		screw.entity.height = 0.2;

		var gooLevels = 8;
		var gooRatio = gooTexture.image.height / gooTexture.image.width;
		var gooLogo = new GroovySprite(goo, 1/gooRatio, 1, gooLevels, (gooTexture.image.width/castleTexture.image.width)/(gooLevels/castleLevels), gooTexture, gooGroovyTexture);
		gooLogo.entity.set([-1, 0, 0]);
		gooLogo.entity.setComponent(new ScriptComponent({run: run}));
		center.transformComponent.attachChild(gooLogo.entity.transformComponent);
		gooLogo.entity.height = 0.1;

		
		var camera = new Camera();
		camera.setProjectionMode(Camera.Parallel);
		goo.worldWidth = goo.worldHeight / castleRatio;
		camera.setFrustum(0, 10, -1.2*goo.worldWidth/2, 1.2*goo.worldWidth/2, 1.2*goo.worldHeight/2, -1.2*goo.worldHeight/2);
		
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		cameraEntity.set([0,0,1]);
		cameraEntity.addToWorld();
	}
});