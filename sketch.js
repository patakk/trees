import { rand, power, map, colorLightness, HSVtoRGB, constrain, myDot, isMobile, HSLtoRGB, radians } from './utils/utils.js';
import { noiseSeed, noise } from './utils/noise.js';
import { getSourceSynch, createShader, createProgram } from './utils/webglutils.js';
import { rybcolor } from './utils/colors.js';
let canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl', {
    antialias: false,
    depth: false,
    alpha: false,
    stencil: false,
    preserveDrawingBuffer: true,
});

const pointFragmentShaderSource = './shaders/pointFrag.glsl';
const pointVertShaderSource = './shaders/pointVert.glsl';
const utilsShaderSource = './shaders/utils.glsl';
const backgroundFragmentSource = './shaders/bgFragment.glsl';
const backgroundVertexSource = './shaders/bgVertex.glsl';

const utilsCode = getSourceSynch(utilsShaderSource);

const backgroundVertexCode = getSourceSynch(backgroundVertexSource);
const backgroundFragmentCode = getSourceSynch(backgroundFragmentSource).replace('#include "utils.glsl"', utilsCode);

const pointVertexCode = getSourceSynch(pointVertShaderSource).replace('#include "utils.glsl"', utilsCode);
const pointFragmentCode = getSourceSynch(pointFragmentShaderSource).replace('#include "utils.glsl"', utilsCode);

const vertexShader = createShader(gl, gl.VERTEX_SHADER, pointVertexCode);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, pointFragmentCode);
const backgroundVertexShader = createShader(gl, gl.VERTEX_SHADER, backgroundVertexCode);
const backgroundFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, backgroundFragmentCode);

var points;
var scale = 2.;
var ressy = scale*1400;
var ressx = scale*700;

fxrand();fxrand();fxrand();

if(fxrand() < .5){
    ressy = scale*700;
    ressx = scale*1400;
}
canvas.width = ressx;
canvas.height = ressy;

var baseWidth = 1;
var baseHeight = 1;
var canvasWidth = 1;
var canvasHeight = 1;
var winScale = Math.sqrt(scale)*.8;

var seed = fxrand()*10000;

function fxrandom(a, b){
    return a + (b - a)*fxrand();
}
var wind = 0.0;
var scrollscale = 1.3;
var globalIndex = 0;
var frameCount = 0;
var particlePositions = [];
var particleColors = [];
var particleSizes = [];
var particleAngles = [];
var particleIndices = [];

var horizon = fxrandom(0.7, 0.93);

var treeGroundSpread;

var sunPos;
var sunColor;
var sunSpread;
var isDark;
var hasSun;

var backgroundColor;

var shft = fxrandom(0.6, 1.05)%1.0;
var shft2 = fxrandom(0.0, 1.0)%1.0;
var hasAtt = fxrand() < .5;

let bumpiness = fxrandom(0.5, 5.0);
function getHorizon(x){
    var dispr = .5*baseHeight*(-.5*power(noise(x*0.003+3133.41), 3))
    return baseHeight*horizon + (1. - horizon*.8)*bumpiness*baseHeight*(-.5*power(noise(x*0.00031), 2)) + .0*dispr*fxrand();
}

function getHorizonX(x){
    return baseHeight*power(noise(x*0.00031), 2);
}

if(fxrand() < -.5){
    getHorizon = getHorizonX;
}


let offcl = [fxrandom(-42, 14), fxrandom(-37, 34), fxrandom(-37, 37)]
let skyclr = {
    a: [155, 121, 122, 255],
    ad: [88, 22, 22, 0],
    b: [88, 77, 83, 88],
    bd: [11, 55, 17, 88],
    c: [130, 85, 62, 255],
    cd: [39, 25, 22, 0],
}


let treeclr = {
    a: [154, 82, 70, 255],
    ad: [39, 25, 22, 0],
    b: [191, 95, 80, 255],
    bd: [39, 25, 22, 0],
    c: [183, 82, 70, 188],
    cd: [39, 25, 22, 33],
    d: [88, 77, 83, 118],
    dd: [11, 28, 17, 55],
    e: [88, 77, 83, 140],
    ed: [39, 25, 22, 30],
}

let groundclr = {
    c: [166, 134, 69, 255],
    cd: [49, 25, 22, 0],
    b: [88, 77, 99, 188],
    bd: [11, 28, 17, 55],
    a: [200, 125, 62, 255],
    ad: [44, 25, 22, 0],
}



function reset(){
	handleWindowSize();

    var ns = fxrandom(0, 100000);
    noiseSeed(ns);
    globalIndex = 0;
    scrollscale = 1.3;
    frameCount = 0;
    offcl = [fxrandom(-18, 18), fxrandom(-18, 18), fxrandom(-18, 18)]
    offcl = [0,0,0]
    seed = fxrand()*10000;
    horizon = fxrandom(0.24, 0.93);
    horizon = fxrandom(0.9, 0.93);

    isDark = fxrand() < .08;

    hasSun = fxrand() < 1.5;

    wind = fxrandom(-.4, +.4);
    if(fxrand() < .5)
        wind = 3.14 + wind;

    canvasWidth = ressx;
    canvasHeight = ressy;

    var ww = window.innerWidth || canvas.clientWidth || body.clientWidth;
    var wh = window.innerHeight|| canvas.clientHeight|| body.clientHeight;

    let aspect = ww/wh;

    baseWidth = ressx-33;
    baseHeight = ressy-33;

    let targetaspect = ressx/ressy;

    if(targetaspect > aspect){
        canvasWidth = ww;
        canvasHeight = ww/targetaspect;
    }
    else{
        canvasWidth = wh*targetaspect;
        canvasHeight = wh;
    }
    

    let sxx = fxrandom(0.05, 0.95);
    sunPos = [sxx, getHorizon(sxx*baseWidth)/baseHeight+fxrandom(-.0, .1)];
    sunSpread = fxrandom(1.1, 1.1)*2;


    var hsv = [Math.pow(fxrandom(0.0, 0.9), 2), fxrandom(0.2, 0.56), fxrandom(0.3, 0.76)]
    if(hsv[0] > 0.05){
        hsv[1] = fxrandom(0.14, 0.315)
    }
    if(isDark){
        hsv[2] *= .5;
    }

    backgroundColor = HSLtoRGB(hsv[0], hsv[1], hsv[2])
    sunColor = [fxrandom(0.992, 1.036+.02)%1.0, fxrandom(0.9, .96), fxrandom(.8, 1.0)]
    sunColor = HSVtoRGB(sunColor[0], sunColor[1], sunColor[2]);
    sunColor = [255.*sunColor[0], 255.*sunColor[1], 255.*sunColor[2]]
    if(isDark){
        sunColor = HSLtoRGB(fxrandom(0.5, .7), fxrandom(0.1, .2), fxrandom(.4, .6));
        sunColor = [255.*sunColor[0], 255.*sunColor[1], 255.*sunColor[2]]
        sunPos[1] = fxrandom(-.4, -.3);
        sunSpread = fxrandom(1.1, 1.1);
    }

    particlePositions = [];
    particleColors = [];
    particleSizes = [];
    particleAngles = [];
    particleIndices = [];

    generateBackground();
    generateForeground();
    generateTrees();

    // loadShadersAndData();

    prepareRender();
    renderLoop();
}

