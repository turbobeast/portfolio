var CIRCLE_CANVAS = (function () {
	var cc = {},
	canvas = document.getElementById('circlecanvas'),
	context = canvas.getContext('2d'),
	totalCircles = 50,
	width = window.innerWidth,
	height = window.innerHeight,
	mouseX = 0,
	mouseY = 0,
	circles = [],
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

	canvas.width = width;
	canvas.height = height;

	function drawCircle (circ) {
		context.strokeStyle = 'rgba(170,30,20,0.3)';
		context.beginPath();
		context.arc(circ.x, circ.y, circ.rad, 0 , Math.PI * 2, false);
		context.stroke();
	}

	function circleMaker (num) {
		return {
			x : width * 0.5,
			y : height * 0.5,
			num : num,
			rad : (num * 2) 
		};
	}

	function createCircles () {
		var i = 0;
		for(i =0; i < totalCircles; i += 1) {
			circles.push(circleMaker(i));
		}
	}

	function updateCircles () {
		var nextCirc,
		firstCirc = circles[circles.length-1];

		firstCirc.x += ( mouseX - firstCirc.x) * 0.1;
		firstCirc.y += ( mouseY - firstCirc.y) * 0.1;

		for(i = circles.length-2; i > 0; i -= 1) {

			circles[i].x += ( circles[i+1].x - circles[i].x) * 0.6;// * (circles[i].rad /8);
			circles[i].y += ( circles[i+1].y - circles[i].y) * 0.6;// * (circles[i].rad /8);

		}
	}

	function drawCircles () {
		context.clearRect(0,0,width, height);
		var i = 0;
		for(i =0; i < circles.length; i += 1) {
			drawCircle(circles[i]);
		}
	}


	function looper () {
		updateCircles();
		drawCircles();
		animFrame(looper);
	}

	window.addEventListener('mousemove', function (evt) {
		var e = evt || window.event;
		if(e.touches) {
			touch = e.touches[0] || e.changedTouches[0];
			mouseX = touch.pageX;
			mouseY = touch.pageY;
		} else {
			mouseX = e.pageX;
			mouseY = e.pageY;
		}
	}, false);

	createCircles();
	looper();

	return cc;
}());