var confetti = {
	maxCount: 150,		//set max confetti count
	speed: 2,			//set the particle animation speed
	frameInterval: 15,	//the confetti animation frame interval in milliseconds
	alpha: 1.0,			//the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
	gradient: false,	//whether to use gradients for the confetti particles
	start: null,		//call to start confetti animation (with optional timeout in milliseconds, and optional min and max random confetti count)
	stop: null,			//call to stop adding confetti
	toggle: null,		//call to start or stop the confetti animation depending on whether it's already running
	pause: null,		//call to freeze confetti animation
	resume: null,		//call to unfreeze confetti animation
	togglePause: null,	//call to toggle whether the confetti animation is paused
	remove: null,		//call to stop the confetti animation and remove all confetti immediately
	isPaused: null,		//call and returns true or false depending on whether the confetti animation is paused
	isRunning: null		//call and returns true or false depending on whether the animation is running
};

(function() {
	confetti.start = startConfetti;
	confetti.stop = stopConfetti;
	confetti.toggle = toggleConfetti;
	confetti.pause = pauseConfetti;
	confetti.resume = resumeConfetti;
	confetti.togglePause = toggleConfettiPause;
	confetti.isPaused = isConfettiPaused;
	confetti.remove = removeConfetti;
	confetti.isRunning = isConfettiRunning;
	var supportsAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	var colors = ["rgba(30,144,255,", "rgba(107,142,35,", "rgba(255,215,0,", "rgba(255,192,203,", "rgba(106,90,205,", "rgba(173,216,230,", "rgba(238,130,238,", "rgba(152,251,152,", "rgba(70,130,180,", "rgba(244,164,96,", "rgba(210,105,30,", "rgba(220,20,60,"];
	var streamingConfetti = false;
	var animationTimer = null;
	var pause = false;
	var lastFrameTime = Date.now();
	var particles = [];
	var waveAngle = 0;
	var context = null;

	function resetParticle(particle, width, height) {
		particle.color = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.color2 = colors[(Math.random() * colors.length) | 0] + (confetti.alpha + ")");
		particle.x = Math.random() * width;
		particle.y = Math.random() * height - height;
		particle.diameter = Math.random() * 10 + 5;
		particle.tilt = Math.random() * 10 - 10;
		particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
		particle.tiltAngle = Math.random() * Math.PI;
		return particle;
	}

	function toggleConfettiPause() {
		if (pause)
			resumeConfetti();
		else
			pauseConfetti();
	}

	function isConfettiPaused() {
		return pause;
	}

	function pauseConfetti() {
		pause = true;
	}

	function resumeConfetti() {
		pause = false;
		runAnimation();
	}

	function runAnimation() {
		if (pause)
			return;
		else if (particles.length === 0) {
			context.clearRect(0, 0, window.innerWidth, window.innerHeight);
			animationTimer = null;
		} else {
			var now = Date.now();
			var delta = now - lastFrameTime;
			if (!supportsAnimationFrame || delta > confetti.frameInterval) {
				context.clearRect(0, 0, window.innerWidth, window.innerHeight);
				updateParticles();
				drawParticles(context);
				lastFrameTime = now - (delta % confetti.frameInterval);
			}
			animationTimer = requestAnimationFrame(runAnimation);
		}
	}

	function startConfetti(timeout, min, max) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		window.requestAnimationFrame = (function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					return window.setTimeout(callback, confetti.frameInterval);
				};
		})();
		var canvas = document.getElementById("confetti-canvas");
		if (canvas === null) {
			canvas = document.createElement("canvas");
			canvas.setAttribute("id", "confetti-canvas");
			canvas.setAttribute("style", "display:block;z-index:999999;pointer-events:none;position:fixed;top:0");
			document.body.prepend(canvas);
			canvas.width = width;
			canvas.height = height;
			window.addEventListener("resize", function() {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}, true);
			context = canvas.getContext("2d");
		} else if (context === null)
			context = canvas.getContext("2d");
		var count = confetti.maxCount;
		if (min) {
			if (max) {
				if (min == max)
					count = particles.length + max;
				else {
					if (min > max) {
						var temp = min;
						min = max;
						max = temp;
					}
					count = particles.length + ((Math.random() * (max - min) + min) | 0);
				}
			} else
				count = particles.length + min;
		} else if (max)
			count = particles.length + max;
		while (particles.length < count)
			particles.push(resetParticle({}, width, height));
		streamingConfetti = true;
		pause = false;
		runAnimation();
		if (timeout) {
			window.setTimeout(stopConfetti, timeout);
		}
	}

	function stopConfetti() {
		streamingConfetti = false;
	}

	function removeConfetti() {
		stop();
		pause = false;
		particles = [];
	}

	function toggleConfetti() {
		if (streamingConfetti)
			stopConfetti();
		else
			startConfetti();
	}
	
	function isConfettiRunning() {
		return streamingConfetti;
	}

	function drawParticles(context) {
		var particle;
		var x, y, x2, y2;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			context.beginPath();
			context.lineWidth = particle.diameter;
			x2 = particle.x + particle.tilt;
			x = x2 + particle.diameter / 2;
			y2 = particle.y + particle.tilt + particle.diameter / 2;
			if (confetti.gradient) {
				var gradient = context.createLinearGradient(x, particle.y, x2, y2);
				gradient.addColorStop("0", particle.color);
				gradient.addColorStop("1.0", particle.color2);
				context.strokeStyle = gradient;
			} else
				context.strokeStyle = particle.color;
			context.moveTo(x, particle.y);
			context.lineTo(x2, y2);
			context.stroke();
		}
	}

	function updateParticles() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var particle;
		waveAngle += 0.01;
		for (var i = 0; i < particles.length; i++) {
			particle = particles[i];
			if (!streamingConfetti && particle.y < -15)
				particle.y = height + 100;
			else {
				particle.tiltAngle += particle.tiltAngleIncrement;
				particle.x += Math.sin(waveAngle) - 0.5;
				particle.y += (Math.cos(waveAngle) + particle.diameter + confetti.speed) * 0.5;
				particle.tilt = Math.sin(particle.tiltAngle) * 15;
			}
			if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
				if (streamingConfetti && particles.length <= confetti.maxCount)
					resetParticle(particle, width, height);
				else {
					particles.splice(i, 1);
					i--;
				}
			}
		}
	}
})();