function renderLoop(){
    requestAnimationFrame(renderLoop);
    render();
}

function generateForegroundForRoot(root){
    return;

    if(root[1] < baseHeight*horizon + .23*(baseHeight-baseHeight*horizon)){
        return;
    }

    
   //rect(baseDim/2, baseDim*1.8, baseDim*2, baseDim*2);
    //var detail = 3;
    var amp = Math.min(baseWidth, baseHeight)/10;
    var frq = 0.002;
    //pg.fill(
    //    groundclr.a[0] + fxrandom(-groundclr.ad[0], groundclr.ad[0]),
    //    groundclr.a[1] + fxrandom(-groundclr.ad[1], groundclr.ad[1]),
    //    groundclr.a[2] + fxrandom(-groundclr.ad[2], groundclr.ad[2]),
    //    groundclr.a[3] + fxrandom(-groundclr.ad[3], groundclr.ad[3]),
    //);
    //pg.noStroke();
    //pg.rect(baseWidth/2, baseHeight*(1+horizon*1.1)/2, baseWidth, baseHeight*(1-horizon));
    var offcl1 = [fxrandom(-33, 34), fxrandom(-5, 34), fxrandom(-34, 14)]
    var offcl2 = [fxrandom(-14, 14), fxrandom(-14, 14), fxrandom(-14, 14)]
    var rr1 = fxrandom(0.25, 0.5); // .4155
    var rr2 = fxrandom(rr1, rr1+0.35) // .565
    var dispr = fxrandom(0.03, 0.09)

    var frqx = map(power(noise(xx*0.001, y*0.001, 22.555), 1), 0, 1, 0.3, 2);
    var frqy = frqx;
    frqx = .5;
    frqy = 3.;
    var frqyp = .04;
    var foregroundOpacity = fxrandom(122, 255);
    var attenuation = fxrandom(0, 0.3);
    for(let kk = 0; kk < 200; kk++){
        var x = root[0] + fxrandom(-77, 77);
        var y = root[1] + fxrandom(-10, 10);
        var pos, col, size, angle;
        var perspective = map(y, getHorizon(x), baseHeight*1.0, .6, 1);
        var ppfr = map(y, getHorizon(x), baseHeight*1.0, .7, 1);

        rr1 = map(noise(x*0.01, y*0.01+241.2141), 0, 1, 0.25, 0.5);
        rr2 = map(noise(x*0.01, y*0.01+33.44), 0, 1, rr1, rr1+0.35);
        dispr = map(noise(x*0.01, y*0.01+55.55), 0, 1, 0.03, 0.13);
        var xx = x;
        frqx = frqy = .5;
        frqy = 3*ppfr + (1-ppfr)*map(y, 0, baseHeight*1.0, 3, 2);
        frqy = map(y, getHorizon(x), baseHeight*1.0, 0, 1);
        frqy = Math.pow(frqy, .5)
        frqy = map(frqy, 0, 1, 7, .5);

        frqx *= .5;
        frqy *= .5;
        //var frqy = map(power(noise(xx*0.001, y*0.001, 313.31314), 1), 0, 1, 0.3, 2);
        var yy = y + 0*amp*(-power(noise(x*frq, y*frq), 2)) + fxrandom(-5,5);

        pos = [xx, yy];
        col = [
            offcl2[0] + groundclr.a[0] + fxrandom(-groundclr.ad[0], groundclr.ad[0]),
            offcl2[1] + groundclr.a[1] + fxrandom(-groundclr.ad[1], groundclr.ad[1]),
            offcl2[2] + groundclr.a[2] + fxrandom(-groundclr.ad[2], groundclr.ad[2]),
        groundclr.a[3]*.85 + fxrandom(-groundclr.ad[3], groundclr.ad[3]),
        ];
        if(fxrand() > 0.998){
            var rc = fxrandom(0, 255);
            col = [rc, rc, rc, fxrandom(140, 190)];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15;
            size = [fxrandom(10,20)*.2*perspective, 1.3*fxrandom(10,20)*.3*perspective];
            //mySquare(0, 0, fxrandom(10,20)*.2*perspective, fxrandom(10,20)*.3*perspective);
        }
        else{
            var dx = fxrandom(5, 10)*.3*perspective;
            size = [dx, dx*(1 + fxrandom(1.5, 1.8))];
            if(fxrandom(0,1000) > 960 || noise(xx*0.004*frqx, map(yy,getHorizon(xx), baseHeight, 0, 1)*frqy)+dispr*fxrandom(-1,1) < rr1 && fxrand()>0.4){

                col = [
                    offcl2[0] + groundclr.c[0] + fxrandom(-groundclr.cd[0], groundclr.cd[0]),
                    offcl2[1] + groundclr.c[1] + fxrandom(-groundclr.cd[1], groundclr.cd[1]),
                    offcl2[2] + groundclr.c[2] + fxrandom(-groundclr.cd[2], groundclr.cd[2]),
                    groundclr.c[3]*0 + fxrandom(-groundclr.cd[3], groundclr.cd[3]),
                ];
                size = [dx, dx*(1 + fxrandom(1.5, 1.8))];
            }
            else if(fxrandom(0,1000) > 960 || noise(xx*0.004*frqx, map(yy,getHorizon(xx), baseHeight, 0, 1)*5.02*frqy)+dispr*fxrandom(-1,1) < rr2 && fxrand()>0.4){
                col = [
                    offcl1[0] + groundclr.b[0] + fxrandom(-groundclr.bd[0], groundclr.bd[0]),
                    offcl1[1] + groundclr.b[1] + fxrandom(-groundclr.bd[1], groundclr.bd[1]),
                    offcl1[2] + groundclr.b[2] + fxrandom(-groundclr.bd[2], groundclr.bd[2]),
                    groundclr.b[3] + fxrandom(-groundclr.bd[3], groundclr.bd[3]),
                ];
                size = [dx, dx*(1 + fxrandom(1.5, 1.8))];
            }
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15 + fxrandom(-.1, .1);
            //mySquare(0, 0, fxrandom(5, 10)*.35*perspective, fxrandom(5, 10)*.35*perspective);
        }

        if(pos[0] < 0 || pos[0] > baseWidth)
            continue
        if(pos[1] < 0 || pos[1] > baseHeight)
            continue
        pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
        pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
        pos[1] *= -1;

        col[3] = foregroundOpacity;

        if(isDark){
            col[0] = col[0] + attenuation*(backgroundColor[0]*255 - col[0]);
            col[1] = col[1] + attenuation*(backgroundColor[1]*255 - col[1]);
            col[2] = col[2] + attenuation*(backgroundColor[2]*255 - col[2]);
        }

        var dir = [xx-sunPos[0]*baseWidth, yy-sunPos[1]*baseHeight];
        var ll = Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1])
        let maxll = baseWidth/2;
        var strength = 1.0 - Math.min(1.0, ll/maxll);
        let aaa = fxrandom(0,10)*0;
        if(yy < getHorizon(xx) + map(Math.pow(fxrand(), 3), 0, 1, 0, 63)+aaa*power(strength*3., 3)){
            // distance to sun calcualtion
            strength = strength*.7;
            let ddd = strength * 255;
            let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
            ssunColor[0] = constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
            ssunColor[1] = constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
            ssunColor[2] = constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
            col[0] = col[0]*(1-strength) + ssunColor[0]*strength;
            col[1] = col[1]*(1-strength) + ssunColor[1]*strength;
            col[2] = col[2]*(1-strength) + ssunColor[2]*strength;
        }
        else if(!isDark){
            let sunleakchance = map(yy, getHorizon(xx), baseHeight, 0, 1);
            sunleakchance = Math.pow(sunleakchance, 3);
            if(fxrand() > .8+.2*sunleakchance){
                let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
                ssunColor[0] = constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
                ssunColor[1] = constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
                ssunColor[2] = constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
                let strength = fxrandom(.6,1);
                col[0] = col[0]*(1-strength) + ssunColor[0]*strength;
                col[1] = col[1]*(1-strength) + ssunColor[1]*strength;
                col[2] = col[2]*(1-strength) + ssunColor[2]*strength;
            }
        }

        particlePositions.push(pos[0], pos[1]);
        particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
        particleSizes.push(size[0], size[1]);
        particleAngles.push(angle);
        particleIndices.push(globalIndex++);
    }
}

