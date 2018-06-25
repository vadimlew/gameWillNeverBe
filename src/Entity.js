function Entity() {}

function createEntity(components) {
	var c = components;
	var entity = new Entity();

	if (c.display) {		
		DisplayComponent.call(entity, c.display);
	}

	if (c.animation) {		
		AnimationComponent.call(entity, c.animation);
	}

	if (c.phys) {
		PhysicBodyComponent.call(entity, c.phys);
	}

	if (c.hit) {
		BulletHitComponent.call(entity, c.hit);
	}

	if (c.events) {
		EventComponent.call(entity);
	}

	if (c.ai) {
		AIComponent.call(entity, c.ai);
	}

	if (c.debug) {
		if (c.debug.body && entity.body) addDebugShape(entity.sprite, entity.body.aabb);
		if (c.debug.hit && entity.hitArea) addDebugShape2(entity.sprite, entity.hitArea);
	}
	
	return entity;
}