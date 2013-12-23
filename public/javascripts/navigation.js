var TURBOBEAST_NAVIGATION = (function ($) {
	var nav = {},
	supportsHist = (function(){
		return !! (window.history && window.history.pushState);
	}()),
	started = false,
	busyAddingNew = false,
	busyRemovingOld = false,
	pageGhosts = {},
	$stage = $('.skillstage'),
	currentPageName = 'home',
	$links = $('nav a'),
	pageEnterHandlers;

	function callHandlers () {
		var i = 0;
		for(i = 0; i < pageEnterHandlers.length; i += 1) {
			pageEnterHandlers[i]();
		}
	}

	function handlePageData (data, template, pagename) {
		TURBOBEAST_RENDERER.render(template, $stage, data[pagename], function (ghosts) {
			var i = 0,
			cb = null;
			for(i = 0; i < ghosts.length; i += 1) {
				if(i === ghosts.length-1) {
					cb = function () {
						busyAddingNew = false;
					}
				}
				TURBOBEAST_CUBES.makeCubeProper(ghosts[i].slug, ghosts[i].elem, $stage.offset().top, cb);
			}

			pageGhosts[pagename] = ghosts;
		});
	}

	function handlePageExit (pagename) {
		var i = 0,
		cb = null;

		if(!pageGhosts[pagename]) return;

		busyRemovingOld = true;
		for(i = 0; i < pageGhosts[pagename].length; i+= 1) {
			pageGhosts[pagename][i].elem.remove();
			if(i === pageGhosts[pagename].length-1) {
				cb = function () {
					busyRemovingOld = false;
				};
			} 
			TURBOBEAST_CUBES.makeCubeFloater(pageGhosts[pagename][i].slug, cb);
		}

		pageGhosts[pagename] = [];
	}

	function switchPage (pagename) {

		var template, templateIdString = "#" + pagename + 'template';

		if(pagename === currentPageName) {
			return;
		}

		if(busyRemovingOld || busyAddingNew) return;

		busyAddingNew = true;

		handlePageExit(currentPageName);

		template = $.trim($(templateIdString).html());

		$.ajax({
			method : "GET",
			url : '/' + pagename,
			success : function (data) {
				$links.each(function () {
					if($(this).data('page') == pagename) {
						$(this).addClass('current');
					} else {
						$(this).removeClass('current');
					}
				});
				handlePageData(data, template, pagename);
			},
			error : function (err) {
				console.log('error');
				console.log(err);
			}
		});

		if(supportsHist){
			window.history.pushState(null, pagename, '/#!/' + pagename);
		}

		currentPageName = pagename;
	}

	nav.handleResize = function () {

		var i = 0, ghosts;
		if(!pageGhosts[currentPageName]) return;

		ghosts = pageGhosts[currentPageName];

		for(i = 0; i < ghosts.length; i+= 1) {
			TURBOBEAST_CUBES.resizeProperCube(ghosts[i].slug, ghosts[i].elem, $stage.offset().top);
		}

	};

	$links.each( function () { 
		$(this).bind('click', function(e) {
			e.preventDefault();
			switchPage($(this).data('page'));
		});
	});

	$('.aboutlink').bind('click', function (e) {
		e.preventDefault();
		switchPage($(this).data('page'));

	});

	function switchRelay () {
		if(!started) return;
		var urlAppendage = window.location.href.split('/').pop() || 'about';
		switchPage(urlAppendage);
	}

	nav.start = function () {
		started = true;
		switchRelay();
	};

	window.onpopstate = function () {
		switchRelay();
	}

	return nav;

}(jQuery));