let roots = [];

function drawTree(rx, ry, kk, pp){
    
    //pg.noStroke();
    //pg.fill(255);
    //pg.ellipse(rx, ry, 40, 40);
    var perspective = map(ry, getHorizon(rx), baseHeight, 0.5, 0.8);
    var perspective2 = map(ry, getHorizon(rx), baseHeight, 0.1, 0.6);
    var perspective3 = map(ry, 0, baseHeight, 0.0, 1.0);
    if(perspective3 < .25){
        perspective3 = 0;
    }
    else{
        perspective3 = 1;
    }
    //perspective = 1;

    var seed1 = fxrandom(0, 100000);
    var detail = fxrandom(5, 8)*.45;
    var amp = 133;
    var frq = 0.0002;
    var pscale = map(ry, getHorizon(rx), baseHeight, 0.1, 1.0);
    var fade = map(ry, baseHeight*getHorizon(rx)*1.0, baseHeight, 0.88, 1.0);
    var maxwidth = 20;
    var startroot = fxrandom(0.92, 0.95);
    var rootmax = fxrandom(0.9, 2.2);
    let naskfnaskf = fxrand();

    var pos, col, size, angle;

    var offcl2 = [fxrandom(-25,+9), fxrandom(-15,+14), fxrandom(-25,+9)]
    var attenuation = fxrandom(.1, .5)
    if(!hasAtt)
        attenuation = 0;
    //pg.fill(map(ry, baseHeight*horizon*1.0, baseHeight, 222, 255));
    var coco = 0;
    for(var y = ry; y > 0; y -= detail*perspective){
        var rootwide0 = constrain(map(y, ry, ry*startroot, 1, 0), 0, 1);
        //rootwide = .8+.8*Math.pow(noise(rx, ry, y*.01), 3) + rootmax*Math.pow(rootwide, 4);
        var rootwide = 1 + rootmax*Math.pow(rootwide0, 4);
        for(var x = rx - pscale*maxwidth*rootwide, kaka=0; x < rx + pscale*maxwidth*rootwide; x += Math.max(1, 4*perspective), kaka++){
            if(y > ry-20){
                if(fxrand() < .9-.4*map(y, ry, ry-20, 0, 1)){
                    continue;
                }

            }

            var xx = x + perspective3*map(y, ry, 0, 0, 1)*amp*(-.5 + power(noise(rx*frq, y*frq, seed1), 2)) + fxrandom(-detail,detail)*1.7*(.4 + .6*Math.pow(1.-perspective2, 4));
            var yy = y + fxrandom(-detail,detail)*1.9 + 40*Math.pow(noise(x*0.04, y*0.04), 4)*rootwide0;
            col = [
                offcl2[0] + offcl[0] + fade*treeclr.c[0]*1.12 + fxrandom(-treeclr.cd[0], treeclr.cd[0]),
                offcl2[1] + offcl[1] + fade*treeclr.c[1] + fxrandom(-treeclr.cd[1], treeclr.cd[1]),
                offcl2[2] + offcl[2] + fade*treeclr.c[2] + fxrandom(-treeclr.cd[2], treeclr.cd[2]),
                treeclr.c[3]*.6 + fxrandom(-treeclr.cd[3], treeclr.cd[3]),
            ];
            
            pos = [xx, yy];
            if(noise(xx*0.05, yy*0.004) + map(ry, baseHeight*getHorizon(rx)*1.0, baseHeight, -.2, .2) < 0.2+fxrandom(-.3,.3)+y/baseHeight){
                if(sunPos[1]*baseHeight > baseHeight*.15+ getHorizon(sunPos[0]*baseWidth) && false){
                    col = [
                        offcl2[0] + offcl[0] + fade*treeclr.a[0]*.8 + fxrandom(-treeclr.ad[0], treeclr.ad[0]),
                        offcl2[1] + offcl[1] + fade*treeclr.a[1] + fxrandom(-treeclr.ad[1], treeclr.ad[1]),
                        offcl2[2] + offcl[2] + fade*treeclr.a[2] + fxrandom(-treeclr.ad[2], treeclr.ad[2]),
                        treeclr.a[3] + fxrandom(-treeclr.ad[3], treeclr.ad[3]),
                    ];

                }
                else{
                    col = [
                        offcl2[0] + offcl[0] + fade*treeclr.e[0] + fxrandom(-treeclr.ed[0], treeclr.ed[0]),
                        offcl2[1] + offcl[1] + fade*treeclr.e[1] + fxrandom(-treeclr.ed[1], treeclr.ed[1]),
                        offcl2[2] + offcl[2] + fade*treeclr.e[2] + fxrandom(-treeclr.ed[2], treeclr.ed[2]),
                        treeclr.e[3] + fxrandom(-treeclr.ed[3], treeclr.ed[3]),
                    ];

                }
                if(!hasSun){
                    col[0] = col[0] + .6*(backgroundColor[0]*255 - col[0]);
                    //col[1] = col[1] + .35*(backgroundColor[1]*255 - col[1]);
                    //col[2] = col[2] + .35*(backgroundColor[2]*255 - col[2]);
                }
                if(kk%10==319){
                    //col[0] = fxrandom(190, 250);
                    //col[1] = col[0];
                    //col[2] = col[0];
                    let h2r = HSVtoRGB(
                        (.98+.04*noise(xx*0.05+22.55, yy*0.004))%1.0+0*fxrandom(-.01,.01),
                        fxrandom(.4, .7), 
                        .35+.3*noise(xx*0.05+31.13, yy*0.004)+fxrandom(-.1,.1)+0.1,
                        );
                    //col = [h2r[0]*255., h2r[1]*255., h2r[2]*255., skyclr.c[3]*.6 + fxrandom(-treeclr.bd[3], treeclr.bd[3]),];
                }
            }
            else{
                    
                if(sunPos[1] < horizon+.1 && false){
                    var dir = [pos[0]-sunPos[0], pos[1]-sunPos[1]];
                    var ll = Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1])
                    dir[0] /= ll;
                    dir[1] /= ll;
                    var sc = fxrandom(-11, 222);
                    var ang = Math.atan2(dir[1], dir[0]);
                    ang = Math.round(ang*10)/.1;
                    dir[0] = Math.cos(ang);
                    dir[1] = Math.sin(ang);
                    dir[0] *= sc;
                    dir[1] *= sc;
                    pos[0] += dir[0];
                    pos[1] += dir[1];
                    col[0] = 222;
                    col[1] = 166;
                    col[2] = 133;
                    col[3] = 55;
                }  

                if(sunPos[1]*baseHeight > baseHeight*.15+ getHorizon(sunPos[0]*baseWidth) && false){
                    col = [
                        offcl2[0] + offcl[0] + fade*treeclr.a[0]*.8 + fxrandom(-treeclr.ad[0], treeclr.ad[0]),
                        offcl2[1] + offcl[1] + fade*treeclr.a[1] + fxrandom(-treeclr.ad[1], treeclr.ad[1]),
                        offcl2[2] + offcl[2] + fade*treeclr.a[2] + fxrandom(-treeclr.ad[2], treeclr.ad[2]),
                        treeclr.a[3] + fxrandom(-treeclr.ad[3], treeclr.ad[3]),
                    ];
                }
                else{
                    col = [
                        offcl2[0] + offcl[0] + fade*treeclr.c[0] + fxrandom(-treeclr.cd[0], treeclr.cd[0]),
                        offcl2[1] + offcl[1] + fade*treeclr.c[1] + fxrandom(-treeclr.cd[1], treeclr.cd[1]),
                        offcl2[2] + offcl[2] + fade*treeclr.c[2] + fxrandom(-treeclr.cd[2], treeclr.cd[2]),
                        treeclr.c[3] + fxrandom(-treeclr.cd[3], treeclr.cd[3]),
                    ];
                    
                    if(!hasSun){
                        col[0] = col[0] + attenuation*(backgroundColor[0]*255 - col[0]);
                        col[1] = col[1] + attenuation*(backgroundColor[1]*255 - col[1]);
                        //col[1] = col[1] + .35*(backgroundColor[1]*255 - col[1]);
                        //col[2] = col[2] + .35*(backgroundColor[2]*255 - col[2]);
                    }
                }
                
                if(noise(xx*0.05, yy*0.004) + map(ry, baseHeight*horizon*1.0, baseHeight, -.2, .2) < 0.5+fxrandom(-.1,.1)){
                    //col = [
                    //    offcl2[0] + offcl[0] + fade*treeclr.c[0] + fxrandom(-treeclr.cd[0], treeclr.cd[0]),
                    //    offcl2[1] + offcl[1] + fade*treeclr.c[1] + fxrandom(-treeclr.cd[1], treeclr.cd[1]),
                    //    offcl2[2] + offcl[2] + fade*treeclr.c[2] + fxrandom(-treeclr.cd[2], treeclr.cd[2]),
                    //    treeclr.c[3]*.6 + fxrandom(-treeclr.cd[3], treeclr.cd[3]),
                    //];
                }
            }

            if(hasSun){
                let leftstrength = map(xx - sunPos[0]*baseWidth, -baseWidth, baseWidth, 0, 1);
                let rightstrength = 1 - leftstrength;
                let isleft = map(x, rx - pscale*maxwidth*rootwide, rx + pscale*maxwidth*rootwide, 1, 0);
                let isright = 1 - isleft;
                isleft = Math.pow(isleft, 2);
                isright = Math.pow(isright, 2);

                isleft = constrain(isleft+fxrandom(-.05,.05), 0, 1);
                isright = constrain(isright+fxrandom(-.05,.05), 0, 1);


                if(.4+fxrand()*.6 < isleft*leftstrength){
                    let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
                    ssunColor[0] = constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
                    ssunColor[1] = constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
                    ssunColor[2] = constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
                    col[0] = ssunColor[0];
                    col[1] = ssunColor[1];
                    col[2] = ssunColor[2];
                }
                
                if(.4+fxrand()*.6 < isright*rightstrength*map(y, ry, 0, 0, 1)){
                    let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
                    ssunColor[0] = constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
                    ssunColor[1] = constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
                    ssunColor[2] = constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
                    col[0] = ssunColor[0];
                    col[1] = ssunColor[1];
                    col[2] = ssunColor[2];
                }
            }


            angle = radians(fxrandom(-16,16));
            if(fxrand() > 0.97){
                var rb = fxrandom(110,255);
                col = [rb, rb, rb, fxrandom(0,88)];
                var ww = 10*pscale*fxrandom(.9, 1.1);
                size = [0, 0];
                if(xx-ww > rx - pscale*maxwidth*rootwide && xx+ww < rx + pscale*maxwidth*rootwide)
                    size = [5, 5];
            }
            else{
                size = [4.4*fxrandom(.8, 1.2)*perspective, 4.4*fxrandom(.9, 1.1)*perspective];
                //mySquare(0, 0, 6.5*fxrandom(.8, 1.2)*perspective, 4*fxrandom(.9, 1.1)*perspective);
            }
            coco++;
            //cnt++;
            let oo = 0;
            // oo = map(ry, 100, baseHeight*horizon*1.0, 0, 1);
            // oo = Math.pow(oo, .3);
            // oo = map(oo, 0, 1, 0, 100 + 150*naskfnaskf);
            if(pos[0] < 0 || pos[0] > baseWidth)
                continue
            if(pos[1] < oo || pos[1] > baseHeight)
                continue

            if(kk == 13)
            {
                //col[0] = 244;
                //col[1] = 244;
                //col[2] = 244;
                //console.log(pos)
                //pos[0] = pos[1]%baseWidth
                //pos[1] = getHorizon(pos[0])
                //pos[0] = rx
                //pos[1] = ry
                //size[0] *= 10;
                //size[1] *= 10;
            }

            pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
            pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
            pos[1] *= -1;
            
            if(isDark){
                col[0] = offcl[0] + 33-map(y, 0, ry, 0, 1)*22 + kk%20;
                col[1] = offcl[1] + 56-map(y, 0, ry, 0, 1)*22 + kk%20;
                col[2] = offcl[2] + 62 + kk%20;

                attenuation = map(y, 0, ry, .5, 0);

                col[0] = col[0] + attenuation*(backgroundColor[0]*255 - col[0]) + fxrandom(-7, 7);
                col[1] = col[1] + attenuation*(backgroundColor[1]*255 - col[1]) + fxrandom(-7, 7);
            }


            particlePositions.push(map(pos[0], -ressx/2, ressx/2, -1, 1), map(pos[1], -ressy/2, ressy/2, -1, 1));
            particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
            //particleColors.push(Math.pow(1.-perspective2, 2), Math.pow(1.-perspective2, 2), Math.pow(1.-perspective2, 2), col[3]/255.);
            particleSizes.push(size[0], size[1]);
            particleAngles.push(angle);
            particleIndices.push(globalIndex++);

            
            if(fxrandom(0,1)>0.19){
                //drawHole(xx, yy, 25, 25);
            }
        }
    }
}


