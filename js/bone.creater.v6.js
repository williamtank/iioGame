var  b2Vec2 = Box2D.Common.Math.b2Vec2
		,  b2AABB = Box2D.Collision.b2AABB
		,  b2BodyDef = Box2D.Dynamics.b2BodyDef
		,  b2Body = Box2D.Dynamics.b2Body
		,  b2FixtureDef = Box2D.Dynamics.b2FixtureDef
		,  b2Fixture = Box2D.Dynamics.b2Fixture
		,  b2World = Box2D.Dynamics.b2World
		,  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
		,  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
		,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;


function getGameCreater(io,world){
	var gameCreater = {};

	//封装了io和box2d create body直接的关系
	//由于目前需要获取box2d的body对象，很可能这方法要废弃
	gameCreater.createB2dAndIO = function(bodyDef,fixDef,getb2Body){
		var obj,body;
		body = world.CreateBody(bodyDef);
		obj = io.addObj(body,-1).CreateFixture(fixDef)
							 .GetShape()
	                         .prepGraphics(io.b2Scale);
		return getb2Body ? body : obj;               
	}

	gameCreater.renderShape = function(body,fixDef){
		return io.addObj(body,-1).CreateFixture(fixDef)
							 .GetShape()
	                         .prepGraphics(io.b2Scale);
	}
	//注意这里的width和height度量是px，内部会做度量转换
	gameCreater.createFixture = function(shape,width,height) {
		var fixture = new b2FixtureDef();
		fixture.density = 3;	//越大obj的重量重量越大
		fixture.friction = 0.8;	//摩擦力
		fixture.restitution = .3;
		fixture.shape = shape;
		if(typeof width != 'undefined' && typeof height != 'undefined'){
			fixture.shape.SetAsBox(	width*bp/2*gameSize, height*bp/2*gameSize);
		}
		return fixture;
	};

	gameCreater.createBody = function(x, y) {
		var b = new b2BodyDef();
		b.position.Set(x*bp, y*bp);
		b.type = b2Body.b2_dynamicBody;
		b.linearDamping = .01;	//线性阻尼
		b.angularDamping = .01;	//角阻尼
		return b;
	};


	gameCreater.createSomeObject = function(){
		//create some objects
		var body,shape,width,height;
		var bodyDef = gameCreater.createBody(0,0);
		var fixDef;
		for(var i = 0; i < 10; ++i) {
		width = Math.random() + 0.2 //half width
		height = Math.random() + 0.2 //half height
		if(Math.random() > 0.5) {
		 	fixDef = gameCreater.createFixture(new b2PolygonShape);
		 	fixDef.shape.SetAsBox(width, height);
		 	//var iioObj = new iio.ioRect(0,0,width*px,height*px);
		} else {
		 	fixDef = gameCreater.createFixture(new b2CircleShape(width));
			//var iioObj = new iio.ioRect(0,0,width*px,height*px);
		}
		bodyDef.position.x = Math.random() * 10+10;
		bodyDef.position.y = Math.random() * 10+5;
		//iioObj.setPos(bodyDef.position);
		//io.addToGroup('testObjs',iioObj);
		body = world.CreateBody(bodyDef);
		body.type = 'testObj'; //注意新增属性
		shape=io.addToGroup('testObjs',body).CreateFixture(fixDef).GetShape();
		if (shape instanceof b2CircleShape)
		 shape.prepGraphics(io.b2Scale)
		      .setFillStyle(Default.fill)
		      .setStrokeStyle(Default.stroke)
		      .drawReferenceLine();
		else
		 shape.prepGraphics(io.b2Scale)
		      .setFillStyle(Default.fill)
		      .setStrokeStyle(Default.stroke);
		}
	};


	gameCreater.createDoor = function(x,y){
		var fixDef = this.createFixture(new b2PolygonShape,5,5);

		var bodyDef = this.createBody( x,y);
		bodyDef.type =  b2Body.b2_staticBody;
		//top outer wall
		var door = world.CreateBody(bodyDef);
		door.name = 'door';

		door.CreateFixture(fixDef);
		//this.renderShape(door,fixDef).setFillStyle('white').setStrokeStyle('rgba(245, 255, 0, 0.6)',3);

		var ioDoor = new iio.ioRect(x,y,100*gameSize,100*gameSize).addImage('images/shield.png')
							.enableKinematics()
							.setTorque(1);
		ioDoor.originalWidth = 60*gameSize;
		ioDoor.originalHeight = 100*gameSize;
		ioDoor.name = 'door';
		ioDoor.myShrinkRate = .98; //设置为0.6有个像时空隧道的效果
		ioDoor.isShrink = true;
		
		ioSpriteList.push(ioDoor);

	}

	return gameCreater;
}

