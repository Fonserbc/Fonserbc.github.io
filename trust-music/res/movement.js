/**
 * Implement this method to do initializing.
 * Called when pressing play and when running exported projects.
 */
var setup = function(args, ctx, goo) {
	
	goo.cameraEntity = ctx.entity;
	
	ctx.axis = {
		h: 0,
		v: 0,
		r : 0
	};
	
	ctx.hsize = {
		x: 0.3,
		y: 1,
		z: 0.3
	}
	
	ctx.keyDown = function (e) {
		switch (e.keyCode) {
			case 87: //W
				ctx.axis.v = 1;
				break;
			case 83: //S
				ctx.axis.v = -1;
				break;
			case 65: //A
				ctx.axis.h = 1;
				break;
			case 68: //D
				ctx.axis.h = -1;
				break;
			case 81: //Q
				ctx.axis.r = -1;
				break;
			case 69: //E
				ctx.axis.r = 1;
				break;
		}
	};
	
	ctx.keyUp = function (e) {
		switch (e.keyCode) {
			case 87: //W
				if (ctx.axis.v == 1) ctx.axis.v = 0;
				break;
			case 83: //S
				if (ctx.axis.v == -1) ctx.axis.v = 0;
				break;
			case 65: //A
				if (ctx.axis.h == 1) ctx.axis.h = 0;
				break;
			case 68: //D
				if (ctx.axis.h == -1) ctx.axis.h = 0;
				break;
			case 81: //Q
				if (ctx.axis.r == -1) ctx.axis.r = 0;
			case 69: //E
				if (ctx.axis.r == 1) ctx.axis.r = 0;
		}
		}
	};
	
	document.addEventListener("keydown", ctx.keyDown);
	document.addEventListener("keyup", ctx.keyUp);
	
	ctx.lastTime = ctx.world.time;
	ctx.vel = new goo.Vector3();
	ctx.acc = new goo.Vector3();
	
	ctx.needsReset = true;
	
	ctx.walkSound = ctx.entity.soundComponent.sounds[0];
	
	ctx.worldData.resetPlayer = function () {
		ctx.entity.setTranslation(ctx.worldData.startPoint);
		ctx.entity.addTranslation([0.5, ctx.hsize.y, 0.5]);
		ctx.entity.setRotation(goo.Vector3.ZERO);
		
		ctx.entity.transformComponent.setUpdated();
		document.exitPointerLock();
		ctx.domElement.requestPointerLock();
		
		ctx.needsReset = false;
		
		//ctx.otherCam = ctx.world.createEntity("newCamera", new goo.Camera(), [6, 0, 0]).addToWorld().lookAt(ctx.worldData.startPoint).setAsMainCamera();
		//console.log(ctx.otherCam, goo.Renderer.mainCamera);
	};
};

/**
 * Implement this method to do cleanup. Called on script stop and delete.
 */
var cleanup = function(args, ctx, goo) {
	document.removeEventListener("keydown", ctx.keyDown);
	document.removeEventListener("keyup", ctx.keyUp);
	
	//ctx.otherCam.removeFromWorld();
};

/**
 * This function will be called every frame.
 *
 * @param {object} args
 * Contains all the parameters defined in the 'parameters' variable below.
 * Its values are chosen in the scripts panel.
 *
 * @param {object} ctx
 * A contextual data object, unique for the script.
 * Properties on this object will be shared between the script's functions.
 * {
 *   entity: Entity,
 *   world: World,
 *   domElement: canvas,
 *   viewportWidth: number,
 *   viewportHeight: number,
 *   activeCameraEntity: Entity,
 *
 *   worldData: object,
 *              // Accessible to all scripts in the world.
 *				// Example: ctx.worldData.helloString = 'hello';
 *
 *   entityData: object
 *               // Accessible to all scripts on this entity.
 * }
 *
 * @param {object} goo
 * Contains most useful engine classes like goo.Vector3, goo.Matrix3x3, etc.
 * See API documentation for more info on the classes.
 */
