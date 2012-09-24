
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());



/**
 * REQUIRED: vector.js
 * REQUIRED: script.js
 * Three modules in here:
 *      nextAnimation for the treeView
 *      backAnimation for the treeView
 *      sliderView
 *      
 *      External plugins for the treeView:
 *      pdfView -> pdfObject
 *      
 **/


// globals 
var nextAnimation = {};
var backAnimation = {};
var sliderView = {};
var treeView = {};


(function($){

    /**
    * ListView Animation Plugin
    * 
    * @module listViewAnimation
    */

    nextAnimation =  {
        init: function (elem) {
            // Source Element
            nextAnimation.sourceElem = elem;//$("div#" + elemId, $(".treeView"));
            nextAnimation.sourcePos = {
                    left: parseInt(nextAnimation.sourceElem.css("left")),
                    top: parseInt(nextAnimation.sourceElem.css("top"))
            };
            // boxes and flags
            nextAnimation.boxes = [];
            nextAnimation.flags = 0;
            // start animation
            nextAnimation.startAnim();
            
        },
        // calculate the animation vector between the source box and each to be animated box
        calcAnimVector : function (mov_x, mov_y) {
            var vector = new Vector(0,0);
            vector = vector.vectorFromPoints(nextAnimation.sourcePos.left, nextAnimation.sourcePos.top, mov_x, mov_y);
            vector.normalize();
            
            return vector;
        },
        // register all boxes for animation
        registerBoxes: function () {
            $(".container").not("#"+ nextAnimation.sourceElem.attr("id")).each(function() {
                nextAnimation.registerBox($(this));
            });         
            // if there are no boxes to be animated, set flag anyway
            if (nextAnimation.flags == 0) {
                nextAnimation.setFlag();
            }
        },
        // register a single box for animation, also calculate its animation vector
        registerBox: function (elem) {
            var elemPos = elem.position(),
                dirVector = nextAnimation.calcAnimVector(elemPos.left, elemPos.top),
                box = new MovingBox(elemPos.left, elemPos.top, dirVector, elem);    
            nextAnimation.boxes.push(box);
            // for better performance the animation for each box will be started directly after registering
            box.moveBox();
            nextAnimation.flags++;
        },
        // NOT IN USE: move all boxes
        moveBoxes: function (){
            var i,
                max,
                boxes = nextAnimation.boxes;
                
            for (i = 0, max = boxes.length; i < max; i++) {
                // this calls the box model's method moveBox()
                boxes[i].moveBox();
            }
        },
        // start the animation 
        startAnim: function () {
            nextAnimation.registerBoxes();
            //nextAnimation.moveBoxes();
        },
        // wait until all boxes have finished their animation, then render loaded data
        setFlag: function () {
            nextAnimation.flags--;
            if (nextAnimation.flags <= 0) {
                // Let COCO App know that animation has finished
                COCO.putData();
                $(COCO.settings.ajaxTrigger).hide();
                nextAnimation.showBoxes();
            }
        },
        // start fading in boxes in the loaded data
        showBoxes: function () {
            var newBoxes = $(".container");
            $(COCO.settings.headerId + " h1").fadeIn("slow");
            $(COCO.settings.headerId + " h2").fadeIn("slow");
            var first = newBoxes.first();
            nextAnimation.showBox(first, newBoxes.length);
        },
        // recursively fade in the boxes
        showBox: function (elem, boxCount) {
            // FIRST do first 20percent, start next container animation
            var boxCount = boxCount;
            elem.fadeTo( 50, 0.2, function () {
                var curr = $(this);
                if (curr.next()){
                    boxCount --;
                    nextAnimation.showBox(curr.next(), boxCount);
                }
            });
            // THEN do the rest of the animation
            elem.fadeTo( 100, 1);
            // THEN reassign click events when all boxes finished their animation
            if (boxCount <= 0) {
                COCO.assignTriggers();
            }
        }       
    };

    
    backAnimation = {
        init: function (elemId) {
            // Source Element
            backAnimation.sourceElem = $("div#" + elemId, $(".treeView"));
            backAnimation.sourcePos = {
                    left: parseInt(backAnimation.sourceElem.css("left")),
                    top: parseInt(backAnimation.sourceElem.css("top"))
            };
            
            // boxes and flags
            backAnimation.boxes = [];
            backAnimation.flags = 0;
            
            // start animation
            backAnimation.startAnim();
        },
        // calculate the animation vector between the source box and each to be animated box
        calcAnimVector : function (mov_x, mov_y) {
            var vector = new Vector(0,0);
            vector = vector.vectorFromPoints(backAnimation.sourcePos.left, backAnimation.sourcePos.top, mov_x, mov_y);
            vector.normalize();
            return vector;
        },
        // register all boxes for animation
        registerBoxes: function () {
            $(".container").not("#"+ backAnimation.sourceElem.attr("id")).each(function() {
                backAnimation.registerBox($(this));
            });         
            // if there are no boxes to be animated, set flag anyway
            if (backAnimation.flags == 0) {
                backAnimation.setFlag();
            }
        },
        // register a single box for animation, calculate its animation vector and start its animation
        registerBox: function (elem) {
            var elemPos = {
                    left: parseInt(elem.css("left")),
                    top: parseInt(elem.css("top"))
                },
                dirVector = backAnimation.calcAnimVector(elemPos.left, elemPos.top),
                box = new MovingBox(elemPos.left, elemPos.top, dirVector, elem);    
            
            backAnimation.boxes.push(box);
            backAnimation.flags++;
            // for better performance the animation for each box will be started directly after registering
            box.moveBoxBack();
        },
        // start the animation 
        startAnim: function () {
            backAnimation.registerBoxes();
            backAnimation.sourceElem.fadeIn("slow");
            $(COCO.settings.headerId + " h1").fadeIn("slow");
            $(COCO.settings.headerId + " h2").fadeIn("slow");
            //backAnimation.moveBoxes();
            
        },
        // wait until all boxes have finished their animation, then render loaded data
        setFlag: function () {
            backAnimation.flags--;
            if (backAnimation.flags <= 0) {
                COCO.assignTriggers();
            }
        },
        // NOT IN USE: move all boxes 
        moveBoxes: function (){
            var i,
                max,
                boxes = backAnimation.boxes;
                
            for (i = 0, max = boxes.length; i < max; i++) {
                // this calls the box model's method moveBox()
                boxes[i].moveBoxBack();
            }
        }
    };
        
    
    /**
    * sliderView Animation Plugin, horizontal slider, automatically calcs the width of the panelContainer, circular navigation, initial position can be set (1-n)
    * 
    * @module sliderView
    */
    treeView = {
        settings: {
            currentPage: 0
        },   
        init: function (notOnGrid) {
            var panelFrameWidth = treeView.panelFrameWidth = 700;
            var cPage = treeView.currentPage = 0;
            var maxPage = treeView.maxPage = Math.floor(notOnGrid/5)+1;
            if(notOnGrid = 0){treeView.maxPage = 0;}

            $(".tvNavNext").click(function (e) {
               e.preventDefault();
               treeView.next();

            });
            $(".tvNavBack").click(function (e) {
               e.preventDefault();
               treeView.back();
            });
            treeView.toggle(".tvNavBack",false);
        },
        next: function()
        {
            if(treeView.currentPage<treeView.maxPage){
                treeView.currentPage ++;
                treeView.toggle(".tvNavBack",true);
                $(".treeView").animate({ marginLeft: -(treeView.currentPage * treeView.panelFrameWidth ) });     
            }
            if(treeView.currentPage == treeView.maxPage)
            {
                treeView.toggle(".tvNavNext",false);
            }
        },
        back: function()
        {
            if(treeView.currentPage>0){
                treeView.currentPage --;
                $(".treeView").animate({ marginLeft: -(treeView.currentPage * treeView.panelFrameWidth ) });     
                treeView.toggle(".tvNavNext",true);
            }
            if(treeView.currentPage == 0)
            {
                treeView.toggle(".tvNavBack",false);
            }
        },
        toggle: function (what,bool)
        {
            if(bool)
            { $(what).show();}
            else
            { $(what).hide();} 
        }
    };
    
    sliderView = {
        settings: {
            slideEaseDuration: 1000,
            slideEaseFunction: "easeInOutExpo"
        },
        // currentPanel : intial Position
        init : function (currentPanel) {
            // Setting width of panelContainer
            var panelWidth = sliderView.panelWidth = $(".panel-container").find(".panel").width();
            var panelCount = sliderView.panelCount = $(".panel-container").find(".panel").size();
            var panelContainerWidth = panelWidth * panelCount;
            $(".panel-container").css({ width: panelContainerWidth });


            // Set initial position of Slider   
            var currentPanel;   
            if (currentPanel) {
                currentPanel = sliderView.currentPanel = parseInt(currentPanel);
            } else {
                currentPanel = sliderView.currentPanel = 1;
            }
            var offset = sliderView.offset = - (sliderView.panelWidth*(sliderView.currentPanel - 1));
            $(".panel-container").css({ marginLeft: offset });
            
            
            // Register Navigation
            $(".slider-nav-prev").click(function (e) {
                e.preventDefault();
                sliderView.prev();
            });
            $(".slider-nav-next").click(function (e) {
                e.preventDefault();
                sliderView.next();
            });
        },
        // slide to previous slide in line
        prev: function () {
            if (sliderView.currentPanel == 1) {
                // jump to end, comment if not needed
                sliderView.offset = - (sliderView.panelWidth * (sliderView.panelCount - 1));
                sliderView.currentPanel = sliderView.panelCount;
                $(".panel-container").animate({ marginLeft: sliderView.offset });
            } else {
                sliderView.currentPanel -= 1;
                sliderView.offset = - (sliderView.panelWidth * (sliderView.currentPanel - 1));
                $(".panel-container").animate({ marginLeft: sliderView.offset });
            }
        },
        // slide to next slide in line
        next: function () {
            if (sliderView.currentPanel == sliderView.panelCount) {
                // jump to start, comment if not needed 
                sliderView.offset = 0;
                sliderView.currentPanel = 1;
                $(".panel-container").animate({ marginLeft: sliderView.offset });
            } else {
                sliderView.currentPanel += 1;
                sliderView.offset = - (sliderView.panelWidth * (sliderView.currentPanel - 1));
                $(".panel-container").animate({ marginLeft: sliderView.offset });
            }
        }
    };
    
})(jQuery);

