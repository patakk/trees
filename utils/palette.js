import { rybcolor, brightencol, saturatecol } from './colors.js';
import { map, rand } from './utils.js';

let palettesstrings = [
    '59a96a-8b85c1-ef3054',
    'bf1f2e-297d45-26408f',
    'd50a15-3c71ec-f3dd56-a08a7f',
    'bf1f2e-297d45-26408f-ff9922',
    '2f4550-f4f4f9-000000-586f7c-b8dbd9',
    'c91b18-cfcdd6-788a91-090427-373f43',
    '45070a-dc3000-fa6302-59565d-83250b',
    'e76f51-f4a261-2a9d8f-264653-e9c46a',
    'fdca40-df2935-3772ff-080708-e6e8e6-a9bcd0',
    '084c61-4f6d7a-56a3a6-ffc857-db504a-177e89-db3a34-e3b505-323031',
    'ee9b00-9b2226-bb3e03-e9d8a6-ca6702-0a9396-94d2bd-005f73-ae2012',
    '304d7d-dc758f-db995a-fdc300-bbbbbb-664c43-e3d3e4-222222-873d48',
    'c83e4d-de6b48-32373b-f4d6cc-4a5859-f4b9b2-daedbd-7dbbc3-e5b181-f4b860',
    '218380-54405f-fa8334-bf2d16-388697-ffbc42-df1129-ffe882-fffd77',
    'a24936-282b28-36c9c6-3e5641-9bc1bc-ed6a5a-83bca9-f4f1bb-e6ebe0-d36135',
    'f2c14e-45f0df-f78154-8789c0-c2cae8-8380b6-4d9078-111d4a-5fad56-b4431c',
    'E71414-FACB79-B25068-12947F-Ff4828-4C3A51-2FC4B2-dddddd-774360-F17808',
    'f5f5f5-3c3c3c-087e8b-ff5a5f-c1839f-ff2222-816797-51557E-1B2430-D6D5A8',
    'd00000-f48c06-dc2f02-9d0208-6a040f-ffba08-03071e-faa307-e85d04-370617',
    'f95738-ee964b-0d3b66-772e25-283d3b-edddd4-197278-faf0ca-f4d35e-c44536',
    '3d5a80-c1dbb3-e0fbfc-7ebc89-faedca-f2c078-ee6c4d-293241-98c1d9-fe5d26',
    'f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1',
    '4C3F61-F9D923-C98B70-36AE7C-65799B-FF5677-B958A5-187498-EB5353-368E7C-394359',
    '90be6d-43aa8b-577590-277da1-f3722c-4d908e-99e2b4-f9844a-f8961e-f94144-f9c74f-99d4e2',
    '372248-414770-b0c592-76bed0-a97c73-af3e4d-878e88-9cfffa-f46036-5b85aa-f7cb15-acf39d-f55d3e',
    'f6bd60-f7ede2-f5cac3-84a59d-f28482-d88c9a-f2d0a9-f1e3d3-99c1b9-8e7dbe-60585f-d8cbd7-faf6f4-edc1a4-f78972-d98db9-f2b3aa-f2d9d5-99c2a9-7e87bf-d88c95-f2c1a9-f1ddd4-a9b1ac-a27da4',
    'b26e63-084c61-d9fff8-dc758f-73d2de-56a3a6-1f3c36-f4c7a4-664c43-714c04-83bca9-bf2d16-b84527-d36135-282b28-c4f4c7-c83e4d-c8e0f4-d2a467-4f6d7a-3e5641-654c4f-88beb6-e3d3e4-9dd1f1-e8e1ef-9bb291-ffbc42-952709-e3b505-ba1200-218380-32373b-4e2649-9da9a0-cec075-f4d6cc-508aa8-975341-39160e-873d48-a24936-c7ffda-e2af51-c0caad-031927-4a5859-db504a-f4b860-df1129',
];

function ssorted(array){
    let narray = [];
    for(let k = 0; k < array.length; k++){
      narray.push(array[k]);
    }
  
    for(let j = 0; j < narray.length; j++){
        for(let i = 0; i < narray.length; i++){
            if(getb(narray[i]) > getb(narray[j])){
                [narray[i], narray[j]] = [narray[j], narray[i]];
            }
        }
    }
  
    let nnarray = [];
    for(let k = 0; k < Math.min(narray.length, 33); k++){
      nnarray.push(narray[k]);
    }
    
    return nnarray;
}

function getFromStrings(strings){
    let palettes = [];
    strings.forEach(element => {
        palettes.push(element);
    });
    for (var k = 0; k < palettes.length; k++) {
        let text = palettes[k];
        let cols = text.split('-')
        let caca = [];
        cols.forEach((e) => {
            caca.push(hexToRgb(e))
        });
        // shuffle(caca)
        //caca = ssorted(caca)
        var coco = [];
        caca.forEach((e, i) => {
            coco.push([
                (caca[i][0] + 0.* map(prng.rand(), 0, 1, -.2, .2)),
                (caca[i][1] + 0.* map(prng.rand(), 0, 1, -.2, .2)),
                (caca[i][2] + 0.* map(prng.rand(), 0, 1, -.2, .2))
            ])
        });
        palettes[k] = coco;
    }
    return palettes;
}

export function getPalette(){
    let palettes = getFromStrings(palettesstrings);
    let bgpalettes = getFromStrings([
        'f6bd60-84a59d-f28482-d88c9a-f2d0a9-99c1b9-8e7dbe-edc1a4-f78972-d98db9-f2b3aa-99c2a9-7e87bf-d88c95-f2c1a9-a9b1ac-a27da4-889ca9-90a5b8-6e8998-7f8f9b-7c8da3',]);

    return {palettes, bgpalettes};
}

// let cc = rybcolor(prng.rand());
// cc = saturatecol(cc, -.9);
// cc = brightencol(cc, rand(-.2, .5));
// bgpalettes = [[cc]]


// palettesstrings = [
//     ['#324FA6','#478c77','#FC4426','#A3AC3F'],
// ]


// for(let k = 0; k < palettesstrings.length; k++){
//     palettesstrings[k] = palettesstrings[k].join('-').replace(/#/g, '');
// }



function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? [
            parseInt(result[1], 16) / 255.,
            parseInt(result[2], 16) / 255.,
            parseInt(result[3], 16) / 255.
        ]
        : null;
}


function getb(c){
    //return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return Math.sqrt( 0.299*c[0]*c[0] + 0.587*c[1]*c[1] + 0.114*c[2]*c[2] )
  }
  

function shuffle(array) {
    let currentIndex = array.length
    var randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
            randomIndex = Math.floor(prng.rand() * currentIndex);
            currentIndex--;
    
            // And swap it with the current element.
            [
                array[currentIndex], array[randomIndex]
            ] = [
                array[randomIndex], array[currentIndex]
            ];
        }
    
        return array;
}

