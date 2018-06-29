var app = new PIXI.Application(800, 600, { antialias: true, backgroundColor: 0x111111 });
var phys = new VerletPhysics();
var game = new Game();

function Game() {
	var self = this;	
	var player;			
	var input = new InputControl();
	var sorterManager = new SorterZManager();
	var bulletManager = new BulletManager();
	var timeManager = new TimeManager(app);
	var backLayer = new PIXI.Container();
	var gameLayer = new PIXI.Container();

	this.sorterManager = sorterManager;
	this.bulletManager = bulletManager;	
	this.timeManager = timeManager;	
	var factory = new Factory(this);

	app.stage.addChild(backLayer);	
	app.stage.addChild(gameLayer);

	function initGame() {
		initPlayer();
		createLevel();
		timeManager.add(phys.update);
		timeManager.add(sorterManager.update);
		timeManager.add(bulletManager.update);
		timeManager.add(playerControl);
		timeManager.start();
	}

	function initPlayer() {
		player = new Player(100,150,{mass:5,friction:0.85});
		player.speed = .3;
		gameLayer.addChild(player.sprite);
		sorterManager.add(player);
		self.player = player;
	}

	function createLevel() {
		factory.parent = backLayer;
		factory.interior.floor(0,0,205,380,0x68914a);
		factory.interior.floor(205,0,195,380,0xb44346);
		factory.interior.floor(0,380,600,220,0x78a15a);
		factory.interior.floor(400,0,200,380,0x68914a);

		factory.interior.wall(10,0,'h',600);
		factory.interior.wall(10,350,'h',270);
		factory.interior.wall(330,350,'h',270);
		factory.interior.wall(0,570,'h',600);

		factory.interior.wall(0,0,'v',580);
		factory.interior.wall(200,10,'v',150);
		factory.interior.wall(200,210,'v',150);
		factory.interior.wall(400,10,'v',150);
		factory.interior.wall(400,210,'v',150);
		factory.interior.wall(600,0,'v',580);
		
		factory.parent = gameLayer;
		factory.interior.table(43,40);
		factory.interior.table(105,40);
		factory.interior.table(167,40);
		factory.interior.table(43,250);
		factory.interior.table(167,250);
		factory.interior.table(300,45,'1');

		factory.interior.chair(45,58);
		factory.interior.chair(107,60);
		factory.interior.chair(170,58);

		factory.interior.couch(245,45);
		factory.interior.couch(355,45);

		factory.interior.plant(355,145);

		factory.enemy.crab(300,150);		
	}

	function playerControl() {
		var dx = input.mouse.x - player.sprite.x;
		var dy = input.mouse.y - player.sprite.y;
		var sx = dx/Math.abs(dx) || 1;

		player.gun.sprite.rotation = Math.atan2(dy,dx) * sx;
		player.gun.sprite.scale.set(sx,sx);
		player.gun.reloadTime++;
		player.sprite.scale.set(sx,1);

		var nx = 0;
		var ny = 0;

		if (input.keys.left) nx = -1;
		if (input.keys.up) ny = -1;
		if (input.keys.right) nx = 1;
		if (input.keys.down) ny = 1;

		player.body.x += player.speed * nx / (ny != 0? 1.414 : 1);
		player.body.y += player.speed * ny / (nx != 0? 1.414 : 1);

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
	
	initGame();
}