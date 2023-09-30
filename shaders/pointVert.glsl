precision highp float;
attribute vec2 a_position;
attribute vec4 a_color;
attribute vec2 a_size;
attribute float a_angle;
attribute float a_index;

varying vec4 v_color;
varying vec2 v_size;
varying float v_angle;
varying float v_index;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scrollscale;
uniform float u_winscale;


#define NUM_OCTAVES 6

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

vec4 hcrandom(vec3 co) {
    // Map the coordinates to the range [0, 1] so we can use them to sample the texture.
    vec2 uv = fract(co.xy);

    // Sample the texture and return a random value in the range [0, 1].
    return vec4(fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123));
}

const float F3 = 0.3333333;
const float G3 = 0.1666667;
vec3 random3(vec3 c) {
    return hcrandom(c).rgb;
}

float simplex3d(vec3 p) {
    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));
    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0 * G3;
    vec3 x3 = x - 1.0 + 3.0 * G3;
    vec4 w, d;
    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);
    w = max(0.6 - w, 0.0);
    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);
    w *= w;
    w *= w;
    d *= w;
    return .5 + .5 * dot(d, vec4(52.0));
}

void main() {
    //vAlpha = alpha;
    //vec4 mvPosition = vec4( a_position/u_resolution*2., 0., 1.0 );
    vec4 mvPosition = vec4( a_position.xy, 0., 1.0 );

    float pscale = max(a_size.x, a_size.y)*4. + 0.*5.*sin(u_time/60.*5. + .074414313*a_index);
    gl_PointSize = pscale * u_scrollscale * u_winscale * 1.4 * ((1.-.3)  + .2*(-1.+2.*random(mvPosition.xy+mod(u_time/100., 1.0))));
    //gl_PointSize = pscale * u_scrollscale * u_winscale * .5;
    gl_Position = mvPosition;


    // drawing animation
    //if(index/2250. > u_time)
    //    gl_PointSize = 0.;

    float offset = simplex3d(vec3(a_position.xy*vec2(1.,2.)*.5, 0.))*3.;
    float aangle = a_angle + 0.85*sin(u_time/60.*2. + offset);


    v_color = a_color;

    //vColor.r *= .5 + (1.-.5)*2.*random(mvPosition.xy+mod(u_time/100.+.366, 1.0));
    //vColor.g *= .5 + (1.-.5)*2.*random(mvPosition.xy+mod(u_time/100.+.253, 1.0));
    //vColor.b *= .5 + (1.-.5)*2.*random(mvPosition.xy+mod(u_time/100.+.112, 1.0));

    v_size = a_size;
    v_angle = aangle;
    v_index = a_index;
}