function generateTrees(){

    //console.log(sunPos, horizon)
    var rxfrq = fxrandom(0.005, 0.03);
    if(fxrand() < .5){
        var kk = 0;
        var nn = Math.floor(fxrandom(100, 150)*2);
        var bareGroundSpread = fxrandom(0.1, 0.4);
        nn = (1. - bareGroundSpread)*fxrandom(122, 128);
        var middle = fxrandom(.25, .65);
        while(kk < nn){

            var rx = fxrand();
            while(rx > middle-bareGroundSpread && rx < middle+bareGroundSpread){
                rx = fxrand();
            }

            //if(rx < .5)
            //    console.log(kk)

            var pp = map(kk, 0, nn, 0.03, 1);
            pp = Math.pow(pp, 12);
            //pp *= .2 + .8*power(noise(rx*rxfrq), 4);
            var x = map(rx, 0, 1, 0, baseWidth);
            var y = map(pp, 0, 1, getHorizon(x)*1, baseHeight) + 0*fxrandom(0, baseHeight/30);
            drawTree(x, y, kk, pp);
            kk++;
            generateForegroundForRoot([x, y])
        }
    }
    else{
        // Standard
        var kk = 0;
        var nn = Math.floor(fxrandom(5, 50));
        var ex = 4;
        treeGroundSpread = fxrandom(0.1, 0.615);
        nn = treeGroundSpread*100 * fxrandom(1.0, 4.3);
        var middle = fxrandom(treeGroundSpread, 1.-treeGroundSpread);
        //treeGroundSpread = fxrandom(0.1, 0.35);
        if(fxrand() < -1.5){
            nn = Math.floor(fxrandom(50, 200));
            middle = 0.5;
            treeGroundSpread = fxrandom(.38, .5);
        }
        while(kk < nn){
            var pp = map(kk, 0, nn, 0.03, 1);
            pp = Math.pow(pp, 12);
            //var x = fxrandom(0, baseWidth);
            //var y = map(pp, 0, 1, getHorizon(x)*1.1, baseHeight) + 0*fxrandom(0, baseHeight/30);
    
            var rx = middle + fxrandom(-treeGroundSpread, +treeGroundSpread);
            //pp *= .2 + .8*power(noise(rx*rxfrq), 4);
            //if(fxrand() > prob)
            //    continue;
            var x = map(rx, 0, 1, 0, baseWidth);
            var y = map(pp, 0, 1, getHorizon(x)*1, baseHeight) + 0*fxrandom(0, baseHeight/30);
            drawTree(x, y, kk, pp);
            kk++;
            generateForegroundForRoot([x, y])
        }
    }
}


