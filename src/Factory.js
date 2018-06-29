function Factory(game) {
	var factory = this;
	factory.parent = null;

	factory.enemy = {};
	factory.enemy.crab = function(x,y) {		
		return createEntity({
			display: {x:x, y:y, parent:factory.parent, manager:game.sorterManager},			
			animation: {
				list: [
					{name:'walk', src:'assets/enemies/enemy_robot_crab_walk_', frames:6, speed:0.2, ox:22.5, oy:20, goto:0}
				],
				autoplay: true
			},
			phys: {aabb:[x,y,10,5], friction:0.9, mass:5},
			hit: {aabb: [0,0,10,8], manager:game.bulletManager},
			events: true,
			ai: {target:game.player, manager:game.timeManager},
			debug: {hitArea:false, body:false}
		});		
	}

	factory.interior = {};
	factory.interior.floor = function(x,y,w,h,color) {
		var shape = new PIXI.Graphics();	
		shape.beginFill(color);
		shape.drawRect(0, 0, w, h);		
		return createEntity({
			display: {x:x, y:y, image:shape, parent:factory.parent, cacheAsBitmap:true}
		})
	}

	factory.interior.wall = function(x,y,direction,length) {
		var color_top = 0x0f3044;
		var color_side = 0xeed1a0;
		var wall_height = 20;
		var wall_thick = 10;
		var w = 0;
		var h = 0;

		if (direction == 'h') {
			w = length;			
		} else {			
			h = length;			
		}		

		if (w > h) h += wall_thick;
		if (w < h) w += wall_thick;

		var w2 = w/2;
		var h2 = h/2 + wall_height/2;
		var ax = x + w2;
		var ay = y + h2;

		var shape = new PIXI.Graphics();
		shape.beginFill(color_top);
		shape.drawRect(0, 0, w, h);
		shape.beginFill(color_side);
		shape.drawRect(0, h, w, wall_height);

		return createEntity({
			display: {x:x, y:y, image:shape, parent:factory.parent/*, manager:game.sorterManager*/},
			phys: {aabb:[ax,ay,w2,h2], isStatic:true},
			hit: {aabb:[w2,h2-5,w2,h2-5], manager:game.bulletManager},
			debug: {hit:false, body:false}
		});		
	}

	factory.interior.table = function(x,y,type='0') {
		switch(type) {
			case '0': return createEntity({
				display: {x:x, y:y, ax:0.5, ay:0.5, image:'assets/stuff/table2.png', parent:factory.parent, manager:game.sorterManager},
				phys: {aabb:[x,y,30,7.5], mass:8, friction:0.9},			
				debug: {hit:false, body:false}
			});	

			case '1': return createEntity({
				display: {x:x, y:y, ax:0.5, ay:0.5, image:'assets/stuff/table3.png', parent:factory.parent, manager:game.sorterManager},
				phys: {aabb:[x,y,15,10], mass:4, friction:0.9},			
				debug: {hit:false, body:false}
			});		
		}		
	}

	factory.interior.chair = function(x,y,type='0') {
		switch(type) {
			case '0': return createEntity({
				display: {x:x, y:y, ax:0.5, ay:0.5, image:'assets/stuff/stool1.png', parent:factory.parent, manager:game.sorterManager},
				phys: {aabb:[x,y,7.5,8], mass:2, friction:0.97},	
				hit: {aabb:[0,-6,7.5,12], manager:game.bulletManager},	
				debug: {hit:false, body:false}
			});			
		}		
	}

	factory.interior.couch = function(x,y,type='0') {
		switch(type) {
			case '0': return createEntity({
				display: {x:x, y:y, ax:0.5, ay:0.65, image:'assets/stuff/couch.png', parent:factory.parent, manager:game.sorterManager},
				phys: {aabb:[x,y,30,10], mass:25, friction:0.8},	
				hit: {aabb:[0,-15,25,10], manager:game.bulletManager},	
				debug: {hit:false, body:false}
			});			
		}		
	}

	factory.interior.plant = function(x,y,type='0') {
		switch(type) {
			case '0': return createEntity({
				display: {x:x, y:y, ax:0.5, ay:0.85, image:'assets/stuff/cactus.png', parent:factory.parent, manager:game.sorterManager},
				phys: {aabb:[x,y,8,6], mass:5, friction:0.8},	
				/*hit: {aabb:[0,-15,25,10], manager:game.bulletManager},*/
				debug: {hit:false, body:false}
			});			
		}		
	}
}

