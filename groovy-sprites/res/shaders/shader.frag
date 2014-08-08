// int GROOVE_LEVELS defined default=8
uniform vec2 RENDERER_SCALE;
uniform vec2 TEXTURE_SIZE;
uniform vec2 TEXTURE_DELTA;
uniform sampler2D texture;
uniform sampler2D grooveTexture;
uniform vec3 grooveDir;

varying vec4 vWorldPos;
varying vec4 texCoord0;

int maxG = -1;
int maxI = -1;
vec4 color = vec4(0.0);

vec2 grooveDisplacement (int level) {
	vec2 grooveScale = grooveDir.y*(RENDERER_SCALE - vec2(1.0))/2.0;
	return -grooveDir.xz*grooveScale* float(level)/float(GROOVE_LEVELS);
}

bool fallsOnRange (vec2 coord) {
	return coord.x > 0.0 && coord.x < 1.0 &&
		coord.y > 0.0 && coord.y < 1.0;
}

bool fallsOnExtendedRange (vec2 coord) {
	return coord.x + TEXTURE_DELTA.x > 0.0 && coord.x - TEXTURE_DELTA.x < 1.0 &&
		coord.y + TEXTURE_DELTA.y > 0.0 && coord.y - TEXTURE_DELTA.y< 1.0;
}

float lightFromGroove (int g) {
	float groove = float(g)/float(GROOVE_LEVELS);	
	float lightApport = 0.5;
	return groove*lightApport + (1.0-lightApport);
}

bool getColor (int i, vec2 grooveCoord) {
	vec4 groove = texture2D(grooveTexture, grooveCoord);
	int g = int(groove.r * float(GROOVE_LEVELS));
	int aux = int(min(float(g),float(i)));
	
	if (aux >= i && aux - maxI > aux - i) {
		color = texture2D(texture, grooveCoord);
		
		color *= lightFromGroove(aux);

		maxG = aux;
		maxI = i;

		return true;
	}
	return false;
}

void main(void) {
	vec2 texCoord = texCoord0.xy * RENDERER_SCALE - (RENDERER_SCALE - vec2(1.0))/2.0;
	vec2 grooveCoord = texCoord;
	vec2 displ1 = grooveDisplacement(1);
	vec2 displ;
	
	for (int i = GROOVE_LEVELS; i >= 0; --i) {
		displ = grooveDisplacement(i);
		grooveCoord = texCoord + displ;
		
		if (fallsOnRange(grooveCoord)) {
			bool colored = getColor(i, grooveCoord);
		}
	}
	
	if (color.a <= 0.0) {
		discard;
	}
	gl_FragColor = color;
}