function generateForeground(){
    //rect(baseDim/2, baseDim*1.8, baseDim*2, baseDim*2);
    //var detail = 3;
    var amp = Math.min(baseWidth, baseHeight)/10;
    var frq = 0.002;
    //pg.fill(
    //    groundclr.a[0] + fxrandom(-groundclr.ad[0], groundclr.ad[0]),
    //    groundclr.a[1] + fxrandom(-groundclr.ad[1], groundclr.ad[1]),
    //    groundclr.a[2] + fxrandom(-groundclr.ad[2], groundclr.ad[2]),
    //    groundclr.a[3] + fxrandom(-groundclr.ad[3], groundclr.ad[3]),
    //);
    //pg.noStroke();
    //pg.rect(baseWidth/2, baseHeight*(1+horizon*1.1)/2, baseWidth, baseHeight*(1-horizon));
    var offcl1 = [fxrandom(-33, 34), fxrandom(-5, 34), fxrandom(-34, 14)]
    var offcl2 = [fxrandom(-14, 14), fxrandom(-14, 14), fxrandom(-14, 14)]
    var rr1 = fxrandom(0.25, 0.5); // .4155
    var rr2 = fxrandom(rr1, rr1+0.35) // .565
    var dispr = fxrandom(0.03, 0.09)

    var frqx = map(power(noise(xx*0.001, y*0.001, 22.555), 1), 0, 1, 0.3, 2);
    var frqy = frqx;
    frqx = .5;
    frqy = 3.;
    var frqyp = .04;
    var foregroundOpacity = fxrandom(122, 255);
    var attenuation = fxrandom(0, 0.3);
    // for(var k = 0; k < 390000*(1-horizon); k++){
    for(var k = 0; k < 300000; k++){
        var x = fxrandom(0, baseWidth);
        var y = fxrandom(getHorizon(x), baseHeight*1.0);

        var pos, col, size, angle;
//for(var x = 0; x < baseDim; x += detail){
//    for(var y = baseHeight*horizon; y < baseDim*1.1; y += detail){
        var perspective = map(y, getHorizon(x), baseHeight*1.0, .6, 1);
        var ppfr = map(y, getHorizon(x), baseHeight*1.0, .7, 1);

        rr1 = map(noise(x*0.01, y*0.01+241.2141), 0, 1, 0.25, 0.5);
        rr2 = map(noise(x*0.01, y*0.01+33.44), 0, 1, rr1, rr1+0.35);
        dispr = map(noise(x*0.01, y*0.01+55.55), 0, 1, 0.03, 0.13);
        var xx = x;
        frqx = frqy = .5;
        frqy = 3*ppfr + (1-ppfr)*map(y, 0, baseHeight*1.0, 3, 2);
        frqy = map(y, getHorizon(x), baseHeight*1.0, 0, 1);
        frqy = Math.pow(frqy, .5)
        frqy = map(frqy, 0, 1, 7, .5);

        frqx *= .5;
        frqy *= .5;
        //var frqy = map(power(noise(xx*0.001, y*0.001, 313.31314), 1), 0, 1, 0.3, 2);
        var yy = y + 0*amp*(-power(noise(x*frq, y*frq), 2)) + fxrandom(-5,5);

        pos = [xx, yy];
        col = [
            offcl2[0] + groundclr.a[0] + fxrandom(-groundclr.ad[0], groundclr.ad[0]),
            offcl2[1] + groundclr.a[1] + fxrandom(-groundclr.ad[1], groundclr.ad[1]),
            offcl2[2] + groundclr.a[2] + fxrandom(-groundclr.ad[2], groundclr.ad[2]),
           groundclr.a[3]*.85 + fxrandom(-groundclr.ad[3], groundclr.ad[3]),
        ];
        if(fxrand() > 0.998){
            var rc = fxrandom(0, 255);
            col = [rc, rc, rc, fxrandom(140, 190)];
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15;
            size = [fxrandom(10,20)*.2*perspective, 1.3*fxrandom(10,20)*.3*perspective];
            //mySquare(0, 0, fxrandom(10,20)*.2*perspective, fxrandom(10,20)*.3*perspective);
        }
        else{
            var dx = fxrandom(5, 10)*.3*perspective;
            // let ooo = .5 + 1.5*power(noise(xx*0.01, yy*0.01) , 3);
            // let qqq = map(ooo, .5, 2, 1, .6);
            // size = [dx*qqq/2, ooo*dx*(1 + fxrandom(1.5, 1.8))];
            size = [dx,dx*(1 + fxrandom(1.5, 1.8))];
            if(fxrandom(0,1000) > 960 || noise(xx*0.004*frqx, map(yy,getHorizon(xx), baseHeight, 0, 1)*frqy)+dispr*fxrandom(-1,1) < rr1 && fxrand()>0.4){

                col = [
                    offcl2[0] + groundclr.c[0] + fxrandom(-groundclr.cd[0], groundclr.cd[0]),
                    offcl2[1] + groundclr.c[1] + fxrandom(-groundclr.cd[1], groundclr.cd[1]),
                    offcl2[2] + groundclr.c[2] + fxrandom(-groundclr.cd[2], groundclr.cd[2]),
                    groundclr.c[3]*0 + fxrandom(-groundclr.cd[3], groundclr.cd[3]),
                ];
                size = [dx, dx*(1 + fxrandom(1.5, 1.8))];
            }
            else if(fxrandom(0,1000) > 960 || noise(xx*0.004*frqx, map(yy,getHorizon(xx), baseHeight, 0, 1)*5.02*frqy)+dispr*fxrandom(-1,1) < rr2 && fxrand()>0.4){
                col = [
                    offcl1[0] + groundclr.b[0] + fxrandom(-groundclr.bd[0], groundclr.bd[0]),
                    offcl1[1] + groundclr.b[1] + fxrandom(-groundclr.bd[1], groundclr.bd[1]),
                    offcl1[2] + groundclr.b[2] + fxrandom(-groundclr.bd[2], groundclr.bd[2]),
                    groundclr.b[3] + fxrandom(-groundclr.bd[3], groundclr.bd[3]),
                ];
                size = [dx, dx*(1 + fxrandom(1.5, 1.8))];
            }
            angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15 + fxrandom(-.1, .1);
            //mySquare(0, 0, fxrandom(5, 10)*.35*perspective, fxrandom(5, 10)*.35*perspective);
        }

        if(pos[0] < 0 || pos[0] > baseWidth)
            continue
        if(pos[1] < 0 || pos[1] > baseHeight)
            continue
        pos[0] = pos[0] - canvasWidth/2*0 - baseWidth/2;
        pos[1] = pos[1] - canvasHeight/2*0 - baseHeight/2;
        pos[1] *= -1;

        col[3] = foregroundOpacity;

        if(isDark){
            col[0] = col[0] + attenuation*(backgroundColor[0]*255 - col[0]);
            col[1] = col[1] + attenuation*(backgroundColor[1]*255 - col[1]);
            col[2] = col[2] + attenuation*(backgroundColor[2]*255 - col[2]);
        }

        var dir = [xx-sunPos[0]*baseWidth, yy-sunPos[1]*baseHeight];
        var ll = Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1])
        let maxll = baseWidth/2;
        var strength = 1.0 - Math.min(1.0, ll/maxll);
        let aaa = fxrandom(0,10)*0;
        if(yy < getHorizon(xx) + map(Math.pow(fxrand(), 3), 0, 1, 0, 63)+aaa*power(strength*3., 3)){
            // distance to sun calcualtion
            strength = strength*.7;
            let ddd = strength * 255;
            let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
            ssunColor[0] = constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
            ssunColor[1] = constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
            ssunColor[2] = constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
            col[0] = col[0]*(1-strength) + ssunColor[0]*strength;
            col[1] = col[1]*(1-strength) + ssunColor[1]*strength;
            col[2] = col[2]*(1-strength) + ssunColor[2]*strength;
        }
        else if(!isDark){
            let sunleakchance = map(yy, getHorizon(xx), baseHeight, 0, 1);
            sunleakchance = Math.pow(sunleakchance, 3);
            if(fxrand() > .8+.2*sunleakchance){
                let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
                ssunColor[0] = constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
                ssunColor[1] = constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
                ssunColor[2] = constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
                let strength = fxrandom(.6,1);
                col[0] = col[0]*(1-strength) + ssunColor[0]*strength;
                col[1] = col[1]*(1-strength) + ssunColor[1]*strength;
                col[2] = col[2]*(1-strength) + ssunColor[2]*strength;
            }
        }

        particlePositions.push(map(pos[0], -ressx/2, ressx/2, -1, 1), map(pos[1], -ressy/2, ressy/2, -1, 1));
        particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
        particleSizes.push(size[0], size[1]);
        particleAngles.push(angle);
        particleIndices.push(globalIndex++);
    }
}

