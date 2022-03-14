window.requestAnimFrame = (function(animeLoop) {
	return (window.requestAnimationFrame 		||
		window.webkitRequestAnimationFrame 	||
		window.mozRequestAnimationFrame 	||
		window.oRequestAnimationFrame 		||
		window.msRequestAnimationFrame 		||
		function (callback) {
			return window.setTimeout(callback(), 1000 / 60);
	});
})();
window.cancelRequestAnimFrame = (function() {
	return (window.cancelAnimationFrame 			||
		window.webkitCancelRequestAnimationFrame 	||
		window.mozCancelRequestAnimationFrame 		||
		window.oCancelRequestAnimationFrame 		||
		window.msCancelRequestAnimationFrame 		||
		clearTimeout);
})();

let	canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	height = 600,
 	width = 800,
	H = window.innerHeight,
	W = window.innerWidth,
	startBtn = {},
	restartBtn = {},
	mouse = {},
	viewfinder = {},
	viewNormal = new Image(),
	viewRed = new Image(),
	background = {},
	title = {},
	shadow = {},
	player = {},
	ball = {},
	wall = [],
	furniture = [],
	up, down, left, right,
	point = 0,
	life = 100,
	lvl = 0,
	particule = {},
	particuleCount = 20,
	over = 0,
	init;

canvas.addEventListener("mousemove", trackPosition, true);
canvas.addEventListener("mousedown", click, true);
canvas.addEventListener("mouseup", function() { if (lvl != 0) player.shot = false; }, true);
window.onkeydown = KeyDown;
window.onkeyup = KeyUp;

canvas.height = height;
canvas.width = width;

walls = [
	[{w: 1580, h: 14, x: 10, y: 10}, {w: 14, h: 1180, x: 10, y: 10},
	{w: 1580, h: 14, x: 10, y: 1176}, {w: 14, h: 1180, x: 1576, y: 10},
	{w: 128, h: 14, x: 24, y: 422}, {w: 224, h: 14, x: 312, y: 422},
	{w: 14, h: 408, x: 526, y: 24}, {w: 14, h: 608, x: 528, y: 568},
	{w: 128, h: 14, x: 24, y: 564}, {w: 224, h: 14, x: 314, y: 564},
	{w: 26, h: 26, x: 1150, y: 630}, {w: 14, h: 44, x: 1156, y: 1146}]
];
furnitures = [
	[{w: 268, h: 90, x: 32, y: 42}, {w: 34, h: 110, x: 24, y: 184},
	{w: 76, h: 32, x: 426, y: 30}, {w: 78, h: 160, x: 448, y: 262},
	{w: 200, h: 266, x: 174, y: 910}, {w: 82, h: 70, x: 66, y: 1096},
	{w: 82, h: 70, x: 400, y: 1096}, {w: 224, h: 390, x: 710, y: 660},
	{w: 76, h: 38, x: 784, y: 622}, {w: 214, h: 74, x: 314, y: 576},
	{w: 32, h: 76, x: 678, y: 682}, {w: 20, h: 76, x: 690, y: 774},
	{w: 24, h: 76, x: 686, y: 864}, {w: 24, h: 76, x: 686, y: 948},
	{w: 22, h: 76, x: 934, y: 698}, {w: 32, h: 76, x: 934, y: 786},
	{w: 20, h: 76, x: 934, y: 878}, {w: 24, h: 76, x: 934, y: 962},
	{w: 74, h: 338, x: 1126, y: 818}, {w: 110, h: 304, x: 1466, y: 872},
	{w: 120, h: 128, x: 1320, y: 1046}, {w: 102, h: 96, x: 1474, y: 772},
	{w: 181, h: 129, x: 578, y: 30}, {w: 317, h: 130, x: 756, y: 305},
	{w: 59, h: 59, x: 1056, y: 39}, {w: 87, h: 64, x: 354, y: 653}]
];