var update = function(args, ctx, goo) {
	if (!ctx.worldData.levelLoaded) {
		ctx.needsReset = true;
		return;
	}
	else if (ctx.needsReset) {
		ctx.worldData.showDialog("Open your eyes", "(press SPACE..)");
		ctx.worldData.resetPlayer();
	}
	
	
	ctx.deltaTime = ctx.world.time - ctx.lastTime;
	ctx.lastTime = ctx.world.time;
	
	if (ctx.vel.length() < 0.01) {
		ctx.vel.copy(goo.Vector3.ZERO);
		ctx.walkSound.fadeOut(0.2).then(function() {
			ctx.walkSound.pause();
		}.bind(this));
	}
	else {
		if (!ctx.walkSound.isPlaying()) {
			ctx.walkSound.fadeIn(0.7);
		}
		var drag = new goo.Vector3().copy(goo.Vector3.ZERO).sub(ctx.vel);
		var dragMax = drag.length();
		drag.normalize();
		drag.scale(Math.min(dragMax, args.drag*ctx.deltaTime));
		
		ctx.vel.add(drag);
	}
	
	ctx.entity.cameraComponent.camera.addRotation(new goo.Vector3(0,ctx.axis.r*ctx.deltaTime,0));
	ctx.entity.cameraComponent.camera.transformComponent.setUpdated();

	var vertical = new goo.Vector3().copy(ctx.entity.cameraComponent.camera._direction);
	vertical.y = 0;
	vertical.normalize().scale(ctx.axis.v);
	
	var horizontal = new goo.Vector3().copy(ctx.entity.cameraComponent.camera._left);
	horizontal.y = 0;
	horizontal.normalize().scale(ctx.axis.h);
	
	ctx.acc.copy(vertical).add(horizontal).normalize();
	ctx.acc.scale(ctx.deltaTime*args.acc);
	
	if (ctx.worldData.eyesOpenFactor < 0.1) ctx.acc.copy(goo.Vector3.ZERO);
	
	ctx.vel.add(ctx.acc);
	
	if (ctx.vel.length() > args.speed) ctx.vel.normalize().scale(args.speed);
	
	var deltaTrans = new goo.Vector3().copy(ctx.vel).scale(ctx.deltaTime);
	
	ctx.entity.addTranslation(deltaTrans);
	
	var trans = ctx.entity.getTranslation();
	// Floor correction
	trans.y = goo.MathUtils.lerp(ctx.deltaTime*5.0, trans.y, ctx.worldData.getHeight(trans) + ctx.hsize.y);
	
	// Collision detection
	detectCollision(args, ctx, goo);
	
	ctx.entity.transformComponent.setUpdated();
};

var collisionCorrect = {
	"u" : function (args, ctx, goo, trans) {
		trans.z = Math.floor(trans.z) + ctx.hsize.z;
		if (ctx.vel.z > 0) ctx.vel.z = 0;
	},
	"b" : function (args, ctx, goo, trans) {
		trans.z = Math.floor(trans.z) + 1 - ctx.hsize.z;
		if (ctx.vel.z < 0) ctx.vel.z = 0;
	},
	"l" : function (args, ctx, goo, trans) {
		trans.x = Math.floor(trans.x) + ctx.hsize.x;
		if (ctx.vel.x > 0) ctx.vel.x = 0;
	},
	"r" : function (args, ctx, goo, trans) {
		trans.x = Math.floor(trans.x) + 1 - ctx.hsize.x;
		if (ctx.vel.x < 0) ctx.vel.x = 0;
	}
};
var collisionMap = {
	"falsefalsefalsefalse":	undefined,
	"truefalsefalsefalse": 	"br",
	"falsetruefalsefalse":	"bl",
	"truetruefalsefalse":	"b",
	"falsefalsetruefalse":	"ur",
	"truefalsetruefalse":	"r",
	"falsetruetruefalse":	"ulbr",
	"truetruetruefalse":	"br",
	
	"falsefalsefalsetrue":	"ul",
	"truefalsefalsetrue": 	"urbl",
	"falsetruefalsetrue":	"l",
	"truetruefalsetrue":	"bl",
	"falsefalsetruetrue":	"u",
	"truefalsetruetrue":	"ur",
	"falsetruetruetrue":	"ul",
	"truetruetruetrue":		undefined
};

