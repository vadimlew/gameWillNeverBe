function DisplayComponent(props) {	
	var x = props.x || 0;
	var y = props.y || 0;
	var ax = props.ax || 0;
	var ay = props.ay || 0;
	var image = props.image;

	switch(typeof image) {
		case 'string':
			this.sprite = PIXI.Sprite.fromImage(image);
			break;
		case 'object':
			if (image instanceof PIXI.Container) 
				this.sprite = image;
			break;
		default:
			this.sprite = new PIXI.Container();
			break;
	}	

	this.sprite.x = x;
	this.sprite.y = y;
	if (this.sprite.anchor) this.sprite.anchor.set(ax,ay);
	this.sprite.cacheAsBitmap = props.cacheAsBitmap || false;

	if (props.parent) props.parent.addChild(this.sprite);
	if (props.manager) props.manager.add(this);
} 

function AnimationComponent(props) {
	var animations = {};
	var list = props.list;

	for (var i=0; i < list.length; i++) {
		var animObj = list[i];
		var images = [];
		for (var j=0; j < animObj.frames; j++) {
			var src = animObj.src + j + '.png';
			images.push(src);
		}		
		var animSprite = PIXI.extras.AnimatedSprite.fromImages(images);
		animSprite.pivot.set(animObj.ox || 0, animObj.oy || 0);
		animSprite.gotoAndStop(animObj.goto || 0);
		animSprite.animationSpeed = animObj.speed || 0.2;	
		animSprite.visible = false;	
		animSprite.name = animObj.name;
		this.sprite.addChild(animSprite);
		animations[animObj.name] = animSprite;
	}	

	var animation = animations[list[0].name];
	animation.visible = true;

	this.play = function(name) {
		if (name) {
			this.setAnimation(name);
		}
		animation.play();
	}

	Object.defineProperty(this, 'animation', {
		get: function() {
			return animation;
		}
	})

	this.setAnimation = function(name) {
		animation.visible = false;
		animation = animations[name];
		animation.visible = true;
	}
}

function BulletHitComponent(props) {
	this.hitArea = (props.aabb instanceof phys.AABB)? props.aabb : phys.AABB.fromArray(props.aabb);
	this.hit = function(bullet) {		
		if (this.body && !this.body.isStatic) {
			this.body.x += bullet.vx / this.body.mass;
			this.body.y += bullet.vy / this.body.mass;
		}
		if (this.dispatch) {			
			this.dispatch('bulletHit', bullet);
		}
	}

	if (props.manager) props.manager.add(this);
}

function ShadeComponent(x,y,w,h) {
	var color = 0x001c35;	
	var shape = new PIXI.Graphics();
	shape.beginFill(color);
	shape.drawRect(x, y, w, h);
	shape.alpha = 0.4;
	this.sprite.addChildAt(shape, 0);
}

function PhysicBodyComponent(props) {	
	var aabb = (props.aabb instanceof phys.AABB)? props.aabb : phys.AABB.fromArray(props.aabb);
	var mass = props.mass || 1;
	var friction = props.friction || .9;
	var bounce = props.bounce || 1;	
	var isStatic = props.isStatic || false;

	this.body = new phys.Body(aabb, mass, friction, bounce, isStatic);
	if (this.sprite) this.body.sprite = this.sprite;
	phys.add(this.body);			
} 

function EventComponent() {
	var events = {};
	this.on = function(eventName, callback) {		
		if (!events[eventName]) {
			events[eventName] = [];
		}
		events[eventName].push(callback);		
	}
	this.dispatch = function(eventName, params) {
		if (events[eventName]) {
			events[eventName].forEach(function(element) {
				element(params);
			});
		}
	}
}

function AIComponent(props) {
	props.speed = .2;
	props.owner = this;
	props.sensorRadius = 100;	
	
	var waitState = new WaitState(props);
	var followState = new FollowState(props);
	var stateMachine = new StateMachine(waitState);
	var sensor = new SensorCondition(props);
	var sensor2 = new AntiCondition(sensor);
	stateMachine.addCondition(sensor, followState);
	//stateMachine.addCondition(sensor2, waitState);

	if (props.manager) props.manager.add(stateMachine.update);
}