player = {
	w: 110, h: 92, x: (width / 2), y: (height / 2), speed: 8,
	img: new Image(),
	top: {
		a: 0,
		index: 0,
		locat: [{x: 0, y: 0}, {x: 0, y: 92}, {x: 0, y: 184}, {x: 0, y: 276}, {x: 0, y: 92},{x: 0, y: 368}, {x: 0, y: 460}, {x: 0, y: 552}],
	},
	bottom: {
		a: 0,
		index: 0,
		locat: [{x: 110, y: 0}, {x: 110, y: 92}, {x: 110, y: 184}, {x: 110, y: 276},{x: 110, y: 368}, {x: 110, y: 460}, {x: 110, y: 552}]
	},
	move: false, shot: false, tmp: 0,
	direction: {up: false, down: false, left: false, right: false},
	collision: {up: false, down: false, left: false, right: false},
	draw: function() {
		//bottom
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.bottom.a);
		ctx.drawImage(this.img, this.bottom.locat[this.bottom.index].x, this.bottom.locat[this.bottom.index].y, this.w, this.h, -(this.w / 2), -(this.h / 2), this.w, this.h);
		ctx.restore();
		//Top
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.top.a);
		if (this.shot) ctx.drawImage(this.img, this.top.locat[7].x, this.top.locat[7].y, this.w, this.h, -(this.w / 2), -(this.h / 2), this.w, this.h);
		else ctx.drawImage(this.img, this.top.locat[this.top.index].x, this.top.locat[this.top.index].y, this.w, this.h, -(this.w / 2), -(this.h / 2), this.w, this.h);
		ctx.restore();
	}
};

title = {
	index: 0, tmp: 0, img: [new Image(), new Image()],
	draw: function() {
		ctx.save();
		ctx.drawImage(this.img[this.index], 0, 0);
		ctx.restore();
	}
};

background = {
	lvl: [
		{w: 800, h: 600, x: 0, y: 0, img: new Image()},
		{w: 1600, h: 1200, x: 0, y: 0, img: new Image()}
	],
	draw: function() {
		ctx.save();
		ctx.drawImage(this.lvl[lvl].img, this.lvl[lvl].x, this.lvl[lvl].y);
		ctx.restore();
	}
};

shadow = {
	lvl: [
		{w: 1600, h: 1200, x: 0, y: 0, img: new Image()}
	],
	draw: function() {
		ctx.save();
		if (lvl != 0) ctx.drawImage(this.lvl[lvl - 1].img, this.lvl[lvl - 1].x, this.lvl[lvl - 1].y);
		ctx.restore();
	}
};

viewfinder = {
	w: 21, h: 21, x: (W / 2) - (width / 2), y: (H / 2) - (height / 2),
	draw: function() {
		ctx.save();
		ctx.drawImage(viewNormal, this.x - 10, this.y - 10);
		ctx.restore();
	}
};

player.img.src = "sprite/player_all_sprite.png";
title.img[0].src = "sprite/title_1.png";
title.img[1].src = "sprite/title_2.png";
title.img[0].src = "sprite/title_1.png";
title.img[1].src = "sprite/title_2.png";
background.lvl[0].img.src = "sprite/background_main.png";
background.lvl[1].img.src = "sprite/background_lvl_01.png";
shadow.lvl[0].img.src = "sprite/shadow_lvl_01.png";
viewNormal.src = "sprite/viewfinder.png";
viewRed.src = "sprite/viewfinder_red.png";

particule = {
	count: 20, tab: [],
	draw: function() {
		for (let i = 0; this.tab[i]; i++) {
			ctx.save();
			ctx.fillStyle = "#fbdd8d";
			if (this.tab[i].a > 0) ctx.arc(this.tab[i].x, this.tab[i].y, this.tab[i].a, 0, Math.PI * 2, false);
			ctx.restore();
			this.tab[i].x = this.tab[i].vx;
			this.tab[i].y = this.tab[i].vy;
			this.tab[i].a = Math.max(this.tab[i].a - 0.05, 0.0);
		}
	}
};

ball = {
	w: 15, h: 2, tab: [],
	draw: function() {
		for (let i = 0; this.tab[i]; i++) {
			ctx.save();
			if (collide(this.tab[i], wall) == false) {
				ctx.translate(this.tab[i].x, this.tab[i].y);
				ctx.rotate(this.tab[i].a);
				ctx.fillStyle = "#fbdd8d";
				ctx.fillRect(player.w / 2, 32, this.w, this.h);
			}
			ctx.restore();
		}
	}
};

