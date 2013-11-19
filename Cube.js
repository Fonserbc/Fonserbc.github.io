 function Cube(gl, textureSrc) {
 
	this.texture = loadTexture(gl, assetManager.getAsset(textureSrc));
	
	this.modelM = mat4.create();
	//BASE MODEL MATRIX
	mat4.identity(this.modelM);
	mat4.rotate(this.modelM, this.modelM, degToRad(90), [1, 0, 0]);
	mat4.rotate(this.modelM, this.modelM, degToRad(-11.25), [0, 1, 0]);
	mat4.rotate(this.modelM, this.modelM, degToRad(45), [0, 1, 0]);
	mat4.rotate(this.modelM, this.modelM, degToRad(45), [1, 0, 0]);
	mat4.scale(this.modelM, this.modelM, [5,5,5]);
	
	//POSITIONS
	this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
	vertices = [
            // Front
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            // Back
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5, -0.5, -0.5,

            // Top
            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,

            // Bottom 
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,

            // Right 
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5, -0.5,  0.5,

            // Left 
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = 24;

	//NORMALS
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        normals = [
            [ 0.0, 0.0, 1.0], // Front 
            [ 0.0, 0.0,-1.0], // Back 
            [ 0.0, 1.0, 0.0], // Top 
            [ 0.0,-1.0, 0.0], // Bottom 
            [ 1.0, 0.0, 0.0], // Right 
            [-1.0, 0.0, 0.0]  // Left 
        ];
        var unpackedNormals = [];
        for (var i in normals) {
            var normal = normals[i];
            for (var j=0; j < 4; j++) {
                unpackedNormals = unpackedNormals.concat(normal);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedNormals), gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = 24;

	//TEXTURE COORDS
	this.VertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexTextureCoordBuffer);
        var textureCoords = [
            // Front 
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back 
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top 
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom 
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right 
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left 
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        this.VertexTextureCoordBuffer.itemSize = 2;
        this.VertexTextureCoordBuffer.numItems = 24;
	
	//INDEXS
        this.VertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.VertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front
            4, 5, 6,      4, 6, 7,    // Back 
            8, 9, 10,     8, 10, 11,  // Top 
            12, 13, 14,   12, 14, 15, // Bottom 
            16, 17, 18,   16, 18, 19, // Right 
            20, 21, 22,   20, 22, 23  // Left 
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        this.VertexIndexBuffer.itemSize = 1;
        this.VertexIndexBuffer.numItems = 36;
    }

    Cube.prototype.draw = function(gl,shaderProgram) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.VertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
