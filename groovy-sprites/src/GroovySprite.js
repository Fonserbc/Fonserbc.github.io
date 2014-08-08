define('src/GroovySprite', [
	'goo/renderer/MeshData',
	'goo/renderer/Material',
	'goo/renderer/Shader',
	'goo/renderer/TextureCreator',
	'goo/shapes/Quad',
	
	'text!res/shaders/shader.vert',
 	'text!res/shaders/shader.frag'

], function (	
	MeshData,
	Material,
	Shader,
	TextureCreator,
	Quad,
	
	vertexShader,
	fragmentShader
) {
	'use strict';
	
	GroovySprite.GROOVE_DIR = "grooveDir";
	GroovySprite.GROOVE_LEVELS = "grooveLevels";
	GroovySprite.RENDERER_SCALE = "rendererScale";
	GroovySprite.TEXTURE_SIZE = "textureSize";
	GroovySprite.TEXTURE_DELTA = "textureDelta";

	function GroovySprite (goo, sizeX, sizeY, grooveLevels, pixelsPerLevel, texture, groovyTexture) {
		this.goo = goo;
		this.texture = texture;
		this.groovyTexture = groovyTexture;
		this.grooveLevels = grooveLevels;
		this.pixelsPerLevel = pixelsPerLevel;
		
		this.size = {
			x: sizeX,
			y: sizeY
		};
		this.pixelSize = {
			x: this.size.x / texture.image.width,
			y: this.size.y / texture.image.height
		};
		this.rendererSize = {
			x: this.size.x + this.pixelsPerLevel * this.pixelSize.x * grooveLevels * 2,
			y: this.size.y + this.pixelsPerLevel * this.pixelSize.y * grooveLevels * 2
		};
		
		this.meshData = new Quad(this.rendererSize.x, this.rendererSize.y);
		this.entity = goo.world.createEntity(this.meshData);
		
		this.material = new Material("Groovy", createShader());
		this.material.setTexture(Shader.DIFFUSE_MAP, texture);
		this.material.setTexture(Shader.NORMAL_MAP, groovyTexture);
		this.material.shader.uniforms.grooveDir = [0.1,1.0,0.5];
		this.material.shader.defines.GROOVE_LEVELS = this.grooveLevels;
		this.material.shader.uniforms.TEXTURE_SIZE = [this.texture.image.width, this.texture.image.height];
		this.material.shader.uniforms.RENDERER_SCALE = [this.rendererSize.x/this.size.x, this.rendererSize.y/this.size.y];
		this.material.shader.uniforms.TEXTURE_DELTA = [this.rendererSize.x/this.size.x/this.texture.image.width, this.rendererSize.y/this.size.y/this.texture.image.height];
		
		this.entity.set(this.material);
		this.entity.set([-goo.worldWidth/2 + this.rendererSize.x/2,0,0]);
		
		this.entity.gameObject = this;
		this.entity.addToWorld();
	}
	
	function createShader () {
		return {
			vshader : function() {return vertexShader;},
			fshader : function() {return fragmentShader;},
			
			defines: {
				GROOVE_LEVELS: GroovySprite.GROOVE_LEVELS
			},
			
			attributes: {
				vertexPosition: 'POSITION',
				vertexUV0: 'TEXCOORD0'
			},
			
			uniforms: {
				viewProjectionMatrix: Shader.VIEW_PROJECTION_MATRIX,
				worldMatrix: Shader.WORLD_MATRIX,
				texture: Shader.DIFFUSE_MAP,
				grooveTexture: Shader.NORMAL_MAP,
				grooveDir: GroovySprite.GROOVE_DIR,
				RENDERER_SCALE: GroovySprite.RENDERER_SCALE,
				TEXTURE_SIZE: GroovySprite.TEXTURE_SIZE,
				TEXTURE_DELTA: GroovySprite.TEXTURE_DELTA
			}
		};
	};
	
	return GroovySprite;
});