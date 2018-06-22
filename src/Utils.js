function SorterZManager() {
	var objects= [];

	this.add = function(obj) {
		objects.push(obj);
	}

	this.update = function() {
		for (var i=0; i < objects.length; i++) {
			var obj1 = objects[i];			
			var parent = obj1.sprite.parent;			
			if (!parent) continue;			
			for (var j=i+1; j < objects.length; j++) {
				var obj2 = objects[j];				
				if (!obj2.sprite.parent || parent != obj2.sprite.parent) continue;		
				var index1 = parent.getChildIndex(obj1.sprite);
				var index2 = parent.getChildIndex(obj2.sprite);
				if (obj1.sprite.y < obj2.sprite.y && index1 > index2) {
					parent.swapChildren(obj1.sprite, obj2.sprite);
				}
				if (obj1.sprite.y > obj2.sprite.y && index1 < index2) {
					parent.swapChildren(obj1.sprite, obj2.sprite);
				} 
			}
		}
	}
}

function BulletManager() {
	var objects= [];
	var bullets= [];

	this.add = function(obj) {
		if (obj instanceof Bullet) {
			bullets.push(obj);
		} else {			
			objects.push(obj);
		}		
	}

	this.update = function() {
		for (var i=0; i < bullets.length; i++) {
			var bullet = bullets[i];			
			bullet.update();
			if (hitTestEdge(bullet.hitArea, 0,0,800,600)) { 
				deleteBullet();	
				continue;	
			}
			for (var j=0; j < objects.length; j++) {
				var obj = objects[j];
				var flag = hitTestObject(bullet, obj);
				if (flag) {					
					if (obj.hit) obj.hit(bullet);
					deleteBullet();
					break;
				}				
			}
		}

		function deleteBullet() {
			bullet.delete();
			var ix = bullets.indexOf(bullet);
			bullets.splice(ix, 1);
			i--;
		}
	}

	function hitTestObject(bullet, obj) {
		var dx = (obj.sprite.x + obj.hitArea.x) - bullet.hitArea.x;
		if (Math.abs(dx) > obj.hitArea.rx) return false;
		var dy = (obj.sprite.y + obj.hitArea.y) - bullet.hitArea.y;
		if (Math.abs(dy) > obj.hitArea.ry) return false;
		return true;
	}

	function hitTestEdge(aabb, x,y,w,h) {
		var flag = false;
		if (aabb.x < x + aabb.rx) {flag = true};
		if (aabb.x > x + w - aabb.rx) {flag = true};
		if (aabb.y < y + aabb.ry) {flag = true};
		if (aabb.y > y + h - aabb.ry) {flag = true};
		return flag; 
	}
}

function InputControl() {		
	var keys = {
		left: false,
		up: false,
		right: false,
		down: false		
	}
	var mouse = new PIXI.Point(0,0);
	mouse.left = false;
	mouse.right = false;

	addEventListener('keydown', keyDownHandler);
	function keyDownHandler(e) {
		//console.log(e.code);		
		switch(e.code) {
			case 'KeyA':
			case 'ArrowLeft':
				e.preventDefault(); 
				keys.left = true;
				keys.pressed = true;
				break;
			case 'KeyW':
			case 'ArrowUp':
				e.preventDefault(); 
				keys.up = true;
				keys.pressed = true;
				break;
			case 'KeyD':
			case 'ArrowRight':
				e.preventDefault(); 
				keys.right = true;
				keys.pressed = true;
				break;
			case 'KeyS':
			case 'ArrowDown':
				e.preventDefault(); 
				keys.down = true;
				keys.pressed = true;
				break;
		}		
	}

	addEventListener('keyup', keyUpHandler);
	function keyUpHandler(e) {
		switch(e.code) {
			case 'KeyA':
			case 'ArrowLeft':
				keys.left = false;
				keys.pressed = false;
				break;
			case 'KeyW':
			case 'ArrowUp':
				keys.up = false;
				keys.pressed = false;
				break;
			case 'KeyD':
			case 'ArrowRight':
				keys.right = false;
				keys.pressed = false;
				break;
			case 'KeyS':
			case 'ArrowDown':
				keys.down = false;
				keys.pressed = false;
				break;
		}
	}

	app.view.addEventListener('mousedown', function(e) {
		if (e.which == 1) mouse.left = true;
		if (e.which == 3) mouse.right = true;
	});

	app.view.addEventListener('mouseup', function(e) {
		if (e.which == 1) mouse.left = false;
		if (e.which == 3) mouse.right = false;
	});

	app.view.addEventListener('contextmenu', function(e) {
	    e.preventDefault(); 	  
	    return false;
	}, false);

	app.stage.interactive = true; 
	app.stage.on('mousemove', function(e) {
		mouse.x =  e.data.global.x;
		mouse.y =  e.data.global.y;
	});

	Object.defineProperty(this, 'anyKeyPress', {
		get: function() {
			for(var prop in keys) {
				if (keys[prop]) return true;
			}
			return false;				
		}
	});

	this.keys = keys;
	this.mouse = mouse;
}

function addDebugShape(sprite, aabb) {
	//return;
	var debugShape = new PIXI.Graphics();
	debugShape.lineStyle(1, 0x000000);
	debugShape.beginFill(0xffff00);
	debugShape.drawRect(aabb.x - sprite.x - aabb.rx, aabb.y - sprite.y - aabb.ry, aabb.rx*2, aabb.ry*2);
	debugShape.alpha = 0.5;
	sprite.addChild(debugShape);
}

function addDebugShape2(sprite, aabb) {
	//return;
	var debugShape = new PIXI.Graphics();
	debugShape.lineStyle(1, 0x000000);
	debugShape.beginFill(0xff0000);
	debugShape.drawRect(-aabb.rx, -aabb.ry, aabb.rx*2, aabb.ry*2);
	debugShape.alpha = 0.5;
	debugShape.x = aabb.x;
	debugShape.y = aabb.y;
	sprite.addChild(debugShape);
}