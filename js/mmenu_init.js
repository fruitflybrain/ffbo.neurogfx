$(".vis")
    .dblclick( function() {
        if ($(this).hasClass("vis-sm")) {
            $(".vis-hf-r").toggleClass("vis-sm vis-hf-r");
            $(".vis-lg").toggleClass("vis-sm vis-lg");
            $(this).toggleClass("vis-sm vis-lg");
        }
    })
    .mouseenter( function() {
        if ($(this).hasClass("vis-sm"))
            $(".vis-lg").toggleClass("vis-hf-r vis-lg");
    }).mouseleave( function() {
        if ($(this).hasClass("vis-sm"))
            $(".vis-hf-r").toggleClass("vis-hf-r vis-lg");
    });

onTutorialVideoClick = function() {
    if ($('#btn-tutorial-video').hasClass('closed')) {
        $("#video-panel").slideDown(500);
        $('#btn-tutorial-video').prop('disabled', true);
    } else {
        $('#btn-tutorial-video').prop('disabled', false);
    }
    $('#btn-tutorial-video').toggleClass('closed opened');
}

onCloseTutorialVideoClick = function() {
    $("#video-iframe")[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    $("#video-panel").slideUp(500);
    console.log('click');
}
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

onToggleLPUClick = function() {
    mm_menu_right.open();
    $("a[href='#toggle_lpus']")[0].click()
}
onToggleTractClick = function() {
    mm_menu_right.open();
    $("a[href='#toggle_tracts']")[0].click()
}
openRightMenu = function() {
    mm_menu_right.open();
}
openServerMenu = function() {
    mm_menu_left.open();
}
