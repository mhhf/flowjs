
requirejs.config({
	shim: {
		'libs/backbone-min': {
			//These script dependencies should be loaded before loading
			//backbone.js
			deps: ['libs/underscore-min', 'libs/jquery'],
			//Once loaded, use the global 'Backbone' as the
			//module value.
			exports: 'Backbone'
		},
		'app': [
			'libs/backbone-min',
			'libs/jquery-ui',
			'model/flowModel',
			'view/flowView',
			'libs/flow',
			'libs/buckets'
		],
		'libs/jquery-ui'	: ['libs/jquery'],
		'libs/flow'			 : ['libs/buckets'],
		'model/flowModel' : ['libs/backbone-min','libs/flow'],
		'view/flowView'		: ['libs/backbone-min']


	}
});


require(["app"], function() {

	$(function () {
		window.App = new window.Router();
		Backbone.history.start();
	});

});
