
precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 u_resolution;
uniform float u_seed1;
uniform float u_seed2;
uniform float u_seed3;
uniform float u_horizon;

varying vec2 v_uv;

//uniform float sigma;     // The sigma value for the gaussian function: higher value means more blur
                        // A good value for 9x9 is around 3 to 5
                        // A good value for 7x7 is around 2.5 to 4
                        // A good value for 5x5 is around 2 to 3.5
                        // ... play around with this based on what you need :)

//uniform float blurSize;  // This should usually be equal to
                        // 1.0f / texture_pixel_width for a horizontal blur, and
                        // 1.0f / texture_pixel_height for a vertical blur.

const float pi = 3.14159265;

const float numBlurPixelsPerSide = 4.0;
float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec4 blur(vec2 coor, float blurSize, vec2 direction){
    float sigma = 3.0;
    // Incremental Gaussian Coefficent Calculation (See GPU Gems 3 pp. 877 - 889)
    vec3 incrementalGaussian;
    incrementalGaussian.x = 1.0 / (sqrt(2.0 * pi) * sigma);
    incrementalGaussian.y = exp(-0.5 / (sigma * sigma));
    incrementalGaussian.z = incrementalGaussian.y * incrementalGaussian.y;
    
    vec4 avgValue = vec4(0.0, 0.0, 0.0, 0.0);
    float coefficientSum = 0.0;
    
    // Take the central sample first...
    avgValue += texture2D(tDiffuse, coor.xy) * incrementalGaussian.x;
    coefficientSum += incrementalGaussian.x;
    incrementalGaussian.xy *= incrementalGaussian.yz;
    
    // Go through the remaining 8 vertical samples (4 on each side of the center)
    for (float i = 1.0; i <= numBlurPixelsPerSide; i++) { 
        avgValue += texture2D(tDiffuse, coor.xy - i * blurSize * 
                            direction) * incrementalGaussian.x;         
        avgValue += texture2D(tDiffuse, coor.xy + i * blurSize * 
                            direction) * incrementalGaussian.x;         
        coefficientSum += 2. * incrementalGaussian.x;
        incrementalGaussian.xy *= incrementalGaussian.yz;
    }
    
    return avgValue / coefficientSum;
}

void main() {

    vec2 xy = gl_FragCoord.xy;
    vec2 uv = xy / u_resolution;
    
    float qq = pow(2.*abs(uv.x-.5), 2.)*.84;

    qq = pow(length((uv - .5)*vec2(.72,1.))/length(vec2(.5)), 2.) * .94;

    vec2 dir = uv - .5;
    dir.x *= .2;
    dir = vec2(dir.y, -dir.x);
    dir = dir / length(dir);
    qq = .3+.7*qq;

    qq *= smoothstep(1.-u_horizon, 0., uv.y);

    vec4 texelB = blur(uv, qq*2.3*1./u_resolution.x, dir);

    //float lum = texelB.r * 0.3 + texelB.g * 0.59 + texelB.b * 0.11;
    //lum = pow(lum, 0.15);
    //vec4 texelGray = vec4(vec3( lum ), 1.0);
    //texelGray = texelGray*0.5 + texelB*0.5;

    vec4 texel = texture2D( tDiffuse, (xy+vec2(+0.0, +0.0)) / u_resolution );
    //vec4 texel0 = texture2D( tDiffuse, vec2(.5) );

    //vec4 res = texelB*(1.-qq) + texelGray*qq + .0*(-.5+rand(xy*.1));
    texelB.r = pow(texelB.r, u_seed1);
    //texelB.g = pow(texelB.g, u_seed2);
    //texelB.b = pow(texelB.b, u_seed3);
    //float pp = (texelB.x+texelB.y+texelB.z)/3.;
    //texelB.x = texel.x + .2*(pp-texel.x);
    //texelB.y = texel.y + .2*(pp-texel.y);
    //texelB.z = texel.z + .2*(pp-texel.z);
    vec2 xxyy = vec2(0.);
    xxyy.x = hash12(xy*.123+.31);
    xxyy.y = hash12(xy*.223+.51);
    vec4 res = texel + .099*(-.5+hash12(xxyy*.1));
    // vvec4 res = texelB;

    gl_FragColor = vec4( res.rgb, 1.0 );

}