precision highp float;
varying vec4 vColor;
varying vec2 vSize;
varying float vAngle;
varying float vIndex;

varying vec4 v_color;
varying vec2 v_size;
varying float v_angle;
varying float v_index;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scrollscale;
uniform float u_winscale;

float randomNoise(vec2 p) {
  return fract(16791.414*sin(7.*p.x+p.y*73.41));
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float noise3 (in vec2 _st, in float t) {
    vec2 i = floor(_st+t);
    vec2 f = fract(_st+t);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm3 ( in vec2 _st, in float t) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise3(_st, t);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}


void main() {
    vec2 xyclip = 2.*(gl_PointCoord.xy - .5);
    vec2 xyrot;
    xyrot.x = xyclip.x * cos(v_angle) - xyclip.y * sin(v_angle);
    xyrot.y = xyclip.x * sin(v_angle) + xyclip.y * cos(v_angle);


    float ratio = v_size.x/v_size.y;
    float ms = max(v_size.x, v_size.y);
    float mms = min(v_size.x, v_size.y);

    xyrot.y *= ms/v_size.y;
    xyrot.x *= ms/v_size.x;

    //float f1 = .2*(-.5 + fbm3(xyrot.xy*1., 0.0+mod(v_index/100., 1.0)));
    //float f2 = .2*(-.5 + fbm3(xyrot.xy*1., 10.310+mod(v_index/100., 1.0)));
    //xyrot.x += f1;
    //xyrot.y += f2;

    float dist = length(xyrot);
    float alpha = 1. - smoothstep(0.4, 0.5, dist);
    gl_FragColor = vec4( vec3(alpha), 0. );
    gl_FragColor = vec4( v_color.rgb, alpha*v_color.a );
    gl_FragColor = vec4( v_color.rgb*alpha*v_color.a, alpha*v_color.a );
}