attribute vec3 vertexPosition;
attribute vec4 vertexUV0;

uniform mat4 viewProjectionMatrix;
uniform mat4 worldMatrix;

varying vec4 vWorldPos;
varying vec4 texCoord0;

void main(void) {
	
	vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);

	vWorldPos = worldPos;

	gl_Position = viewProjectionMatrix * vWorldPos;

	texCoord0 = vertexUV0;
}