var detectCollision = function (args, ctx, goo) {
	var col = ctx.worldData.getCollisionXY;
	var trans = ctx.entity.getTranslation();
	var prevTrans = new goo.Vector3().copy(trans);
	var hsize = ctx.hsize;
	
	var fract = {
		x: trans.x - Math.floor(trans.x),
		z: trans.z - Math.floor(trans.z)
	};
	
	var ul, ur, bl, br;
	
	ul = !col(trans.x + hsize.x, trans.z + hsize.z);
	ur = !col(trans.x - hsize.x, trans.z + hsize.z);
	bl = !col(trans.x + hsize.x, trans.z - hsize.z);
	br = !col(trans.x - hsize.x, trans.z - hsize.z);
	var count = 0 + ul + ur + bl + br;
	
	var correction = collisionMap[""+ul+ur+bl+br];
	if (!correction) return;
	else if (correction.length == 1) {
		collisionCorrect[correction](args, ctx, goo, trans);
	}
	else if (correction.length == 2) {
		if (count > 1) {
			collisionCorrect[correction[0]](args, ctx, goo, trans);
			collisionCorrect[correction[1]](args, ctx, goo, trans);
		}
		else {
			var hFirst = (fract.x - fract.z)*((1.0 - fract.x) - fract.z) > 0; // Magic
			
			var curr = {
				x: Math.floor(trans.x),
				z: Math.floor(trans.z)
			};
			var wrong = {
				x: Math.floor(trans.x + (ul || bl? 1 : -1)*hsize.x),
				z: Math.floor(trans.z + (ul || ur? 1 : -1)*hsize.z)
			}
			if ((curr.x == wrong.x && hFirst) || (curr.z == wrong.z && !hFirst)) {
				hFirst = !hFirst;
			}
			
			
			collisionCorrect[correction[hFirst? 1 : 0]](args, ctx, goo, trans);
		}
	}
	else {
		if (ul) { // UR <-> BL
			var up = (fract.x - fract.z) > 0;
			collisionCorrect[up? "u" : "b"](args, ctx, goo, trans);
			collisionCorrect[up? "r" : "l"](args, ctx, goo, trans);
		}
		else { // UL <-> BR
			var up = ((1.0 - fract.x) - fract.z) > 0;
			collisionCorrect[up? "u" : "b"](args, ctx, goo, trans);
			collisionCorrect[up? "l" : "r"](args, ctx, goo, trans);
		}
	}
};

/**
 * Parameters defined here will be available on the 'args' object as 'args.key'
 * and customizable using the script panel. Parameters are defined like below.
 * 'key', 'type', and 'default' are required properties.
 * {
 *   key: string,
 *   name: string,
 *   type: enum ('int', 'float', 'string', 'boolean', 'vec3'),
 *   control: enum (
 *    'slider', // Slider with min and max values.
 *    'color',  // Color picker for RGB vec3.
 *    'select', // Used together with the 'options' property.
 *   ),
 *   description: string, // Short tooltip description of the parameter.
 *   options: *[], // Array of values of specified type.
 *   default: *, // Preselected value. One of the options if options are used.
 *   min: number, // Can be used when data type is float or int.
 *   max: number, // Can be used when data type is float or int.
 *   precision: number, // Number of significant digits for float values.
 *   scale: number, // How fast number values change when dragging slider.
 *   exponential: boolean // Can be used together with slider.
 * }
 */
var parameters = [
{
	key: "speed",
	name: "Speed",
	type: "float",
	default: 10
},
{
	key: "acc",
	name: "Acceleration",
	type: "float",
	default: 10
},
{
	key: "drag",
	name: "Drag",
	type: "float",
	default: 50
}
];