startBtn = {
	w:  100, h: 40, x: (width / 2 - 50), y: (height / 2 - 25),
	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "20px arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseligne = "middle";
		ctx.fillStyle = "#fff";
		ctx.fillText("Start", (width / 2), (height / 2));
		ctx.restore();
	}
};
restartBtn = {
	w: 100, h: 50, x: (width / 2 - 50), y: (height / 2 - 50),
	draw: function() {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = "2";
		ctx.strokeRect(this.x, this.y, this.w, this.h);
		ctx.font = "20px arial,sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStlye = "#fff";
		ctx.fillText("Restart", (width / 2), (height / 2 - 25));
		ctx.restore();
	}
};

function playerDisplacement() {
	let	right = false,
		left = false,
		up = false,
		down = false,
		back =false;

	if (player.direction.right && !player.collision.right) {
		if ((background.lvl[lvl].x + background.lvl[lvl].w == width) || (player.x != width / 2))
			player.x += player.speed;
		else {
			background.lvl[lvl].x -= player.speed;
			shadow.lvl[lvl - 1].x -= player.speed;
			for (let i = 0; walls[0][i]; i++) walls[0][i].x -= player.speed;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].x -= player.speed;
			for (let i = 0; ball.tab[i]; i++) ball.tab[i].x -= player.speed;
		}
		right = true;
	}
	if (player.direction.left && !player.collision.left) {
		if ((background.lvl[lvl].x == 0) || (player.x != width / 2))
			player.x -= player.speed;
		else {
			background.lvl[lvl].x += player.speed;
			shadow.lvl[lvl - 1].x += player.speed;
			for (let i = 0; walls[0][i]; i++) walls[0][i].x += player.speed;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].x += player.speed;
			for (let i = 0; ball.tab[i]; i++) ball.tab[i].x += player.speed;
		}
		left = true;
	}
	if (player.direction.up && !player.collision.up) {
		if ((background.lvl[lvl].y == 0) || (player.y != height / 2))
			player.y -= player.speed;
		else {
			background.lvl[lvl].y += player.speed;
			shadow.lvl[lvl - 1].y += player.speed;
			for (let i = 0; walls[0][i]; i++) walls[0][i].y += player.speed;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].y += player.speed;
			for (let i = 0; ball.tab[i]; i++) ball.tab[i].y += player.speed;
		}
		up = true;
	}
	if (player.direction.down && !player.collision.down) {
		if ((background.lvl[lvl].y + background.lvl[lvl].h == height) || (player.y != height / 2))
			player.y += player.speed;
		else {
			background.lvl[lvl].y -= player.speed;
			shadow.lvl[lvl - 1].y -= player.speed;
			for (let i = 0; walls[0][i]; i++) walls[0][i].y -= player.speed;
			for (let i = 0; furnitures[0][i]; i++) furnitures[0][i].y -= player.speed;
			for (let i = 0; ball.tab[i]; i++) ball.tab[i].y -= player.speed;
		}
		down = true;
	}

	if (right && !left && !up && !down) player.bottom.a = 0;
	if (!right && left && !up && !down) player.bottom.a = 3.141592653589793;
	if (!right && !left && up && !down) player.bottom.a = -1.570796326794897;
	if (!right && !left && !up && down)	player.bottom.a = 1.570796326794897;
	if (right && !left && up && !down) player.bottom.a = -0.785398163397448;
	if (right && !left && !up && down) player.bottom.a = 0.785398163397448;
	if (!right && left && up && !down) player.bottom.a = -2.356194489892345;
	if (!right && left && !up && down) player.bottom.a = 2.356194489892345;
 	if (!right && !left && !up && !down) player.bottom.a = player.top.a;
	if (!(player.bottom.a < player.top.a - 0,7853981633974485)
	&& (player.bottom.a > player.top.a + 0,7853981633974485))
		back = true;
	if (right || left || up || down) {
		if (player.tmp == 7) {
			if (!back) {
				if (player.top.index < 6) player.top.index++;
				else player.top.index = 1;			
				if (player.bottom.index < 6) player.bottom.index++;
				else player.bottom.index = 0;
			}
			else {
				if (player.top.index > 1) player.top.index--;
				else player.top.index = 6;
				if (player.bottom.index > 0) player.bottom.index--;
				else player.bottom.index = 6;
				back = false;
			}
			player.tmp = 0;
		}
		else player.tmp++;
	}
	else {
		player.top.index = 0;
		player.bottom.index = 0;
		player.tmp = 0;
	}
};
function collide(a, b) {
	let index, spd;
	let aX, aY, aW, aH, bX, bY, bW, bH;
	if (a == player) {
		spd = player.speed;
		aX = a.x - (a.w / 2);
		aY = a.y - (a.h / 2);
	}
	else {
		spd = 10;
		aX = a.x + (player.w / 2);
		aY = a.y + 16;
		if ((((aX >= bX) && (aX <= bX + bW)) || ((aX + aW >= bX) && (aX <= bX)))
		&& (((aY >= bY) && (aY <= bY + bH)) || ((aY + aH >= bY) && (aY <= bY))))
			return true;
		else return false;
	}
	aW = a.w;
	aH = a.h;
	if ((b == walls) || (b == furniture)) index = lvl - 1;
	for (let i = 0; b[0][i]; i++) {
		bX = b[0][i].x;
		bY = b[0][i].y;
		bW = b[0][i].w;
		bH = b[0][i].h;
		if (((aX >= bX) && (aX <= (bX + bW))) || (((aX + aW) >= bX) && (aX <= bX))) {
			if ((aY >= (bY + (bH - spd))) && (aY <= (bY + bH))) a.collision.up = true;
			if (((aY + aH) >= bY) && ((aY + aH) <= (bY + spd))) a.collision.down = true;
		}
		if (((aY >= bY) && (aY <= (bY + bH))) || (((aY + aH) >= bY) && (aY <= bY))) {
			if ((aX >= (bX + (bW - spd))) && (aX <= (bX + bW))) a.collision.left = true;
			if (((aX + aW) >= bX) && ((aX + aW) <= (bX + spd))) a.collision.right = true;
		}
	}
};
function resetCollide(a) {
	a.collision.right = false;
	a.collision.left = false;
	a.collision.up = false;
	a.collision.down = false;
};
function wallDraw() {
	ctx.save();
	ctx.fillStyle = "blue";
	for (let i = 0; walls[0][i]; i++) ctx.fillRect(walls[0][i].x, walls[0][i].y, walls[0][i].w, walls[0][i].h);
	ctx.restore();
};
function furnitureDraw() {
	ctx.save();
	ctx.fillStyle = "red";
	for (let i = 0; furnitures[0][i]; i++) ctx.fillRect(furnitures[0][i].x, furnitures[0][i].y, furnitures[0][i].w, furnitures[0][i].h);
	ctx.restore();
};

