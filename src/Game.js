var app = new PIXI.Application(800, 600, { antialias: true, backgroundColor: 0x111111 });
var phys = new VerletPhysics();
var game = new Game();

function Game() {
	var self = this;	
	var player;			
	var input = new InputControl();
	var sorterManager = new SorterZManager();
	var bulletManager = new BulletManager();
	var backLayer = new PIXI.Container();
	var gameLayer = new PIXI.Container();

	this.sorterManager = sorterManager;
	this.bulletManager = bulletManager;	
	var factory = new Factory(this);

	app.stage.addChild(backLayer);	
	app.stage.addChild(gameLayer);	
		
	function update(dt) {
		phys.update();
		sorterManager.update();
		bulletManager.update();
		playerControl();
	}

	function initGame() {
		initPlayer();
		createLevel();		
		app.ticker.add(update);	
	}

	function initPlayer() {
		player = new Player(100,150,{mass:5,friction:0.85});
		player.speed = .3;
		gameLayer.addChild(player.sprite);
		sorterManager.add(player);
		self.player = player;
	}

	function createLevel() {	
		factory.interior.floor(0,0,205,330,0x68914a,backLayer);
		factory.interior.floor(205,0,195,330,0xb44346,backLayer);

		factory.interior.wall(0,0,400,0,gameLayer);
		factory.interior.wall(0,10,0,300,gameLayer);
		factory.interior.wall(390,10,0,300,gameLayer);
		factory.interior.wall(200,10,0,100,gameLayer);
		factory.interior.wall(200,170,0,130,gameLayer);
		factory.interior.wall(0,300,275,0,gameLayer);
		factory.interior.wall(325,300,75,0,gameLayer);

		factory.enemy.crab(300,150,gameLayer);

		/*createFloor(0,0,205,330,0x68914a);
		createFloor(205,0,195,330,0xb44346);

		createWall(0,0,400,0);
		createWall(0,10,0,300);
		createWall(390,10,0,300);
		createWall(200,10,0,100);
		createWall(200,170,0,130);
		createWall(0,300,275,0);
		createWall(325,300,75,0);

		createStuff(43,40,'assets/stuff/table2.png', {rx:30, ry:7.5, mass:8, friction:0.9});
		createStuff(105,40,'assets/stuff/table2.png', {rx:30, ry:7.5, mass:8, friction:0.9});
		createStuff(167,40,'assets/stuff/table2.png', {rx:30, ry:7.5, mass:8, friction:0.9});
		createStuff(43,200,'assets/stuff/table2.png', {rx:30, ry:7.5, mass:8, friction:0.9});
		createStuff(167,200,'assets/stuff/table2.png', {rx:30, ry:7.5, mass:8, friction:0.9});
		createStuff(45,58,'assets/stuff/stool1.png',  {rx:7.5, ry:8, mass:2, friction:0.97, hit:{x:0,y:-6,rx:7.5,ry:12}});
		createStuff(107,60,'assets/stuff/stool1.png', {rx:7.5, ry:8, mass:2, friction:0.97, hit:{x:0,y:-6,rx:7.5,ry:12}});
		createStuff(170,58,'assets/stuff/stool1.png', {rx:7.5, ry:8, mass:2, friction:0.97, hit:{x:0,y:-6,rx:7.5,ry:12}});
		createStuff(195+50,45,'assets/stuff/couch.png', {ay:0.65, rx:30, ry:10, mass:25, friction:0.8, hit:{x:0,y:-15,rx:25,ry:10}});
		createStuff(195+160,45,'assets/stuff/couch.png', {ay:0.65, rx:30, ry:10, mass:25, friction:0.8, hit:{x:0,y:-15,rx:25,ry:10}});
		createStuff(195+105,45,'assets/stuff/table3.png', {rx:15, ry:10, mass:4, friction:0.9});

		createEnemyCrab(300,150);*/
	}

	function playerControl() {
		var dx = input.mouse.x - player.sprite.x;
		var dy = input.mouse.y - player.sprite.y;
		var sx = dx/Math.abs(dx) || 1;

		player.gun.sprite.rotation = Math.atan2(dy,dx) * sx;
		player.gun.sprite.scale.set(sx,sx);
		player.gun.reloadTime++;
		player.sprite.scale.set(sx,1);

		if (input.keys.left) player.body.x -= player.speed;
		if (input.keys.up) player.body.y -= player.speed;
		if (input.keys.right) player.body.x += player.speed;
		if (input.keys.down) player.body.y += player.speed;
		if (input.mouse.left) {
			var bullet = player.fire(input.mouse);
			if (bullet) {
				bulletManager.add(bullet);
				gameLayer.addChild(bullet.sprite);
			}			
		}		

		if (player.animation.name == 'frontWalk' && dy < 0) {
			player.setAnimation('backWalk');
			player.sprite.setChildIndex(player.gun.sprite, 0); 
		} 
		if (player.animation.name == 'backWalk' && dy > 0) {
			player.setAnimation('frontWalk');
			player.sprite.setChildIndex(player.gun.sprite, 1);
		}
		if (input.anyKeyPress) {
			player.animation.play();
		} else {
			player.animation.gotoAndStop(2);
		}		
	}

	function createFloor(x,y,w,h,color) {
		var floor = new Floor(x,y,w,h,color);
		backLayer.addChild(floor.sprite);
		return floor;
	}

	function createWall(x,y,w,h) {
		var wall = new Wall(x,y,w,h);
		gameLayer.addChild(wall.sprite);
		sorterManager.add(wall);
		bulletManager.add(wall);
		return wall;		
	}

	function createStuff(x,y,image,props) {
		var stuff = new Stuff(x,y,image,props);
		gameLayer.addChild(stuff.sprite);
		sorterManager.add(stuff);
		if (stuff.hitArea) bulletManager.add(stuff);
		return stuff;		
	}
	
	initGame();
}