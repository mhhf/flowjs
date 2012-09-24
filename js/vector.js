/**
 * 
 *
 *
 *
 */


/** 
 * helper Class library
 * @class Class
 *
 * @constructor
 * @return Prototyp
 */
var Class = function() {
	var klass = function() {
		this.init.apply(this, arguments);
	};
	klass.prototype.init = function(){};
	return klass;
};


/** 
 * Class Vektor with helper methods
 * @class Vektor
 *
 * @constructor
 */
var Vector = new Class;
Vector.fn = Vector.prototype;

/** 
 * Initialize the vector
 * @class Vektor
 *
 * @method init
 * @param {Number} x param of the Vektor
 * @param {Number} y param of the Vektor
 */
Vector.fn.init = function(x, y) {
	this.x = x;
	this.y = y;
};

/** 
 * Magnitude of the vector
 * @class Vektor
 *
 * @method getMagnitude
 * @return {Number} Pythagoras
 */
Vector.fn.getMagnitude = function() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
};

/** 
 * Normalize the vector
 * @class Vektor
 *
 * @method normalize
 */
Vector.fn.normalize = function() {
	magnitude = this.getMagnitude();
   	this.x /= magnitude;
	this.y /= magnitude;
};

/** 
 * Get the vector between two given points
 *
 * @class Vektor
 *
 * @method vectorFromPoints
 * @param {Number} x coordinate of the first point 
 * @param {Number} y coordinate of the first point
 * @param {Number} x coordinate of the second point 
 * @param {Number} y coordinate of the second point 
 * @return {Number} The vector between the two given points
 */
Vector.fn.vectorFromPoints = function(from_x, from_y, to_x, to_y) {
	var x = to_x - from_x,
		y = to_y - from_y;
	return new Vector(x, y);
};



var tweener = [];


/** 
 * Class MovingBox with helper methods.
 * @class MovingBox
 *
 * @constructor
 */
var MovingBox = new Class;
MovingBox.fn = MovingBox.prototype;

/** 
 * Initialize the Box.
 * @class MovingBox
 *
 * @method init
 * @param {Number} The top-left x coordinates of the Box
 * @param {Number} The top-left y coordinates of the Box
 * @param {Vector} The animation vector along which the box will be animated
 * @param {Elem} The HTML element representing the box in the DOM
 */
MovingBox.fn.init = function(x_pos, y_pos, vector, elem) {
	this.elem = elem;
	this.id = elem.attr("id");
	this.x_pos = x_pos;
	this.y_pos = y_pos;
	this.dir_vector = vector;
};

/** 
 * Starts the animation of the box. The box will be animated along it's normalized animation-vector multiple 1000. !! JSTWEENER needed !!
 * @class MovingBox
 *
 * @method moveBox
 */
MovingBox.fn.moveBox = function() {
	var end_pos_x = this.x_pos + this.dir_vector.x * 1000;
	var end_pos_y = this.y_pos + this.dir_vector.y * 1000;
	var square = document.getElementById(this.id);
	var id = this.id;
	$("#" + this.id).animate({
	    top: end_pos_y,
	    left: end_pos_x
	  }, 600, function( ) {
	  	nextAnimation.setFlag(); 
	    // Animation complete.
	  });
//	JSTweener.addTween(square.style, {
//            time: 0.6,
//            transition: "easeInQuad",
//            onComplete: function() { nextAnimation.setFlag() },
//            left: end_pos_x,
//            top: end_pos_y
//    });	
};

/** 
 * Starts the back - animation of the box. The box will be animated along it's normalized animation-vector multiple 1000. !! JSTWEENER needed !!
 * @class MovingBox
 *
 * @method moveBox
 */
MovingBox.fn.moveBoxBack = function() {
	var end_pos_x = this.x_pos,
		end_pos_y = this.y_pos,
		start_pos_x = this.x_pos + this.dir_vector.x * 1000,
		start_pos_y = this.y_pos + this.dir_vector.y * 1000,
		square = document.getElementById(this.id);
	// Move Box to starting position	
	square.style.left = start_pos_x;
	square.style.top = start_pos_y;
	$("#" + this.id).show();
	$("#" + this.id).animate({
	    top: end_pos_y,
	    left: end_pos_x
	  }, 600, function( ) {
	  	backAnimation.setFlag(); 
	    // Animation complete.
	  });
//	JSTweener.addTween(square.style, {
//            time: 0.6,
//            transition: "easeInQuad",
//            onComplete: function() { backAnimation.setFlag() },
//            left: end_pos_x,
//            top: end_pos_y
//    });	
};

