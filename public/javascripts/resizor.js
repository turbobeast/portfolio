var TURBOBEAST_RESIZOR = (function ($) {
	'use strict';
	var sizor = {},
	heavyDuty,
	relay,
	handlers = [],
	resizeTimer = null;

	heavyDuty = function () {
		console.log('eavy duty');
		resizeTimer = null;

		var i = 0,
		width = window.innerWidth,
		height = window.innerHeight;

		console.log(handlers);

		for(i = 0; i < handlers.length; i += 1) {
			handlers[i](width, height);
		}
	};

	relay = function (e) {

		if(e) { e.preventDefault(); }
		if(resizeTimer !== null) {
			clearTimeout(resizeTimer);
		}
		resizeTimer = setTimeout(heavyDuty, 200);
	};

	sizor.addHandler = function (funk) {
		if(typeof funk === 'function') {
			handlers.push(funk);
		}
	};

	sizor.init = function () {
		heavyDuty();
		$(window).bind('resize', relay);
	};

	return sizor;

}(jQuery));	