var personalWebsiteApp = angular.module('personalWebsite', ['ngRoute']);

var PersonalWebsiteController = function() {

  /* Private variables */
  var private = {
      videoBackground:           undefined, 
      videoOverlay:              undefined,
      videoContainer:            undefined,
      videoOverlayTextTop:       undefined,
      videoOverlayTextBottom:    undefined,
      chevDown:                  undefined,
      videoOverlayTextBottomDiv: undefined,
      chevCont:                  undefined,
      deferred:                  undefined,
      fontBaseUnit:              undefined,
      windowHeight:              undefined, 
      windowWidth:               undefined, 
      videoHeight:               undefined, 
      modalShown:                false
  }

  function setPrivateVars() {
    private.windowHeight = $(window).height();
    private.windowWidth  = $(window).width();
    private.videoHeight  = $("#videoBackground").height();
    private.fontBaseUnit = private.windowWidth/1920;

    private.videoBackground           = $("#videoBackground");
    private.videoOverlay              = $("#videoOverlay");
    private.videoContainer            = $("#videoContainer");
    private.videoOverlayTextTop       = $("#videoOverlayTextTop");
    private.videoOverlayTextBottom    = $("#videoOverlayTextBottom");
    private.chevDown                  = $("#chevDown");
    private.videoOverlayTextBottomDiv = $("#videoOverlayTextBottomDiv");
    private.chevCont                  = $("#chevCont");
  }

  /** Helper functions */
  var helpers = (function () {

    /** Returns an object with:
     *  - cssProp: The max or min of the width and the height of the image
     *  - cssVal: The value of the default width if cssProp = width
     *            or height if cssProp = height
     *  @param {DOM img} img: a DOM image element
     *  @param {boolean} maxOrMin: false if you want to use min,
     *                   defaults to true
     *  @param {float/int} mult: optional multiplier to thisHeight
     *                           defaults to 1
     */
    function calcImgMaxOrMin(img, maxOrMin, mult) {
      maxOrMin = (maxOrMin === undefined) ? true : maxOrMin;
      mult = (mult === undefined) ? 1 : mult;
      var thisHeight = img.naturalHeight * mult;
      var thisWidth = img.naturalWidth;
      var heightOrWidthArray = ['height', 'width'];
      var heightOrWidth = maxOrMin ? Math.max(thisHeight, thisWidth) : Math.min(thisHeight, thisWidth);
      var cssProp, cssVal;
      if (heightOrWidth == thisHeight) {
        cssProp = heightOrWidthArray[0];
        cssVal = thisWidth;
      } else {
        cssProp = heightOrWidthArray[1];
        cssVal = thisHeight;
      }
      return {
        cssProp: cssProp,
        cssVal: cssVal
      }
    }

    /** Resolves the deferred object for modal images
     *  @param {jQuery img element} lastElement - the last image in the modal
     *  @param {boolean} load - whether or not to wait for images to load
     */
    function resolveDeferred(lastElement, load) {
      if (private.deferred !== undefined) {
        private.deferred.resolve(lastElement, load);
        private.deferred = undefined;
      }
    }

    /** Controls animation of text over video */
    function animateText() {
      windowHeight = $(window).height();
      windowWidth = $(window).width();
      videoHeight = $("#videoBackground").height();
      $("#videoOverlayTextTop").animate({"opacity": 1}, 300);
      responsiveJS(windowWidth, windowHeight, videoHeight);
      setTimeout(function() { // animate bottom text
        $("#videoOverlayTextBottomDiv").animate({"opacity": 1}, 300);
      }, 1500);
    }

    /** Controls chevron over video to animate down
     *  and up by the value specified by fontBaseUnit
     *  @param {int} fontBaseUnit - base unit for video font sizes
     */
    function animateChevron() {
      private.chevDown.animate({"margin-top": private.fontBaseUnit + "em"}, 500, 'linear', function() {
        private.chevDown.animate({"margin-top": "0px"}, 500, 'linear');
      });
    }

    /** Helper functions return object */
    return {
      calcImgMaxOrMin: calcImgMaxOrMin,
      resolveDeferred: resolveDeferred,
      animateText: animateText,
      animateChevron: animateChevron
    };
  })();

  /** PersonalWebsiteController initializer */
  function init() {

    // Overwriting private JQuery variables
    setPrivateVars();

    eventHandlers();
    sizingJS();
    responsiveJS(private.windowWidth, private.windowHeight, private.videoHeight);
    $(window).resize(function() {
      private.windowHeight = $(window).height();
      private.windowWidth = $(window).width();
      private.videoHeight = $("#videoBackground").height();
      responsiveJS(private.windowWidth, private.windowHeight, private.videoHeight);
    });

    private.videoBackground[0].play();
    helpers.animateChevron();
    var chevronInterval = setInterval(helpers.animateChevron, 1000);
  }

  /** PersonalWebsiteController Events */
  function eventHandlers() {

    $("body").on({

      /** Scrolls to lower section when down chevron clicked */
      click: function() {
        var container = $("body"),
          scrollTo = $("#nav");
        container.animate({scrollTop: scrollTo.offset().top}, 1500, "easeInOutQuint");
      }
    }, "#chevDown");

    $("body").on({

      /** Changes project tiles displayed */
      click: function() {
        $(".activeItem").removeClass("activeItem");
        $(this).addClass("activeItem");
        setTileSize();
      }
    }, ".navTab");

    $("body").on({

      /** Enlarges tile, give box shadow, displays project name */
      mouseenter: function() {
        var tileSize = $(this).height();
        $(this).children(".tileTitle").css("bottom", 0);
        $(this).css("height", tileSize + 10 + "px")
          .css("width", tileSize + 10 + "px")
          .css("box-shadow", "5px 5px 26px rgba(0, 0, 0, 0.7)");
      },

      /** Returns tiles to default css */
      mouseleave: function() {
        $(this).children(".tileTitle").css("bottom", "-50%");
        setTileSize();
        $(this).css("box-shadow", "0 0 0 rgba(0, 0, 0, 1)");
      }
    }, ".tileCont");

    // Tooltips
    $("#linkedIn").tooltip({"title": "LinkedIn", "placement": "bottom"});
		$("#github").tooltip({"title": "Github", "placement": "bottom"});
    $("#resume").tooltip({"title": "Resume", "placement": "bottom"});
  }

  /////////////////////////////////////////////////////////////////
  // Sizing Functions
  /////////////////////////////////////////////////////////////////

  /** Initial sizing of elements using JavaScript */
  function sizingJS() {
    setTileSize();

    var video = document.getElementById("videoBackground");
    video.addEventListener("loadedmetadata", function(event) {
      actualRatio = video.videoWidth/video.videoHeight;
      targetRatio = 1.777777777;
      adjustmentRatio = targetRatio/actualRatio;
      $("#videoBackground").css("-webkit-transform","scaleX(" + adjustmentRatio + ")");
      setTimeout(helpers.animateText, 4500);
    });
  }

  /** JS to be executed on window.resize */
  function responsiveJS(windowWidth, windowHeight, videoHeight) {
    var topFontSize = (windowWidth/1920 * 8) + "em";
    var bottomFontSize = (windowWidth/1920 * 4) + "em";
    private.fontBaseUnit = windowWidth/1920;

    private.videoOverlay.height(videoHeight);

    private.videoOverlayTextTop.css("font-size", topFontSize);
    private.videoOverlayTextBottom.css("font-size", bottomFontSize);
    private.chevDown.css("height", bottomFontSize);
    private.videoOverlayTextBottomDiv.css("margin-bottom", bottomFontSize);
    private.chevCont.css("height", bottomFontSize);
  }

  /** Sets size of project tiles */
  function setTileSize() {
    var tileSize = $(".tile").parent().width()/4 - 10;
    $(".tile").css("width", tileSize + "px")
      .css("height", tileSize + "px");
    $(".tileCont").css("width", tileSize-10 + "px")
      .css("height", tileSize-10 + "px");
    // $(".tile").css("border-radius", tileSize/16 + "px")
  }

  /** Sets default sizing of images in project tiles */
  function setTileImgSize() {
    $(".tileImg").each(function(i) {
      var img = $(this)[0];
      var css = helpers.calcImgMaxOrMin(img, false);
      $(this).css(css.cssProp, "100%");
    });
  }

  /** Sets the modal size of all the active modal images
   *  @param {boolean} load - whether or not we want to wait for
   *                          each modal img to load
   */
  function setModalImgSize(load) {
    var mb = $(".modal-body");
    $(".modalImg").each(function() {
      var img = $(this)[0];
      if (load) {
        img.onload = function() {
          var mbWidth = mb.width();
          var mbHeight = mb.height();
          var mbRatio = mbWidth/mbHeight;
          var css = helpers.calcImgMaxOrMin(img, true, mbRatio);
          $(this).css(css.cssProp, "calc(100% - 30px)");
        }
      } else {
        var mbWidth = mb.width();
        var mbHeight = mb.height();
        var mbRatio = mbWidth/mbHeight;
        var css = helpers.calcImgMaxOrMin(img, true, mbRatio);
        $(this).css(css.cssProp, "calc(100% - 30px)");
      }

    });
  }


  /////////////////////////////////////////////////////////////////
  // Angular Creation
  /////////////////////////////////////////////////////////////////
  var pwAngularInit = function() {

    // Angular Controllers ////////////////////////////////////////
    personalWebsiteApp.controller('personalWebsiteCtrl', function($scope) {

      // Public Angular DOM Variables /////////////////////////////
      $scope.viewModel = {
        section1: data.section1, 
        section2: data.section2, 
        section3: data.section3, 

        currentIndex: 0, 
        projectsDisplayed: undefined, 
        currentProject: undefined
      }
      var setViewModel = (function() {
        $scope.viewModel.projectsDisplayed = $scope.viewModel.section1;
      })();

      // Public Angular DOM Methods ///////////////////////////////

      /** Changes $scope.viewModel.projectsDisplayed to the given projectType
       * @param {array of objects} projectType - The projects to display
       */
      $scope.viewModel.changeProjectsDisplayed = function(projectType) {
        $scope.viewModel.projectsDisplayed = projectType;
      }

      /** Sets the project to be displayed in the project modal.
       *  Creates a deferred object to be resolved after the modal,
       *    or all images are loaded
       *  @param {int} projectIndex - the index of the project in
       *                              projectsDisplayed to display
       */
      $scope.viewModel.setCurrentProject = function(projectIndex) {
        $scope.viewModel.currentProject = $scope.viewModel.projectsDisplayed[projectIndex];
        $scope.viewModel.currentIndex = projectIndex;
        if ($scope.viewModel.projectsDisplayed == $scope.viewModel.section1) {
          $("#modalBodyContent").load($scope.viewModel.currentProject['href']);
        }

        private.deferred = new $.Deferred();
        private.deferred.done(function(lastElement, load) {
          setModalImgSize(load);
          lastElement.css('margin','0 auto 0 auto');
        });
      }

      // Angular Event Handlers, for $scope variables /////////////
      var eventHandlers = (function() {
        $("body").on({

          /** Cycles to the next modal project in order */
          click: function() {
            $scope.$apply(function() {
              if ($scope.viewModel.currentIndex == $scope.viewModel.projectsDisplayed.length - 1) {
                $scope.viewModel.currentIndex = 0;
              } else {
                $scope.viewModel.currentIndex++;
              }
              $scope.viewModel.setCurrentProject($scope.viewModel.currentIndex);
            })
          }
        }, ".rightArrow");

        $("body").on({

          /** Cycles to the previous modal project in order */
          click: function() {
            $scope.$apply(function() {
              if ($scope.viewModel.currentIndex == 0) {
                $scope.viewModel.currentIndex = $scope.viewModel.projectsDisplayed.length - 1;
              } else {
                $scope.viewModel.currentIndex--;
              }
              $scope.viewModel.setCurrentProject($scope.viewModel.currentIndex);
            })
          }
        }, ".leftArrow");

        $("body").on({

          /** Resolves the deferred if graphic design */
          "shown.bs.modal": function() {
            if ($scope.viewModel.projectsDisplayed == $scope.viewModel.section2) {
              var lastElement = $(".modal-body img").last();
              helpers.resolveDeferred(lastElement, false);
              private.modalShown = true;
            }
          },
          "hidden.bs.modal": function() {
            private.modalShown = false;
          }
        }, "#projectModal");
      })();
    });

    // Angular Directives /////////////////////////////////////////

    /** Modal image: check if last modal image rendered */
    personalWebsiteApp.directive('modalImgRepeatDirective', function() {
      return function(scope, element, attrs) {
        if (scope.$last) { // last ng-repeat element
          if (private.modalShown) {
            helpers.resolveDeferred(angular.element(element), true);
          }
        }
      }
    });

    /** Tile image: check if last tile image rendered */
    personalWebsiteApp.directive('tileImgRepeatDirective', function() {
      return function(scope, element, attrs) {
        if (scope.$last) { // last ng-repeat element
          setTileImgSize();
        }
      }
    });
  }



  // Personal Website return object ///////////////////////////////
  return {
    /* Public Variables */

    /* Public Methods */
    init: init,
    pwAngularInit: pwAngularInit
  }
}
