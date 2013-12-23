var TURBOBEAST_CUBES = (function ($){
	var cube_controller = {},
	cubeTemplate = $.trim($('#cubetemplate').html()),
	$cubeStage = $('.stage'),
	cubeSize = 80,
	width = $cubeStage.innerWidth(),
	height = $cubeStage.innerHeight(),
	cubehits= [],
	cubies = [],
	animFrame = (function(){
          return  window.requestAnimationFrame       ||
                  window.webkitRequestAnimationFrame ||
                  window.mozRequestAnimationFrame    ||
                  window.oRequestAnimationFrame      ||
                  window.msRequestAnimationFrame     ||
                  function(/* function */ callback/*,  DOMElement  element */){
                    window.setTimeout(callback, 1000 / 60);
                  };
    }());

	function checkcollision (cube, space) {
		var i = 0,
		distX,
		distY,
		collision = false;

		for(i =0; i < cubehits.length; i += 1) {
			distX = Math.abs(cube.topPos - cubehits[i].topPos)
			if(distX < space) {

				distY = Math.abs(cube.leftPos - cubehits[i].leftPos);
				if(distY < space) {
					collision = true;
				}
			}
		}

		return collision;
	}

	renderMachine = function (template, $container, tranZ) {

		return function (item, order) {
			item.order = order;
			item.cubeClass = 'cube';
			var rendered = Mustache.render(template, item),
			$rendered = $( rendered ),
			space = 400,
			theCube = {},
			cubeHit = {};

			cubeHit.topPos = cubeSize + Math.ceil(Math.random() * (height-cubeSize*2));
			cubeHit.leftPos = cubeSize + Math.ceil(Math.random() * (width-cubeSize*2));

			while(checkcollision(cubeHit, space)) {
				cubeHit.topPos = cubeSize + Math.ceil(Math.random() * (height-cubeSize*2));
				cubeHit.leftPos = cubeSize + Math.ceil(Math.random() * (width-cubeSize*2));
				space -= 10;
			}

			cubehits.push(cubeHit);

			var percent  = Math.round(cubeHit.leftPos/Math.round(width) * 100);

			$rendered.css({ top: 0, transform: 'translateY(' + cubeHit.topPos + ')px', left :percent + '%'});
			$container.append( $rendered );
		
			theCube = {
				elem : $rendered,
				pos : cubeHit,
				tranZ : tranZ,
				tranY : cubeHit.topPos,
				tranZTarget : tranZ,
				tranYTarget : 0,
				width: cubeSize,
				targetWidth : cubeSize,
				left : percent,
				targetLeft : percent,
				chosen : false,
				type : item.type,
				slug : item.slug
			};

			cubies.push(theCube);
		}
	};

	cube_controller.resizeProperCube = function (slug, $elem, delta) {

		var i = 0;
		for(i = 0 ; i < cubies.length; i+= 1) {
			if(cubies[i].slug === slug) {
				cubies[i].tranYTarget = $elem.offset().top - delta;
				cubies[i].targetWidth = $elem.width();
				cubies[i].elem.css({height : $elem.outerHeight() + 'px'});
			}
		}
	};

	cube_controller.makeCubeProper = function (slug, $elem, delta, cb) {
		var i = 0;

		//height = window.innerHeight;
		console.log(arguments);

		for(i = 0 ; i < cubies.length; i+= 1) {
			if(cubies[i].slug === slug) {
				cubies[i].tranZTarget = 0;
				cubies[i].oldTranZ = cubies[i].tranZ;
				cubies[i].oldTranY = cubies[i].tranY;
				cubies[i].tranYTarget = $elem.offset().top - delta;
				cubies[i].chosen = true;
			}
		}

		setTimeout(function () {
			var i = 0;
			for(i = 0 ; i < cubies.length; i+= 1) {
				if(cubies[i].slug === slug) {
					cubies[i].targetWidth = $elem.width();
					cubies[i].targetLeft = 0;
					cubies[i].oldLeft = cubies[i].left;
					cubies[i].oldWidth = cubies[i].width;
					cubies[i].elem.addClass('chosen');
					cubies[i].elem.css({opacity : '1', height : $elem.outerHeight() + 'px'});
					
				}
			}

			if(typeof cb === 'function') {
				cb();
			}
			
		},1200);
	}

	cube_controller.makeCubeFloater = function (slug, cb) {

		var i = 0;
		for(i = 0 ; i < cubies.length; i+= 1) {
			if(cubies[i].slug === slug) {
				cubies[i].tranZTarget = cubies[i].oldTranZ;
				cubies[i].tranY = cubies[i].oldTranY;
				cubies[i].targetWidth = cubies[i].oldWidth;
				cubies[i].targetLeft = cubies[i].oldLeft;
				cubies[i].elem.removeClass('chosen');
				cubies[i].elem.css({opacity : '0.4', height : cubies[i].oldWidth + 'px' });
			}
		}

		setTimeout(function () {
			var i = 0;
			for(i = 0 ; i < cubies.length; i+= 1) {
				if(cubies[i].slug === slug) {
					cubies[i].chosen = false;

					
					cubies[i].tranY = cubeSize + Math.ceil(Math.random() * (height-cubeSize*2));
					

					cubies[i].elem.css({opacity : '0.4', height : cubies[i].oldWidth + 'px', top : '0'});
				}
			}

			if(typeof cb === 'function') {
				cb();
			}
		},1200);
	}



	function setUpCubes (data, $stage, tranZ, category, cb) {

		var templateIdString = "#" + category + 'template',
		machine,
		template;
		template = $.trim( $(templateIdString).html() );

		machine = renderMachine(template, $stage, tranZ);
		function loopThrough (num) {
			machine(data[num], num);

			if(num + 1 < data.length) {
				loopThrough(num + 1);
			} else {
				if(typeof cb === 'function') {
					cb();
				}
			}
			
		}

		if(data instanceof Array) {
			loopThrough(0);
			return;
		}
	}	

	function looper () {
		var i = 0;
		for(i = 0 ; i < cubies.length; i += 1) {
			if(cubies[i].chosen) {
				cubies[i].tranY += (cubies[i].tranYTarget - cubies[i].tranY) * 0.1;
			} else {
				cubies[i].tranY += 1;
				if(cubies[i].tranY > height - cubeSize) {
					cubies[i].tranY =  -cubeSize;		
				}
			}

			cubies[i].width += (cubies[i].targetWidth - cubies[i].width) * 0.2;
			cubies[i].left += (cubies[i].targetLeft - cubies[i].left) * 0.1;
			cubies[i].tranZ += (cubies[i].tranZTarget - cubies[i].tranZ) * 0.1;
			if(cubies[i].chosen) {
				cubies[i].elem.css( { 
					'transform' : 'translateY( 0px) ' + ' translateZ(' + cubies[i].tranZ +'px)',
					'width' : cubies[i].width + 'px',
					'left' : cubies[i].left + '%',
					'top' : cubies[i].tranY + 'px'
				});
			} else {
				cubies[i].elem.css( { 
					'transform' : 'translateY(' + cubies[i].tranY + 'px) ' + ' translateZ(' + cubies[i].tranZ +'px)',
					'width' : cubies[i].width + 'px',
					'left' : cubies[i].left + '%'
				});
			}
			
		}

		animFrame(looper);
	};

	function setUpCubeGroup (groupname, cb) {
		var zDepth = Math.floor( Math.random() * -200);
		$.ajax({
			method : "GET",
			url : '/' + groupname,
			success : function (data) {
				setUpCubes(data[groupname], $('.skillstage'), zDepth, groupname, function () {
					if(typeof cb === 'function') {
						cb();
					}
				});
			},
			error : function (err) {
				console.log('error');
				console.log(err);
			}
		});
	}

	cube_controller.init = function (groups, ready) {

		var totalComplete = 0;

		function recurser (num) {
			if(num === groups.length) {
				if(typeof ready === 'function') {
					ready();
				}
				return;
			}

			setUpCubeGroup(groups[num], function () {
				recurser(num+1);
			});
		}

		recurser(0);
		looper();
	};

	return cube_controller;

}(jQuery));