function generateBackground(){
    var hsv = [fxrand(), fxrandom(0.2, 0.66), fxrandom(0.3, 0.95)]
    var rgb = HSVtoRGB(hsv[0], hsv[1], hsv[2])
    var offcl1 = [fxrandom(-33, 33), fxrandom(-33, 17), fxrandom(-77, 5)]
    var offcl2 = offcl1

    let ss = fxrandom(.55, .88);
    sunColor[0] = sunColor[0]*ss + (offcl1[0]+skyclr.a[0])*(1-ss);
    sunColor[1] = sunColor[1]*ss + (offcl1[1]+skyclr.a[1])*(1-ss);
    sunColor[2] = sunColor[2]*ss + (offcl1[2]+skyclr.a[2])*(1-ss);


    let count = 0;
    for(var k = 0; k < 390000*horizon; k++){
        var x = fxrandom(0, baseWidth);
        var gg = map(power(constrain(fxrand(), 0, 1), 1), 0, 1, .5, 3);
        var y = Math.pow(fxrand(), .7);
        y = y*getHorizon(x) + fxrandom(-5, 5);
        var pos, col, size, angle;
        col = [-1,-1,-1,-1]

        var coliters = 0;
        while(( coliters==0 || myDot(col, [0, 1, 0]) > 0.7 || myDot(col, [1, 1, 0]) > 0.75 || myDot(col, [1, 0, 1]) > 0.7) && coliters < 10){
            coliters++;
            if(fxrandom(0,1000) > 980){
                col = [
                    constrain(offcl2[0] + skyclr.b[0] + fxrandom(-skyclr.bd[0], skyclr.bd[0]), 0, 255),
                    constrain(offcl2[1] + skyclr.b[1] + fxrandom(-skyclr.bd[1], skyclr.bd[1]), 0, 255),
                    constrain(offcl2[2] + skyclr.b[2] + fxrandom(-skyclr.bd[2], skyclr.bd[2]), 0, 255),
                    constrain(skyclr.b[3]*.5 + fxrandom(-skyclr.bd[3], skyclr.bd[3]), 0, 255),
                ];
                //pg.push();
                //pg.translate(x, y);
                pos = [x, y];
                size = [fxrandom(5, 10)*1.7*.35, fxrandom(5, 10)*.9*.35];
                angle = radians(-20 + 40*noise(x*0.01, y*0.01))+wind;
                //mySquare(0, 0, fxrandom(5, 10)*2.7*.35, fxrandom(5, 10)*.9*.35);
                //pg.pop();
            }
            else if(fxrand() > 0.998){
                var rc = fxrandom(0, 255);
                col = [rc, rc, rc, fxrandom(140, 190)];
                angle = radians(-20 + 40*noise(x*0.01, y*0.01)) + wind*.15;
                size = [fxrandom(10,20)*.12, fxrandom(10,20)*.12];
                //mySquare(0, 0, fxrandom(10,20)*.2*perspective, fxrandom(10,20)*.3*perspective);
            }
            else{
                if(fxrand() < map(y, 0, baseHeight*horizon, 0, 1)){
                //if(map(y, 0, baseHeight*horizon, 0, 1) + fxrandom(-.22, .22) + .45*(-.5+power(noise(x*.006+1351.31, y*.006+33.31), 3)) < .35){
                    col = [
                        constrain(offcl1[0] + skyclr.a[0] + fxrandom(-skyclr.ad[0], skyclr.ad[0]), 0, 255),
                        constrain(offcl1[1] + skyclr.a[1] + fxrandom(-skyclr.ad[1], skyclr.ad[1]), 0, 255),
                        constrain(offcl1[2] + skyclr.a[2] + fxrandom(-skyclr.ad[2], skyclr.ad[2]), 0, 255),
                        constrain(skyclr.a[3]*.85 + fxrandom(-skyclr.ad[3], skyclr.ad[3]), 0, 255),
                    ];
                    //col = [244, 244, 244, 255];
                    let h2r = HSVtoRGB(
                        shft2,
                        fxrandom(.2, .3)*1, 
                        fxrandom(.5, .67)*.7,
                        //.35+.3*noise(xx*0.05+31.13, yy*0.004)+fxrandom(-.1,.1)+0.1,
                        );
                    //col = [h2r[0]*255.+fxrandom(-30,30), h2r[1]*255.+fxrandom(-30,30), h2r[2]*255.+fxrandom(-30,30), skyclr.a[3]*.85 + fxrandom(-skyclr.ad[3], skyclr.ad[3]),];
                }
                else{
                    col = [
                        constrain(offcl1[0] + skyclr.c[0] + fxrandom(-skyclr.cd[0], skyclr.cd[0]), 0, 255),
                        constrain(offcl1[1] + skyclr.c[1] + fxrandom(-skyclr.cd[1], skyclr.cd[1]), 0, 255),
                        constrain(offcl1[2] + skyclr.c[2] + fxrandom(-skyclr.cd[2], skyclr.cd[2]), 0, 255),
                        constrain(skyclr.c[3]*.85 + fxrandom(-skyclr.cd[3], skyclr.cd[3]), 0, 255),
                    ];
                    //col = [244, 244, 244, 255];
                    let h2r = HSVtoRGB(
                        shft,
                        fxrandom(.2, .3)*1, 
                        fxrandom(.6, .7)*.7,
                        //.35+.3*noise(xx*0.05+31.13, yy*0.004)+fxrandom(-.1,.1)+0.1,
                        );
                    //.col = [h2r[0]*255.+fxrandom(-30,30), h2r[1]*255.+fxrandom(-30,30), h2r[2]*255.+fxrandom(-30,30), skyclr.a[3]*.85 + fxrandom(-skyclr.ad[3], skyclr.ad[3]),];
                }

                pos = [x, y];
                
                var dx = fxrandom(2, 10)*.255;
                size = [dx, dx*(1 + fxrandom(1.5, 1.8))];
                //size = [fxrandom(2, 10)*.315, fxrandom(2, 10)*.35];

                //mySquare(0, 0, fxrandom(5, 10)*.35, fxrandom(5, 10)*.35);
                //pg.pop(); 
                // SUN
                let sup = [sunPos[0]*baseWidth + fxrandom(-100, 100), sunPos[1]*baseHeight + fxrandom(-100, 100)];
                let toSun = [x-sup[0], y-sup[1]];
                toSun[0] *= .5;
                let angSun = Math.atan2(toSun[1], toSun[0]);
                let xs = Math.cos(angSun)+1.
                let ys = Math.sin(angSun)+1.
                var dd = Math.sqrt(toSun[0]*toSun[0]+toSun[1]*toSun[1]) / Math.sqrt(sup[0]*sup[0]+sup[1]*sup[1])
                dd = dd * map(Math.pow(noise(xs*1.5, ys*1.5, 831.31), 3), 0, 1, .6, 2);
                dd = Math.min(dd*sunSpread, 1.0);
                //col[0] = 255;
                //col[1] = 255;
                //col[2] = 255;
                angle = radians(-20 + 40*noise(x*0.01, y*0.01))+wind + fxrandom(-.1, .1);
                if(1-dd>.5 && fxrand() > .6){
                    //angle = angle + (-Math.atan2(sunPos[1]*baseWidth - y, sunPos[0]*baseWidth - x) - angle);
                }

                if(isDark){
                    col[0] = offcl2[0]*.1 + 35-map(y, 0, getHorizon(x), 0, 1)*22 + .1*fxrandom(-skyclr.ad[0], skyclr.ad[0]);
                    col[1] = offcl2[1]*.1 + 49-map(y, 0, getHorizon(x), 0, 1)*22 + .1*fxrandom(-skyclr.ad[0], skyclr.ad[0]);
                    col[2] = offcl2[2]*.1 + 65 + .1*fxrandom(-skyclr.ad[0], skyclr.ad[0]);
                    col[0] = col[0] + .25*(backgroundColor[0]*255 - col[0]);
                    col[1] = col[1] + .25*(backgroundColor[1]*255 - col[1]);
                    col[2] = col[2] + .25*(backgroundColor[2]*255 - col[2]);
                }

                if(!isDark){
                    col[0] = col[0] + .5*(backgroundColor[0]*255 - col[0]);
                    col[1] = col[1] + .5*(backgroundColor[1]*255 - col[1]);
                    col[2] = col[2] + .5*(backgroundColor[2]*255 - col[2]);
                }

                if(hasSun && !isDark && fxrand() > dd/2){
                    let ssunColor = [sunColor[0], sunColor[1], sunColor[2]];
                    ssunColor[0] =constrain(sunColor[0] + 100*fxrandom(-.1,.1), 0, 255);
                    ssunColor[1] =constrain(sunColor[1] + 100*fxrandom(-.1,.1), 0, 255);
                    ssunColor[2] =constrain(sunColor[2] + 100*fxrandom(-.1,.1), 0, 255);
                    col[0] = ssunColor[0]*(1-dd)+dd*col[0];
                    col[1] = ssunColor[1]*(1-dd)+dd*col[1];
                    col[2] = ssunColor[2]*(1-dd)+dd*col[2];
                }


                
            }
        }

        if(pos[0] < 0 || pos[0] > baseWidth)
            continue
        if(pos[1] < 0 || pos[1] > baseHeight)
            continue
        pos[0] = pos[0] - baseWidth/2;
        pos[1] = pos[1] - baseHeight/2;
        pos[1] *= -1;

        particlePositions.push(map(pos[0], -ressx/2, ressx/2, -1, 1), map(pos[1], -ressy/2, ressy/2, -1, 1));
        particleColors.push(col[0]/255., col[1]/255., col[2]/255., col[3]/255.);
        particleSizes.push(size[0], size[1]);
        particleAngles.push(angle);
        particleIndices.push(globalIndex++);
    }
    console.log(sunColor)
}


