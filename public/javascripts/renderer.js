var TURBOBEAST_RENDERER = (function ($) {
	var renderer = {},
	renderMachine;

	renderMachine = function (template, $container) {
		return function (item) {
			item.cubeClass = 'ghost';
			var rendered = Mustache.render(template, item),
			$rendered = $( rendered );

			$container.append( $rendered );
			
			return{
				slug : item.slug,
				elem : $rendered

			};
		}
	};

	renderer.render = function (template, $container, data, cb) {
		
		var machine = renderMachine(template, $container),
		i = 0,
		ghosts = [];

		function loopThrough (num) {
			
			ghosts.push( machine(data[num]) );

			if(num + 1 < data.length) {
				loopThrough(num + 1);
			} else {
				if(typeof cb === 'function') {
					cb(ghosts);
				}
			}
			
		}

		if(data instanceof Array) {
			loopThrough(0);
			return;
		}

		if(data instanceof Object) {
			machine(data);
		}
	};

	return renderer;
}(jQuery));