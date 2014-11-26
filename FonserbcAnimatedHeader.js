/**
 * This code would have taken longer without Towerthousand's nice repo at https://github.com/Towerthousand/Webgl-test
 */

/*********GOOGLE CODE*********/
/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
		 window.webkitRequestAnimationFrame ||
		 window.mozRequestAnimationFrame ||
		 window.oRequestAnimationFrame ||
		 window.msRequestAnimationFrame ||
		 function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
		   window.setTimeout(callback, 1000/60);
		 };
})();
/*********GOOGLE CODE*********/

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function max (x, y) {
	if (x > y) return x;
	return y;
}

function min (x, y) {
	if (x < y) return x;
	return y;
}

function abs (x) {
	if (x < 0) return -x;
	return x;
}

function loadTexture(gl, textureAsset) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureAsset); // Security exception (?)
	
	return texture;
}

function Timer() {
	this.gameTime = 0;
	this.maxStep = 0.05;
	this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function() {
	var wallCurrent = Date.now();
	var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
	this.wallLastTimestamp = wallCurrent;

	var gameDelta = Math.min(wallDelta, this.maxStep);
	this.gameTime += gameDelta;
	return gameDelta;
}

function AnimatedHeader(canvas) {
	this.gl = this.initWebGL(canvas);
	this.shaderProgram = this.initShaders("shader-vs","shader-fs");
	//this.shaderProgram = this.initShadersFromSrcs(vertexShaderSrc, fragmentShaderSrc);
	
	//ModelView Matrix & stack
	this.mvMatrix = mat4.create();
	this.mvMatrixStack = [];
	this.drawColor = vec3.fromValues(0.0,0.0,0.0);

	this.FOVY = 45;
	this.ZNEAR = 3;
	this.ZFAR = 17;
	this.cameraZ = 10.0;
	this.ratio = this.gl.viewportWidth / this.gl.viewportHeight;
	
	// For light purpouses
	this.nearPlaneY = Math.tan(degToRad(this.FOVY)/2.0)*this.ZNEAR;
	this.nearPlaneX = abs(Math.tan(degToRad(this.FOVY*this.ratio)/2.0))*this.ZNEAR;
	this.canvasRect = canvas.getBoundingClientRect();
	
	this.pMatrix = mat4.create();
	mat4.perspective(this.pMatrix,this.FOVY, this.ratio, this.ZNEAR, this.ZFAR);

	this.timer = new Timer();

	//cube
	this.cube = new Cube(this.gl, "fon-light.png");
	this.rot = 0.0;
		this.rotSpeed = 100.0; // Initial rotation Speed

	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.clearColor(210.0/255.0,250.0/255.0,250.0/255.0, 1.0);
	
	this.lightPos = this.canvasToWorldSpace(canvas.width/2.0, canvas.height/2.0);
	
	//input
	this.mouseDown = false;
	this.mouseOver = false;
	this.canMove = false;
	this.mouseX = 0;
	this.mouseY = 0;
	this.newMouseX = 0;
	this.newMouseY = 0;	
	var AnimatedHeader = this;
	canvas.onmousedown = function(event) { AnimatedHeader.handleMouseDown(event); };
	canvas.onmouseup = function(event) { AnimatedHeader.handleMouseUp(event); };
	document.onmousemove = function(event) { AnimatedHeader.handleMouseMove(event); };
	canvas.onmouseover = function(event) { AnimatedHeader.handleMouseOver(event); };
	canvas.onmouseout = function(event) { AnimatedHeader.handleMouseOut(event); };
}

AnimatedHeader.prototype.canvasToWorldSpace = function(x, y) {
	var cx = (x - canvas.width/2.0)/(canvas.width/2.0)*this.nearPlaneX;
	var cy = -(y - canvas.height/2.0)/(canvas.height/2.0)*this.nearPlaneY;
	return [cx,cy,this.cameraZ*0.5];
}

AnimatedHeader.prototype.handleMouseDown = function(event) {		
	this.mouseDown = true;
}

AnimatedHeader.prototype.handleMouseUp = function(event) {
	this.mouseDown = false;
}

AnimatedHeader.prototype.handleMouseOver = function(event) {
	this.mouseOver = true;

	if (event.clientX > document.body.clientWidth/2.0 - canvas.height/2.0 &&
		event.clientX < document.body.clientWidth/2.0 + canvas.height/2.0) {
		this.canMove = true;
	}
}

AnimatedHeader.prototype.handleMouseOut = function(event) {
	this.mouseOver = false;
	this.canMove = false;
}

AnimatedHeader.prototype.handleMouseMove = function(event) {
	this.newMouseX = event.clientX;
	this.newMouseY = event.clientY;
	
	if (event.clientX > document.body.clientWidth/2.0 - canvas.height/2.0 &&
		event.clientX < document.body.clientWidth/2.0 + canvas.height/2.0) {
		this.canMove = true;
	}
	else this.canMove = false;
}

AnimatedHeader.prototype.handleMouse = function(deltaTime) {
	var deltaX = this.newMouseX -this.mouseX;
	var deltaY = this.newMouseY -this.mouseY;

	deltaX *= 2.5;
	if (this.mouseOver && this.canMove) {
		if (this.mouseDown == false && deltaX != 0.0) {
			if (this.rotSpeed < 0 && deltaX < 0)
				this.rotSpeed = min(this.rotSpeed, deltaX);
			else if (this.rotSpeed > 0 && deltaX > 0)
				this.rotSpeed = max(this.rotSpeed, deltaX);
			else this.rotSpeed = deltaX;
		}
	}
	
	this.lightPos = this.canvasToWorldSpace(this.mouseX - this.canvasRect.left, this.mouseY - this.canvasRect.top);
	
	this.mouseX = this.newMouseX;
	this.mouseY = this.newMouseY;
}

AnimatedHeader.prototype.initWebGL = function(canvas) {
	try {
		var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {}
	if (!gl) {
		alert("Could not init WebGL");
	}
	return gl;
}

AnimatedHeader.prototype.getShader = function(id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) { //text type
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = this.gl.createShader(this.gl.VERTEX_SHADER);
	} else {
		return null;
	}

	this.gl.shaderSource(shader, str);
	this.gl.compileShader(shader);
	if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) { //Compiling error
		alert(this.gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

AnimatedHeader.prototype.initShaders = function(stringV,stringF) { //retorna un programa a partir de dos shaders
	var vertexShader = this.getShader(stringV);
	var fragmentShader = this.getShader(stringF);

	var program = this.gl.createProgram();
	this.gl.attachShader(program, vertexShader);
	this.gl.attachShader(program, fragmentShader);
	this.gl.linkProgram(program);

	if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
		alert("Could not init shaders");
		alert(this.gl.getProgramInfoLog(program));
	}

	this.gl.useProgram(program);

	//Attributes and Uniforms
	program.vertexPositionAttribute = this.gl.getAttribLocation(program, "aPosition");
	this.gl.enableVertexAttribArray(program.vertexPositionAttribute);

	program.vertexNormalAttribute = this.gl.getAttribLocation(program, "aNormal");
	this.gl.enableVertexAttribArray(program.vertexNormalAttribute);
	
	program.textureCoordAttribute = this.gl.getAttribLocation(program, "aTexCoord");
	this.gl.enableVertexAttribArray(program.textureCoordAttribute);

	program.pMatrixUniform = this.gl.getUniformLocation(program, "uPMatrix");
	program.mvMatrixUniform = this.gl.getUniformLocation(program, "uMVMatrix");
	program.nMatrixUniform = this.gl.getUniformLocation(program, "uNMatrix");
	program.lightPosUniform = this.gl.getUniformLocation(program, "uLightPos");
	program.samplerUniform = this.gl.getUniformLocation(program, "sampler");
	
	return program;
}

AnimatedHeader.prototype.mvPushMatrix = function() {
	var c = mat4.create();
	mat4.copy(c,this.mvMatrix);
	this.mvMatrixStack.push(c);
}

AnimatedHeader.prototype.mvPopMatrix = function() {
	if (this.mvMatrixStack.length == 0) {
		throw "PopMatrix no ha trobat cap matriu desada!"; 
	}
	this.mvMatrix = this.mvMatrixStack.pop();
}

AnimatedHeader.prototype.setMatrixUniforms = function() { //enviem totes les uniforms del programa actual
	this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, this.mvMatrix);
	this.gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
	this.gl.uniform3fv(this.shaderProgram.lightPosUniform, this.lightPos);
}

AnimatedHeader.prototype.update = function() {
	var deltaTime = this.timer.tick();

	AnimatedHeader.handleMouse(deltaTime);
	
	this.rot += this.rotSpeed*deltaTime;
	this.rotSpeed = this.rotSpeed*((3.0 - deltaTime)/3.0); //Lerp into 0
}

AnimatedHeader.prototype.draw = function() {
	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	//resetejar la ModelView
	mat4.identity(this.mvMatrix);
	
	//camera
	mat4.translate(this.mvMatrix, this.mvMatrix,[0,0,-this.cameraZ]);
	
	//cube
	this.mvPushMatrix();
		mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(this.rot), [0, 1, 0]);
		
		mat4.mul(this.mvMatrix, this.mvMatrix, this.cube.modelM);
		
		this.setMatrixUniforms();
		this.cube.draw(this.gl,this.shaderProgram);
	this.mvPopMatrix();

}

var AnimatedHeader;
var assetManager;

function loop() {
	requestAnimFrame(loop);
	AnimatedHeader.update();
	AnimatedHeader.draw();
}

function initHeader() {
	var canvas = document.getElementById("canvas");
	
	assetManager = new AssetManager();
	
	assetManager.queueDownload("fon.png");
	assetManager.queueDownload("fon-light.png");
	
	assetManager.downloadAll(function() {
		AnimatedHeader = new AnimatedHeader(canvas);
		loop();
	});
}
