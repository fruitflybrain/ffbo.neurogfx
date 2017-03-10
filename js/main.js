
require( ['detector', 'FFBOMesh3D', 'resizesensor', 'd3', 'tooltip', 'graphics_explorer'],
         function ( Detector, FFBOMesh3D, ResizeSensor, d3, tooltip, GraphicsExplorer ) {
	if ( ! Detector.webgl ) {
		Detector.addGetWebGLMessage();
	}

	  /*
		 * Load the diagram
		 */
	  svgObj = d3.select(document.getElementById("svgFly").contentDocument);

    graphicsExplorer = new GraphicsExplorer(svgObj,'.lpu','.tract');
    graphicsExplorer.dispatch["click-node"] = toggleLPU;
    /*
		 * Load the 3D visualization
		 */
		 $.getJSON( "data/mesh.json", function( data ) {
			 ffboMesh = new FFBOMesh3D(
				 'vis-3d',
				 {
					 "ffbo_json": data,
					 "showAfterLoadAll":true,
					 "colororder": "order"
				 },
				 {
					 "highlightMode": "single",
					 "colormap": "rainbow"
				 }
			 );
   		ffboMesh.dispatch["click"] = toggleLPU;


			 new ResizeSensor($("#vis-3d"), function() {
				 ffboMesh.onWindowResize();
			 });
		 });

		/*
		 * Setup UI
		 */
	  lpuState = {};
		svgObj.selectAll('.lpu').each( function() {
			var id = d3.select(this).attr("id");
			var label = d3.select(this).attr("label");
			lpuState[id] = {
				"selected": true,
				"label": label
			};
      // dynamically generate LPU buttons
			$("#single-lpu").append(
				"<li>" +
				"  <a id='" + "btn" + "-" + id + " " +
				"     role='button'" +
				"     class='btn-lpu-single'>" +
				"       &FilledSmallSquare; " + label  +
				"  </a>" +
				"</li>"
			);

		})

    function toggleLPUButton(id) {
			var btn = $("#btn-" + id);
			var marker = lpuState[id]['selected'] ? "&FilledSmallSquare;" : "&EmptySmallSquare;";
			btn.html(marker + " " + lpuState[id].label);
		}

	  function toggleLPU(id, isSel) {
	      if ( !(id in lpuState) )
	          return;
				if (isSel === undefined)
	          lpuState[id].selected = !lpuState[id].selected;
				else
				    lpuState[id].selected = isSel;
				console.log(id);
	      // update svg
        graphicsExplorer.toggleNode("#"+id);
	      // update btn
        toggleLPUButton(id)
	      // update 3d scene
	      ffboMesh.toggleVis(id);
	  }

		function onLPUGroupClick(id) {
			onRemoveAllClick();
			console.log(id)
      graphicsExplorer.selectNodes("."+id);
		}

		function onTractGroupClick(id) {
			onRemoveAllClick();
      graphicsExplorer.selectEdges("."+id);
			for (var x of graphicsExplorer.getEdgeList("."+id, 'mesh-label'))
          ffboMesh.show(x);
		}

	  onAddAllClick = function() {
	      for (var key in lpuState) {
					lpuState[key].selected = true;
					toggleLPUButton(key);
				}
				graphicsExplorer.selectAll();
	      ffboMesh.showAll();
	  }
	  onRemoveAllClick = function() {
	      for (var key in lpuState) {
					lpuState[key].selected = false;
					toggleLPUButton(key);
				}
        graphicsExplorer.unselectAll();
	      ffboMesh.hideAll();
	  }

    $(".btn-lpu-single").click( function() {
		  var id = $(this).attr("id").substring(4);
			toggleLPU(id);
		});
		$(".btn-lpu-group").click( function() {
	    var id = $(this).attr("id").substring(4);
      onLPUGroupClick(id);
	  })
	  $(".btn-tract").click( function() {
	    var id = $(this).attr("id").substring(4);
      onTractGroupClick(id);
	  })

    require(['js/mmenu_init']);
});