const start_conf = () => {
            setTimeout(function() {
                confetti.start()
            }, 500); // 1000 is time that after 1 second start the confetti ( 1000 = 1 sec)
        };

        //  for stopping the confetti 

        const stop_conf = () => {
            setTimeout(function() {
                confetti.stop()
            }, 5000); // 5000 is time that after 5 second stop the confetti ( 5000 = 5 sec)
        };
// after this here we are calling both the function so it works
        


var nr = 0;

var video_id = 0;
var hint_id = 0;
var seconds = 5;

var hints;
var place_form;
var pass_form;
var title_div;

const secrets = {
	1: {
		"titlu": "Welcome! Ghicește locul secret și găsește parola",
		"type": "place",
		"video_url": "https://www.youtube.com/embed/yZFA92L0-bM",
		"hints": ["E un loc în care nu prea îți place să mergi","În camera la fiică-ta","Pe perete, sub un sticker galben"],
		"pass": "copilarie",
		"pass2": ""
	},
	2: {
		"titlu": "Ghicește locul secret și găsește parola",
		"type": "place",
		"video_url": "https://www.youtube.com/embed/A9rZUwe5jPQ",
		"hints": ["L-ai primit cadou","E pe un perete","E un tablou cu un copac"],
		"pass": "dragoste",
		"pass2": ""
	},
	3: {
		"titlu": "Ghicește compozitorul",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/8lRYzhOPi8w",
		"hints": ["Nu e faimos, ha ha","Locuiește la mare","Hai măi, nu îi știi numele iubitului tău?"],
		"pass": "andu",
		"pass2": "iubitul meu"
	},
	4: {
		"titlu": "Ghicește cuvântul secret",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/r-Y72jmUPFg",
		"hints": ["Era seara pe Diva parcă","Orașul se numește Stars Hollow","Pe fată o cheama Rory"],
		"pass": "lorelai",
		"pass2": ""
	},
	5: {
		"titlu": "Ghicește locul secret și găsește parola",
		"type": "place",
		"video_url": "https://www.youtube.com/embed/30kSWRMb5pM",
		"hints": ["L-ai primit cadou","Probabil e încă în bucătărie","Are o hartă a stelelor"],
		"pass": "forever young",
		"pass2": ""
	},
	6: {
		"titlu": "Ghicește cuvintele secrete",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/5vBE-HdErxk",
		"hints": ["Hai că știi, e vineri seara","...Prezintă Bartoș","Sunt dezamăgită... Are logo cu o mână?..."],
		"pass": "vocea romaniei",
		"pass2": ""
	},
	7: {
		"titlu": "Ghicește locul secret și găsește parola",
		"type": "place",
		"video_url": "https://www.youtube.com/embed/_R8Z23L2_EY",
		"hints": ["Device-uri la care cântăm","Sunt undeva în living","Sub televizor, cutia cu microfoane"],
		"pass": "karaoke",
		"pass2": ""
	},
	8: {
		"titlu": "Ghicește titlul melodiei",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/7dDisIHAlrk",
		"hints": ["A apărut în 2012","Are o coregrafie în care „călărești”","Începe cu `G...  S...`"],
		"pass": "gangnam style",
		"pass2": "gagnam style"
	},
	9: {
		"titlu": "Ghicește cuvântul secret",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/47G49RfrVyA",
		"hints": ["Copii + părinți + bunici = ?","Laitmotivul din Fast and Furious","Puya - Suntem o mare ..., ne-avem ca frații,"],
		"pass": "familie",
		"pass2": "familia"
	},
	10: {
		"titlu": "Ghicește cuvântul secret",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/Fj9m1chBLwo",
		"hints": ["Botez, nuntă, etc.","Este și un film faimos cu numele ăsta","În engleză, ...”Dumnezeu-pârinți”"],
		"pass": "nasi",
		"pass2": "nasii"
	},
	11: {
		"titlu": "Ghicește cuvântul secret",
		"type": "pass",
		"video_url": "https://youtube.com/embed/2UPR5fhJf88",
		"hints": ["Membru al familiei","Are acceași mamă ca și tine","F...."],
		"pass": "frate",
		"pass2": "florin"
	},
	12: {
		"titlu": "Ghicește cuvântul lipsă",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/lc0z3_kB0cQ",
		"hints": ["Nu-ți dau hint-uri la asta","Degeaba încerci","s....u...."],
		"pass": "sufletul",
		"pass2": "suflet"
	},
	13: {
		"titlu": "Ghicește locul secret și găsește parola",
		"type": "place",
		"video_url": "https://www.youtube.com/embed/YgoeZn9qsQg",
		"hints": ["Îți plac grupurile/concertele/petrecerile de genul","O ai undeva în curte","Uită-te bine la motocicletă"],
		"pass": "iris",
		"pass2": ""
	},
	14: {
		"titlu": "Take a break! Parola e MATI",
		"type": "pass",
		"video_url": "https://www.youtube.com/embed/Xa7qKJ_PnaU",
		"hints": ["MATI","M A T I","MAAATIIIII"],
		"pass": "mati",
		"pass2": "matei"
	},
	15: {
		"titlu": "Felicitări! One last thing...",
		"type": "final",
		"video_url": "https://www.youtube.com/embed/emR3u8bsBjg"
	}
};