function createQuad(gl) {
    const vertices = new Float32Array([
        -1.0, -1.0, 0.0, 0.0,
         1.0, -1.0, 1.0, 0.0,
        -1.0,  1.0, 0.0, 1.0,
         1.0,  1.0, 1.0, 1.0
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    return buffer;
}

function getParticles(){
    return {
        positions: particlePositions,
        colors: particleColors,
        sizes: particleSizes,
        angles: particleAngles,
        indices: particleIndices,
    }
}
let positionAttributeLocation; 
let colorAttributeLocation; 
let sizeAttributeLocation; 
let angleAttributeLocation; 
let indexAttributeLocation; 

let positionBuffer;
let colorsBuffer;
let sizesBuffer;
let anglesBuffer;
let indicesBuffer;
let particles;

let program;
let backgroundProgram;

function prepareRender(){
    program = createProgram(gl, vertexShader, fragmentShader);
    backgroundProgram = createProgram(gl, backgroundVertexShader, backgroundFragmentShader);

    positionBuffer = gl.createBuffer();
    colorsBuffer = gl.createBuffer();
    sizesBuffer = gl.createBuffer();
    anglesBuffer = gl.createBuffer();
    indicesBuffer = gl.createBuffer();
    particles = getParticles();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles.positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles.colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles.sizes), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, anglesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles.angles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particles.indices), gl.STATIC_DRAW);
    
    positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    sizeAttributeLocation = gl.getAttribLocation(program, 'a_size');
    angleAttributeLocation = gl.getAttribLocation(program, 'a_angle');
    indexAttributeLocation = gl.getAttribLocation(program, 'a_index');
}