function draw() {
	background.draw();
	if (lvl != 0){

		player.draw();
		shadow.draw();
		ball.draw();
		viewfinder.draw();
		//wallDraw();
		//furnitureDraw();
	} else {
		startBtn.draw();
		title.draw();
	}
	update();
};

function trackPosition (event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
};

function update() {
	if (lvl != 0) { 
		if (mouse.x && mouse.y) {
			player.top.a = Math.atan2(mouse.y - (((H / 2) - (height / 2)) + player.y), mouse.x - (((W / 2) - (width / 2)) + player.x));
			viewfinder.x = mouse.x - ((W / 2) - (width / 2));
			viewfinder.y = mouse.y - ((H / 2) - (height / 2));
		}
		collide(player, walls);
		collide(player, furnitures);
		playerDisplacement();
		resetCollide(player);
		for (let i = 0; i < 4; i++) player.direction[i] = false;
		for (let i = 0; ball.tab[i]; i++) {
			let vx, vy;
			vx = Math.sin(ball.tab[i].a) * 10;
			vy = Math.cos(ball.tab[i].a) * 10;
			if (!collide(ball.tab[i], walls)) {
				ball.tab[i].x += vy;
				ball.tab[i].y += vx;
			} else {
				ball.tab.splice(i, 1);
			}
		}
		if (life == 0) gameOver();
		updateLife();
	 } else {
		if (title.tmp == 20) {
			if (title.index == 0) title.index = 1;
			else title.index = 0;
			title.tmp = 0;
		}
		else title.tmp++;
	 }
	console.log(player.top.a);
	//console.log(player.bottom.a);
};
function updateScore() {
	ctx.save();
	ctx.fillStyle = "#fff";
	ctx.font = "20px 'btn',arial,sans-serif";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Score: " + point, 20, 20 );
	ctx.restore();
};
function updateLife() {
	let color;
	if (life <= 25) color = "#DC143C";
	else if ((life <= 50) && (life > 25)) color = "#FFD700";
	else color = "#008000";
	ctx.save();
	ctx.strokeStyle = "#ffffff";
	ctx.fillStyle = color;
	ctx.lineWidth = "2";
	ctx.strokeRect(670, 555, 102, 17);
	ctx.fillRect(671, 556, life, 15);
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(650, 554, 19, 19);
	ctx.fillStyle = "#DC143C";
	ctx.fillRect(656, 556, 7, 15);
	ctx.fillRect(652, 560, 15, 7);
	ctx.restore();
};