function instructions()
{
	var instr = document.getElementById("instr");
	console.log(instr.style.visibility);
	var vis = instr.style.visibility;
	if(vis == "visible")
	{
		instr.style.visibility = "hidden";
	}
	else
	{
		instr.style.visibility = "visible";
	}
};

function load_video()
{
	video_id = getVideoIdFromUrl();
	
	var videoframe = document.getElementById("video_frame");
	videoframe.src = secrets[video_id].video_url;
	
	hints = document.getElementById("hint");
	place_form = document.getElementById("place-form");
	pass_form = document.getElementById("pass-form");
	title_div = document.getElementById("titlu-mare");
	title_div.innerHTML = secrets[video_id].titlu;
	
	if(secrets[video_id].type == "pass")
	{
		place_form.style.display = 'none';
		pass_form.style.display = 'block';
	}
	else if(secrets[video_id].type == "place")
	{
		place_form.style.display = 'block';
		pass_form.style.display = 'none';
	}
	else
	{
		place_form.style.display = 'none';
		pass_form.style.display = 'none';
	}
};

function show_pass()
{
	place_form.style.display = 'none';
	pass_form.style.display = 'block';
};


function getVideoIdFromUrl()
{
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const video_id = urlParams.get('video_id')
	return video_id;
};

function getVideoIdFromUrl()
{
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const video_id = urlParams.get('video_id')
	return video_id;
};

function congrats()
{
	seconds--;
	if(seconds > 0)
	{
		hints.innerHTML = 'Felicitări! Următoarea pagină în ' + seconds.toString() + ' secunde!';
	}
	else
	{
		clearInterval();
		video_id++;
		window.location.href = window.location.href.split('?')[0] + '?video_id=' + video_id.toString();
	}
};

function hint()
{
	if(hint_id < 3)
	{
		hints.innerHTML = secrets[video_id].hints[hint_id];
		hint_id++;
	}
	else
	{
		hints.innerHTML = "Parola este " + secrets[video_id].pass;
	}
	hints.style.display = "block";
};

function getPassword(pass)
{
	var result = pass.toLowerCase();
	result = result.replace("ș", "s");
	result = result.replace("ț", "t");
	result = result.replace("ă", "a");
	result = result.replace("â", "a");
	result = result.replace("î", "i");
	return result;
};

function guess()
{
	var pass = getPassword(document.getElementById("pass").value);
	if(pass.trim().length != 0)
	{
		if(secrets[video_id].pass == pass || secrets[video_id].pass2 == pass)
		{
			hints.innerHTML = 'Felicitări! Următoarea pagină în ' + seconds.toString() + ' secunde!';
			hints.style.display = "block";
			var t=setInterval(congrats, 1000);
			
			start_conf();
			stop_conf();
		}
		else
		{
			hints.innerHTML = 'Incorect :( Apasă pe HINT dacă ai nevoie de ajutor!';
			hints.style.display = "block";
		}
	}
};

function start()
{
	var pass = document.getElementById("pass").value.toLowerCase();
	var incorrect = document.getElementById("incorrect");
	incorrect.innerHTML = "Încearcă din nou :)";
	
	if(pass == "unicorn")
	{
		incorrect.style.display = "none";
		window.location.href = 'video.html?video_id=1';
	}
	else
	{
		nr++;
		
		if(nr >= 2 && nr < 3)
		{
			incorrect.innerHTML = "HINT: animal cu un corn în frunte";
		}
		
		else if(nr >= 3 && nr < 4)
		{
			incorrect.innerHTML = "HINT: primul cuvânt din numele firmei lu' fii-ta";
		}
		
		else if(nr >= 4)
		{
			incorrect.innerHTML = "HINT: ok, ok, parola e UNICORN";
		}
		
		incorrect.style.display = "block";
	}
};