function render(){
    frameCount++;

    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ressx, ressy, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, REN, Math.round(REN/ASPECT), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    0.2518010617933124, 0.3469086267941281, 0.35752373936112225
    
    gl.useProgram(program);

    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), ressx, ressy);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), frameCount);
    gl.uniform1f(gl.getUniformLocation(program, 'u_scrollscale'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'u_winscale'), winScale);
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, sizesBuffer);
    gl.enableVertexAttribArray(sizeAttributeLocation);
    gl.vertexAttribPointer(sizeAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, anglesBuffer);
    gl.enableVertexAttribArray(angleAttributeLocation);
    gl.vertexAttribPointer(angleAttributeLocation, 1, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, indicesBuffer);
    gl.enableVertexAttribArray(indexAttributeLocation);
    gl.vertexAttribPointer(indexAttributeLocation, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, globalIndex);

    gl.useProgram(backgroundProgram);
    const quadVertices = [
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ];
    let backgroundPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);  // unbind the framebuffer

    // Now bind the texture and draw a screen-sized quad using your post-processing shader:
    // gl.bindTexture(gl.TEXTURE_2D, randomtexture);
    // Setup and draw your screen-sized quad
    let bgPositionAttributeLocation = gl.getAttribLocation(backgroundProgram, "a_position");

    gl.activeTexture(gl.TEXTURE0+0);
    // Now bind the texture and draw a screen-sized quad using your post-processing shader:
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Pass the texture to the shader
    gl.uniform1i(gl.getUniformLocation(backgroundProgram, "tDiffuse"), 0);
    gl.uniform2f(gl.getUniformLocation(backgroundProgram, "u_resolution"), ressx, ressy);
    gl.uniform1f(gl.getUniformLocation(backgroundProgram, "u_seed1"), fxrandom(.9, 1.1));
    gl.uniform1f(gl.getUniformLocation(backgroundProgram, "u_seed2"), fxrandom(.5, 1.5));
    gl.uniform1f(gl.getUniformLocation(backgroundProgram, "u_seed3"), fxrandom(.5, 1.5));
    gl.uniform1f(gl.getUniformLocation(backgroundProgram, "u_horizon"), horizon);
    
    // gl.activeTexture(gl.TEXTURE0 + 1);
    // gl.bindTexture(gl.TEXTURE_2D, blueNoiseTexture);
    // gl.uniform1i(gl.getUniformLocation(backgroundProgram, "u_bluenoiseTexture"), 1);
    // gl.uniform2f(gl.getUniformLocation(backgroundProgram, "u_bluenoiseTextureSize"), 256, 256);

    let bgPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bgPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(bgPositionAttributeLocation);
    gl.vertexAttribPointer(
        bgPositionAttributeLocation,
        2,           // number of components per vertex attribute
        gl.FLOAT,    // data type
        false,       // normalized
        0,           // stride, 0 = auto
        0            // start position in buffer
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}


document.addEventListener('DOMContentLoaded', () => {
    reset();
});


function handleWindowSize(){
    let aspect = ressx/ressy;
    if(aspect < 1){
        let clientWidth = window.innerWidth;
        let clientHeight = window.innerHeight;
        let caspect = (clientWidth-120*2)/(clientHeight-120*2);
        let sw, sh;
        if(caspect > aspect){
            sh = Math.round(clientHeight) - 100*2;
            sw = Math.round(sh * aspect);
        }else{
            sw = Math.round(clientWidth) - 100*2;
            sh = Math.round(sw / aspect);
        }
    
        if(canvas){
            canvas.style.width = sw + 'px';
            canvas.style.height = sh + 'px';
            canvas.style.position = 'absolute';
            canvas.style.left = clientWidth/2 - sw/2 + 'px';
            canvas.style.top = clientHeight/2 - sh/2 + 'px';
        }
    }
    else{
        aspect = 1/aspect;
        let clientWidth = window.innerWidth;
        let clientHeight = window.innerHeight;
        let caspect = (clientWidth-120*2)/(clientHeight-120*2);
        let sw, sh;
        if(caspect > aspect){
            sh = Math.round(clientHeight) - 100*2;
            sw = Math.round(sh * aspect);
        }else{
            sw = Math.round(clientWidth) - 100*2;
            sh = Math.round(sw / aspect);
        }
        if(canvas){
            canvas.style.width = sh + 'px';
            canvas.style.height = sw + 'px';
            canvas.style.position = 'absolute';
            canvas.style.left = clientWidth/2 - sh/2 + 'px';
            canvas.style.top = clientHeight/2 - sw/2 + 'px';
        }
    }

    // const displayWidth  = window.innerWidth;
    // const displayHeight = window.innerHeight;

    // ressx = displayWidth;
    // ressy = displayHeight;

    // // Check if the canvas is not the same size.
    // const needResize = canvas.width  !== displayWidth ||
    //                    canvas.height !== displayHeight;

    // let sx = ressx-100;
    // let sy = ressy-100;

    // canvas.style.width = sx + 'px';
    // canvas.style.height = sy + 'px';
    // canvas.style.position = 'absolute';
    // canvas.style.left = 50 + 'px';
    // canvas.style.top = 50 + 'px';

    // canvas.width  = displayWidth;
    // canvas.height = displayHeight;
    // gl.viewport(0, 0, canvas.width, canvas.height);

}


function save(){
    console.log('preparing canvas for saving...');
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'render_' + fxhash + '.png';
    // link.href = imgElement.src;
    link.href = dataURL;
    link.click();
}


window.addEventListener('resize', onresize, false);

function onresize(){
    handleWindowSize();
    // render();
}

document.addEventListener('keydown', function(event) {
    if(event.key == 's') {
        save();
    }
});