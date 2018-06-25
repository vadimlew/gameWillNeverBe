function VerletPhysics() {
	var bodies = [];

	this.add = function(body) {
		if (bodies.indexOf(body) != -1) return;
		bodies.push(body);
	}

	this.remove = function(body) {
		var idx = bodies.indexOf(body);
		if (idx == -1) return;
		bodies.splice(idx, 1);
	}	

	function AABB(x,y,rx,ry) {
		this.x = x || 0;
		this.y = y || 0;
		this.rx = rx || 10;
		this.ry = ry || 10;

		this.intersects = function(aabb) {
			var dx = aabb.x - this.x;			
			if (Math.abs(dx) > this.rx + aabb.rx) return false;
			var dy = aabb.y - this.y;			
			if (Math.abs(dy) > this.ry + aabb.ry) return false;
			return true;
		}
	}	

	AABB.fromArray = function(arr) {
		return new AABB(arr[0], arr[1], arr[2], arr[3]);
	}

	function AABB2(x,y,w,h) {
		this.x = x || 0;
		this.y = y || 0;
		this.w = w || 0;
		this.h = h || 0;

		this.intersects = function(aabb) {
			var dx = aabb.x - this.x;			
			if (Math.abs(dx) > this.rx + aabb.rx) return false;
			var dy = aabb.y - this.y;			
			if (Math.abs(dy) > this.ry + aabb.ry) return false;
			return true;
		}
	}

	function Body(aabb, mass=1, friction=1, bounce=1, isStatic=false) {
		aabb = aabb || new AABB(0,0,10,10);
		this.aabb = aabb;
		this.vx = 0;
		this.vy = 0;
		this.isStatic = isStatic;
		if (mass <= 0) mass = 0.00000000000001;
		this.mass = mass || 1;
		var prevX = aabb.x;
		var prevY = aabb.y;
		var sprite; 
		var dx=0;
		var dy=0;

		this.iteration = function () {
			//if (isStatic) return;
			this.vx = aabb.x - prevX;
			this.vy = aabb.y - prevY;
			this.vx *= friction;
			this.vy *= friction;
			prevX = aabb.x;
			prevY = aabb.y;
			aabb.x += this.vx;
			aabb.y += this.vy;			
			if (sprite) {
				sprite.x = aabb.x + dx;
				sprite.y = aabb.y + dy;
			}
		}

		this.setXY = function(x, y) {
			aabb.x = x;
			aabb.y = y;			
			prevX = x;			
			prevY = y;
			if (sprite) {
				sprite.x = aabb.x + dx;
				sprite.y = aabb.y + dy;
			}
		}

		Object.defineProperty(this, 'sprite', {
			set: function(s) {
				sprite = s;	
				dx = sprite.x - aabb.x;
				dy = sprite.y - aabb.y;
			},
			get: function() {
				return sprite;				
			}
		});

		Object.defineProperty(this, 'x', {
			set: function(x) {
				aabb.x = x;				
			},
			get: function() {
				return aabb.x;				
			}
		});

		Object.defineProperty(this, 'y', {
			set: function(y) {
				aabb.y = y;				
			},
			get: function() {
				return aabb.y;				
			}
		});
	}

	function hitTest(bodyA, bodyB) {
		if (bodyA.isStatic && bodyB.isStatic) return false;
		var hit = bodyA.aabb.intersects(bodyB.aabb);	
		var bounce = 1.05;
		var friction = .01;

		if (hit) {
			var dx = (bodyB.aabb.rx + bodyA.aabb.rx) - Math.abs(bodyB.aabb.x - bodyA.aabb.x);
			var dy = (bodyB.aabb.ry + bodyA.aabb.ry) - Math.abs(bodyB.aabb.y - bodyA.aabb.y);	
			var nx = bodyB.aabb.x > bodyA.aabb.x? 1 : -1;
			var ny = bodyB.aabb.y > bodyA.aabb.y? 1 : -1;

			if (dx < dy) {				
				dx *= nx * bounce;	
				//dy = (bodyA.vy + bodyB.vy) * friction;	

				if (bodyA.isStatic) {
					bodyB.aabb.x += dx;
					//bodyB.aabb.y -= dy;					
					return true;
				}

				if (bodyB.isStatic) {
					bodyA.aabb.x -= dx;	
					//bodyA.aabb.y -= dy;					
					return true;
				}

				var summ = bodyA.mass + bodyB.mass;
				var ratio1 = bodyA.mass/summ;
				var ratio2 = bodyB.mass/summ;		
				bodyA.aabb.x -= dx*ratio2;				
				bodyB.aabb.x += dx*ratio1;
				//bodyA.aabb.y -= dy*ratio2;				
				//bodyB.aabb.y += dy*ratio1;
			} else {				
				dy *= ny * bounce;
				//dx = (bodyA.vx + bodyB.vx) * friction;	

				if (bodyA.isStatic) {					
					bodyB.aabb.y += dy;
					//bodyB.aabb.x -= dx;
					return true;
				}

				if (bodyB.isStatic) {					
					bodyA.aabb.y -= dy;
					//bodyA.aabb.x -= dx;
					return true;
				}

				var summ = bodyA.mass + bodyB.mass;
				var ratio1 = bodyA.mass/summ;
				var ratio2 = bodyB.mass/summ;				
				bodyA.aabb.y -= dy*ratio2;
				bodyB.aabb.y += dy*ratio1;
				//bodyA.aabb.x -= dx*ratio2;				
				//bodyB.aabb.x += dx*ratio1;
			}
		}
		return hit;
	}

	this.hitTestEdge = function(body, x,y,w,h) { 
		var flag = false;
		if (body.aabb.x < x + body.aabb.rx) {body.aabb.x = x + body.aabb.rx; flag = true}; 
		if (body.aabb.x > x + w - body.aabb.rx) {body.aabb.x = x + w - body.aabb.rx; flag = true}; 
		if (body.aabb.y < y + body.aabb.ry) {body.aabb.y = y + body.aabb.ry; flag = true}; 
		if (body.aabb.y > y + h - body.aabb.ry) {body.aabb.y = y + h - body.aabb.ry; flag = true};
		return flag; 
	}

	function update() {		
		for (var i=0; i < bodies.length; i++) {
			var body1 = bodies[i];
			//if (body1.isStatic) continue;
			body1.iteration();
			//console.log(body1.sprite.name);
			//this.hitTestEdge(body1, 0,0,800,600);
			for (var j=i+1; j < bodies.length; j++) {
				var body2 = bodies[j];
				hitTest(body1, body2);
			}
		}
	}	

	this.AABB = AABB;
	this.Body = Body;
	this.hitTest = hitTest;	
	this.update = update;
}