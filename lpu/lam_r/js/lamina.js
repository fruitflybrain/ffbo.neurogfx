
/*
 * Create neuron list
 */
var cartList = [];
for (var i = 0; i < 721; i++ ) {
    cartList.push('cartridge'+i);
}

//var neuList = ['C2','C3'];
/*
 * Create neuron json
 */
cartJson = {};
for (var i=0; i < cartList.length; i++ ) {
	var id = cartList[i];
	cartJson[cartList[i]] = {
		'filename': 'cartridge_swc/' + id + '.swc',
		'label': cartList[i]
	};
}
var ffboMesh;
var lamina_data_set = false;
/*
 *
 */
  $(".vis").dblclick( function() {
    if ($(this).hasClass("vis-sm")) {
      $(".vis-hf-r").toggleClass("vis-sm vis-hf-r");
      $(".vis-lg").toggleClass("vis-sm vis-lg");
      $(this).toggleClass("vis-sm vis-lg");
    }
  });

var svgObj;
document.getElementById("svgLam").addEventListener( 'load', function(){
  svgObj = d3.select(document.getElementById("svgLam").contentDocument);
  svgObj.on('dblclick', function() {
    if ($("#vis-svg").hasClass("vis-svg-sm")) {
      $("#vis-svg").toggleClass("vis-svg-sm vis-svg-lg");
      $("#vis-3d").toggleClass('vis-3d-sm vis-3d-lg');
      ffboMesh.onWindowResize();
    }
  });

  function toggleByID(a) {
       g_num = a.substring(9)*6+5
       var neu = svgObj.select("#g" + g_num).select(".cartridge");
       
       $("#btn-"+a).toggleClass("selected unselected");
       if (neu.attr("visible") == "true"){
            neu.attr("visible", "false");
            neu.style("opacity", "0.3");
            $("#btn-"+a).html('&EmptySmallSquare; ' + a)
            num_of_cartridge -= 1;
            $("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)
       } else {
            neu.attr("visible", "true");
            neu.style("opacity", "1.0");
            $("#btn-"+a).html('&FilledSmallSquare; ' + a)
            num_of_cartridge += 1;
            $("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)
       }
       ffboMesh.toggleVis(a);
  }


  for (var i = 0; i < cartList.length; i++ ) {
      var id = cartList[i];
      $("#single-cart").append("<li><a id='" + "btn" + "-" + id + "' role='button' class='btn-cart-single selected'>&FilledSmallSquare; " + id + "</a></li>");
  }
  $(".btn-cart-single").click( function() {
      var id = $(this).attr("id").substring(4);
      toggleByID(id);
  });
  /*
   * create neuron 3D mesh
   */
  ffboMesh = new FFBOMesh3D('vis-3d', cartJson, toggleByID);
  ffboMesh.animate();
  new ResizeSensor($("#vis-3d"), function() {
    ffboMesh.onWindowResize();
  });

  onAddAllClick = function() {
      ffboMesh.showAll();
      svgObj.selectAll(".cartridge")
          .attr("visible", "true")
          .style("opacity", "1.0")
          .each(function(){
          })
      $(".btn-cart-single").each( function() {
          var id = $(this).attr("id").substring(4);
          $(this).removeClass("unselected");
          $(this).addClass("selected");
          $(this).html('&FilledSmallSquare; ' + id)
      });
      num_of_cartridge = 721;
      $("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)
  }
  onRemoveAllClick = function() {
      svgObj.selectAll(".cartridge")
          .attr("visible", "false")
          .style("opacity", "0.3")
          .each(function(){
          })
      $(".btn-cart-single").each( function() {
          var id = $(this).attr("id").substring(4);
          $(this).removeClass("selected");
          $(this).addClass("unselected");
          $(this).html('&EmptySmallSquare; ' + id)
          svgObj.selectAll(".cartridge")
      });
      num_of_cartridge = 0;
      $("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)
      ffboMesh.hideAll();
  }
  svgObj.selectAll(".cart")
    .style("cursor","pointer")
    .style("opacity", "1.0")
    .attr("visible", "true")
    .each(function() {
       var a = d3.select(this).attr("id");

       d3.select(this).selectAll(".cartridge")
        .style("cursor", "pointer")
        .style("opacity", "1.0")
        .attr("visible", "true")
//       svgObj.selectAll("."+a+"-dependent")
//         .style("opacity", function() {
//
//            if(d3.select(this).attr("count") == null)
//                d3.select(this).attr("count", 0);
//            if(d3.select(this).attr("max-count") == null)
//                d3.select(this).attr("max-count", 0);
//            var count = parseInt((d3.select(this).attr("max-count")), 10);
//            count += 1;
//            d3.select(this).attr("max-count", count);
//            d3.select(this).classed("syn-stroke", true);
//         })
    })
    .on("click", function() {
       var id = d3.select(this).attr("id");
       id = id.substring(1);
       id = 'cartridge'+(id-5)/6;
       toggleByID(id);
    })
    .on("dblclick", function() {
      var id = d3.select(this).attr("id");
      id = (id.substring(1) - 5) /6;
      var url = "/lpu/lam_r/cartridge.html?cartridge_num="+id;
//      id = 'cartridge'+(id-5)/6;
      window.location = url;
    })
    function getActiveObjOnSVG() {
        var list = [];
        svgObj.selectAll(".neuron-block")
            .each( function() {
                if (d3.select(this).attr("visible") == "true")
                    list.push( d3.select(this).attr("id") );
            });
        svgObj.selectAll("path.syn-stroke")
            .each( function() {
                if (parseInt(d3.select(this).attr("count")) == 0) {}
                //    list.push( d3.select(this).attr("id") );
            });

        return list;
    }

    $('.vis').hover(
      function() {
        if ($(this).hasClass("vis-sm"))
          $(".vis-lg").toggleClass("vis-hf-r vis-lg");
      }, function() {
        if ($(this).hasClass("vis-sm"))
          $(".vis-hf-r").toggleClass("vis-hf-r vis-lg");
      });

  /*
   * MMemu functions
   */
  $("#ui_menu_nav").mmenu({
      onClick: {
         close: false
      },
      "extensions": ["effect-menu-zoom"],
      offCanvas: {
          pageSelector: "#page-content-wrapper",
          position  : "right",
          direction:"left",
      },
      navbar: {
        title: "NeuroGFX Menu"
      }
  },{
      offCanvas: {
          pageSelector: "#page-content-wrapper",
      }
  });
  $("#sidebar-wrapper").mmenu({
      onClick: {
         close: false
      },
      "extensions": ["effect-menu-zoom"],
      offCanvas: {
          pageSelector: "#page-content-wrapper",
          position: "left",
          direction:"right",
      },
      navbar: {
        title: "FFBO Servers"
      }
  },{
      offCanvas: {
          pageSelector: "#page-content-wrapper",
      }
  });
  mm_menu_right = $("#ui_menu_nav").data( "mmenu" );
  mm_menu_left = $("#sidebar-wrapper").data( "mmenu" );
  var $left_hamburger = $("#server-icon");

  mm_menu_left.bind( "opened", function() {
     setTimeout(function() {
        $left_hamburger.addClass( "is-active" );
     }, 100);
  });
  mm_menu_left.bind( "closed", function() {
     setTimeout(function() {
        $left_hamburger.removeClass( "is-active" );
     }, 100);
  });

  onToggleCircuitClick = function() {
      mm_menu_right.open();
      $("a[href='#toggle_circuit']")[0].click()
  }
  openRightMenu = function() {
      mm_menu_right.open();
  }
  openServerMenu = function() {
      mm_menu_left.open();
  }
  // Load Cartridge button clicking event
  onLoadClick = function() {
      Notify("Loading Lamina data is not yet supported.", null,null,null,'danger')
  }
  onOpenNk = function() {
      console.log("launch NK btn clicked");

      if(cartridge_data_set) {
          var activeObj = getActiveObjOnSVG();
          console.log(activeObj);
          start_nk_execution(client_session, activeObj);
      }else {
        Notify("Error: Please load cartridge info first by clicking on 'Load Cartridge'", null,null,'danger')
      };
  }
});


var num_of_cartridge = 721;
$("#num-of-cartridge").text("Number of Cartridges:" + num_of_cartridge)

$("#btn-tutorial-video").click( function() { $("#video-panel").slideDown(500) } );
$("#btn-video-close").click( function() {
  $("#video-iframe")[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  $("#video-panel").slideUp(500)
});