/*function Particles(x, y) {
	var particles = [];
	var sprite = new PIXI.Container();
	sprite.x = x;
	sprite.y = y;
	var floor = 20;
	var time = 0;
	var len = parseInt(3 + 3*Math.random());
	for (var i=0; i < len; i++) {
		var part = new PIXI.Graphics();
		var color = parseInt(0xffffff * Math.random());
		part.beginFill(color);
		part.drawRect(-2.5, -2.5, 5, 5);
		part.cacheAsBitmap = true;
		part.x = x;
		part.y = y;
		part.vx = -1 + 2*Math.random();
		part.vy = -1.5 + 3*Math.random();
		sprite.addChild(part);
		particles.push(part);
	}

	app.ticker.add(update);	
	function update() {
		for (var i=0; i < particles.length; i++) {
			var part = particles[i];
			part.x += part.vx;
			part.y += part.vy;
			part.vy += .1;
			if (part.y > floor) {
				part.y = floor;
				part.vx *= 0.5;
				part.vy *= -0.5;				
			}
			part.alpha -= 0.025;
		}
		time++;
		if (time >= 100) {
			// delete this
			sprite.parent.removeChild(sprite);
			app.ticker.remove(update);
		}
	}

	this.sprite = sprite;
}*/

function Player(x,y, props) {	
	props.aabb = new phys.AABB(x, y, 10, 5);
	var muzzle = new PIXI.Point();
	var bullets = [];
	var frontWalk = {name:'frontWalk', src:'assets/player/player_walk_front_', frames:6, speed:0.2, ox:20, oy:35, goto:2};
	var backWalk = {name:'backWalk', src:'assets/player/player_walk_back_', frames:6, speed:0.2, ox:20, oy:35, goto:2};
	
	DisplayComponent.call(this, {x:x, y:y});
	AnimationComponent.call(this, {list:[frontWalk, backWalk]});
	PhysicBodyComponent.call(this, props);

	var gun = new Gun(7.5, -7.5, './assets/gun.png');
	this.gun = gun;
	this.sprite.addChild(this.gun.sprite);

	//addDebugShape(this.sprite, aabb);	

	this.fire = function(mouse) {
		if (gun.reloadTime < gun.reloadTimeMax) return;
		gun.reloadTime = 0;

		gun.sprite.toGlobal(gun.muzzle, muzzle);		
		var dx = mouse.x - muzzle.x;
		var dy = mouse.y - muzzle.y;
		var rotation = Math.atan2(dy,dx);
		var cos = Math.cos(rotation);
		var sin = Math.sin(rotation);

		var bullet = new Bullet(muzzle.x, muzzle.y);
		bullet.vx += gun.speed*cos;
		bullet.vy += gun.speed*sin;
		this.body.x -= gun.kick * cos;
		this.body.y -= gun.kick * sin;
		return bullet;
	}
}

function Gun(x,y,image) {
	DisplayComponent.call(this, {x:x, y:y, image:image});
	this.sprite.pivot.set(2.5, 7);	
	this.muzzle = new PIXI.Point(15,3);
	this.kick = 0.05;
	this.reloadTime = 0;
	this.reloadTimeMax = 30;
	this.speed = 5;	
}

function Bullet(x,y) {
	var shape = new PIXI.Graphics();	
	//shape.lineStyle(1, 0xffffff);
	//shape.beginFill(0x777777);
	shape.beginFill(0xffffff);
	shape.lineStyle(1, 0x777777);
	shape.drawRect(-2, -2, 4, 4);
	DisplayComponent.call(this, {x:x, y:y, image:shape});
	shape.cacheAsBitmap = true;

	this.hitArea = new phys.AABB(x, y, 3, 3);	
	this.vx = 0;
	this.vy = 0;
	
	this.update = function() {
		this.sprite.x += this.vx;
		this.sprite.y += this.vy;
		this.hitArea.x = this.sprite.x;
		this.hitArea.y = this.sprite.y;
	}

	this.delete = function () {		
		this.sprite.parent.removeChild(this.sprite);
		delete this;
	}	
}