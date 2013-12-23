var TURBOBEAST_NAVIGATION = (function ($) {
	'use strict';
	var nav = {},
	supportsHist = (function(){
		return !! (window.history && window.history.pushState);
	}()),
	started = false,
	busyAddingNew = false,
	busyRemovingOld = false,
	pageGhosts = {},
	$stage = $('.skillstage'),
	currentPageName = '',
	$links = $('nav a');

	/*
	* take data returned from ajax call and make ghost/invisible elements
	* add them to the dom
	* send references to the cubes module so proper cubes can be chosen
	* and made to match the layout/flow of the ghost elements
	* set busyAddingnew to false when done, to re-enable nav 
	*/
	function handlePageData (data, template, pagename) {
		TURBOBEAST_RENDERER.render(template, $stage, data[pagename], function (ghosts) {
			var i = 0,
			doneHandler = function () { busyAddingNew = false; },
			cb = null;
			for(i = 0; i < ghosts.length; i += 1) {
				if(i === ghosts.length-1) {
					cb = doneHandler;
				}
				TURBOBEAST_CUBES.makeCubeProper(ghosts[i].slug, ghosts[i].elem, $stage.offset().top, cb);
			}

			pageGhosts[pagename] = ghosts;
		});
	}

	/* 
	* if ghost elements exist 
	* remove them from the dom
	* tell CUBE module to make all chosen cubes floaters again
	* when done set busyRemovingOld to donw to re-enable nav 
	*/
	function handlePageExit (pagename) {
		var i = 0,
		doneHandler = function () { busyRemovingOld = false; },
		cb = null;

		if(!pageGhosts[pagename]) { return; }
		busyRemovingOld = true;

		for(i = 0; i < pageGhosts[pagename].length; i+= 1) {
			pageGhosts[pagename][i].elem.remove();
			if(i === pageGhosts[pagename].length-1) {
				cb = doneHandler;
			} 
			TURBOBEAST_CUBES.makeCubeFloater(pageGhosts[pagename][i].slug, cb);
		}

		pageGhosts[pagename] = [];
	}


	/*
	* fakeout navigation
	* grab data by pagename
	* set up ghosts and cubes
	* add current class to nav link
	* push state 
	*/
	function switchPage (pagename) {
		var template, templateIdString = "#" + pagename + 'template';

		if(pagename === currentPageName) { return; }
		if(busyRemovingOld || busyAddingNew) { return; }

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

	/*
	* resize handler relayed through this module, because this holds the references to the ghost elements
	*/
	nav.handleResize = function () {
		var i = 0, ghosts;
		if(!pageGhosts[currentPageName]) { return; }
		ghosts = pageGhosts[currentPageName];
		for(i = 0; i < ghosts.length; i+= 1) {
			TURBOBEAST_CUBES.resizeProperCube(ghosts[i].slug, ghosts[i].elem, $stage.offset().top);
		}
	};

	/*
	* click handlers for nav buttons
	* the pagename is in the data-page attribute 
	*/
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
		if(!started) { return; }
		var urlAppendage = window.location.href.split('/').pop() || 'about';
		switchPage(urlAppendage);
	}

	/* 
	*	dont hande clicks until the cubes are ready 
	*/
	nav.start = function () {
		started = true;
		switchRelay();
	};

	window.onpopstate = function () {
		switchRelay();
	};

	return nav;

}(jQuery));