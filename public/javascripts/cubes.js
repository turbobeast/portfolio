var TURBOBEAST_CUBES = (function ($){
	var cube_controller = {},
	cubeTemplate = $.trim($('#cubetemplate').html()),
	$cubeStage = $('.skillstage'),
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

		var machine, template;
		switch(category) {
			case 'projects':
				template = $('#projecttemplate').html().trim();
			break;
			case 'skills':
				template = $('#skillstemplate').html().trim();
			break;
			case 'contact':
				template = $('#contacttemplate').html().trim();
			break;
		}

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

			//cubies[i].tranY += (cubies[i].tranYTarget - cubies[i].tranY) * 0.1;
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

	cube_controller.init = function (ready) {
		var projs_done = false,
		contacts_done = false,
		skills_done = false;

		function checkComplete () {
			if(projs_done && skills_done && contacts_done) {
				if(typeof ready === 'function') {
					ready();
				}
			}
		}

		$.ajax({
			method : "GET",
			url : '/projects',
			success : function (data) {
				setUpCubes(data.projects, $('.skillstage'), -80, 'projects', function () {
					projs_done = true;
					checkComplete();
				});
			},
			error : function (err) {
				console.log('error');
				console.log(err);
			}
		});

		$.ajax({
			method : "GET",
			url : '/skills',
			success : function (data) {
				setUpCubes(data.skills, $('.skillstage'), -35, 'skills', function () {
					skills_done = true;
					checkComplete();
				});
			},
			error : function (err) {
				console.log('error');
				console.log(err);
			}
		});

		$.ajax({
			method : "GET",
			url : '/contact',
			success : function (data) {
				setUpCubes(data.contact, $('.skillstage'), -5, 'contact', function () {
					contacts_done = true;
					checkComplete();
				});
			},
			error : function (err) {
				console.log('error');
				console.log(err);
			}
		});

		looper();
	};

	//cube_controller.init();

	return cube_controller;

}(jQuery));