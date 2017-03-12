var require = {
  baseUrl: './',
  shim: {
    'three': { exports: 'THREE' },
    'TrackballControls': { deps: ['three'], exports: 'TrackballControls' },
    'Lut': { deps: ['three'], exports: 'Lut' },
    'tooltip': { exports: 'ToolTip' },
    'detector': { exports: 'Detector' },
    'resizesensor': {exports: 'ResizeSensor'},
    'FFBOMesh3D': { deps: ['three', 'Lut', 'TrackballControls', 'tooltip'], exports: 'FFBOMesh3D' },
    'd3': {exports: 'd3'},
    'mmenu': { deps: ['jquery'] },
    'graphics_explorer': { deps: ['d3'], exports: 'GraphicsExplorer' },
  },
  paths: {
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js',
    mmenu: 'https://cdnjs.cloudflare.com/ajax/libs/jQuery.mmenu/5.7.8/js/jquery.mmenu.all.min.js',
    three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/78/three',
    TrackballControls: 'js/TrackballControls',
    Lut: "http://cdn.rawgit.com/mrdoob/three.js/dev/examples/js/math/Lut",
    tooltip: "js/tooltip",
    FFBOMesh3D: "http://cdn.rawgit.com/fruitflybrain/ffbo.visualizer_module/master/mesh3d",
    resizesensor: "http://cdn.rawgit.com/marcj/css-element-queries/master/src/ResizeSensor",

    detector: 'http://cdn.rawgit.com/mrdoob/three.js/dev/examples/js/Detector',
    d3: 'https://d3js.org/d3.v3.min',
    graphics_explorer: 'js/graphics_explorer',
  }
};