function click(event) {
	mouse.x = event.pageX;
	mouse.y = event.pageY;
	console.log("mouse X: " + mouse.x + ", mouse Y: " + mouse.y + ",\nHeight: " + H + ", Width: " + W + ",\n viewFinder X: " + viewfinder.x + ", viewFinder Y: " + viewfinder.y);
	if (lvl != 0) {
		ball.tab.push({x: player.x, y: player.y, a: player.top.a});
		player.shot = true;
	} else {
		if ((mouse.x >= ((W / 2) - (startBtn.w / 2)) && mouse.x <= ((W / 2) - (startBtn.w / 2)) + startBtn.w)
		&& (mouse.y >= ((H / 2) - (startBtn.h / 2)) && mouse.y <= ((H / 2) - (startBtn.h / 2)) + startBtn.h)) {
			startBtn = {};
			lvl = 1;
			canvas.style.cursor = "none";
		}
		if (over == 1) {
			if ((mouse.x >= restartBtn.x && mouse.x <= restartBtn.x + restartBtn.w)
			&& (mouse.y >= restartBtn.y && mouse.y <= restartBtn.y + restartBtn.h)) {
				over = 0;
				lvl = 1;
				point = 0;
				life = 100;
			}
		}
	}
};

function animLoop() {
	setTimeout(function() {
		requestAnimFrame(animLoop);
	}, 1000 / 60);
	draw();
} animLoop();

function gameOver() {
	ctx.save();
	ctx.font = "20px 'over',arial,sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseligne = "middle";
	ctx.fillStyle = "#fff";
	ctx.fillText("Game Over - You scored " + point + " points !", (W / 2), (H / 2 + 25));
	ctx.restore();
	cancelRequestAnimFrame(init);
	over = 1;
	restartBtn.draw();
};

KEY_DOWN	= 40;
KEY_UP		= 38;
KEY_LEFT	= 37;
KEY_RIGHT	= 39;
KEY_Z		= 90;
KEY_S		= 83;
KEY_Q		= 81;
KEY_D		= 68;

function CheckEvent(event) {
	if (window.event) return window.event;
	else return event;
};
function KeyDown(event) {
	let WinObject = CheckEvent(event);
	let key = WinObject.keyCode;
	if (lvl != 0) {
		if (key == KEY_RIGHT || key == KEY_D) player.direction.right = true;
		if (key == KEY_LEFT || key == KEY_Q) player.direction.left = true;
		if (key == KEY_UP || key == KEY_Z) player.direction.up = true;
		if (key == KEY_DOWN || key == KEY_S) player.direction.down = true;
	}
};
function KeyUp(event) {
	let WinObject = CheckEvent(event);
	let key = WinObject.keyCode;
	if (lvl != 0) {
		if (key == KEY_RIGHT || key == KEY_D) player.direction.right = false;
		if (key == KEY_LEFT || key == KEY_Q) player.direction.left = false;
		if (key == KEY_UP || key == KEY_Z) player.direction.up = false;
		if (key == KEY_DOWN || key == KEY_S) player.direction.down = false;
	}
};
