var require = {
  baseUrl: './',
  shim: {
    'three': { exports: 'THREE' },
    'TrackballControls': { deps: ['three'], exports: 'TrackballControls' },
    'Lut': { deps: ['three'], exports: 'Lut' },
    'WebGL': { exports: 'WEBGL' },
    'resizesensor': {exports: 'ResizeSensor'},
    'FFBOMesh3D': { deps: ['three', 'Lut', 'TrackballControls'], exports: 'FFBOMesh3D' },
    'd3': {exports: 'd3'},
    'mmenu': { deps: ['jquery'] },
    'graphics_explorer': { deps: ['d3'], exports: 'GraphicsExplorer' },
  },
  paths: {
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js',
    mmenu: 'https://cdnjs.cloudflare.com/ajax/libs/jQuery.mmenu/5.7.8/js/jquery.mmenu.all.min.js',
    three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/78/three',
    TrackballControls: 'js/TrackballControls',
    Lut: "https://cdn.rawgit.com/mrdoob/three.js/dev/examples/js/math/Lut",
    FFBOMesh3D: 'js/mesh3d',
    resizesensor: "https://cdn.rawgit.com/marcj/css-element-queries/master/src/ResizeSensor",

    WebGL: 'https://cdn.rawgit.com/mrdoob/three.js/dev/examples/js/WebGL',
    d3: 'https://d3js.org/d3.v3.min',
    graphics_explorer: 'js/graphics_explorer',
  }
};
