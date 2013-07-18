/**
* Bone(width,height)	骨骼位置大部分是依附关节,所以提供长宽就可以
* Bone(x,y,width,height)
*/

var Bone = iio.inherit(function(x,y,width,height){
	//关节集合
	this.joints = {};
	//中心旋转角度，为iio处理
	this.rotation = 0;	
	//按fixed关节旋转角度
	this.angle = 0;	    

	//注意这不能使用this._super.call(this);因为这时继承关系还没有继承
	if(arguments.length == 2){
		iio.ioRect.call(this,0,0,x,y);
	}else{
		iio.ioRect.call(this,x,y,width,height);
	}
	//iio.ioRect.apply(this, arguments);
},iio.ioRect);

//关节的x,y是相对于骨头的pos(就是骨头的pos)
Bone.prototype.setJoint = function(name,x,y){
	if(!this.joints) this.joints = {};
	//pos为关节的绝对位置（因运动而不断重设）
	this.joints[name] = {x:x,y:y,pos:{x:x,y:y}};
}
Bone.prototype.getJoint = function(name){
	return this.joints[name];
}
Bone.prototype.getJointAbsPos = function(name){
	if(this.joints[name]){
		var targetJoint = this.joints[name],
			fixedJoint = this.joints['fixed'];
		var disX = targetJoint.x - fixedJoint.x;
		var disY = targetJoint.y - fixedJoint.y;

		var xPos = this.pos.x+ fixedJoint.x + Math.cos(this.angle)*disX - Math.sin(this.angle)*disY;
		var yPos = this.pos.y+ fixedJoint.y + Math.sin(this.angle)*disX + Math.cos(this.angle)*disY;
		//同时更新关节的实际位置
		targetJoint.pos.x = xPos;
		targetJoint.pos.y = yPos;
		//dot(xPos,yPos,io.context);
		return {x: xPos, y: yPos}
	}
}
Bone.prototype.setPosByJoint = function(bone,name){
	if(bone instanceof Bone && bone.joints[name]){
		var jointAbsPos = bone.getJointAbsPos(name);
		var thisFixed = this.joints['fixed'];
		var boneFixed = bone.joints['fixed'];
		//把自身的固定关节依附到设定关节中
		thisFixed.pos.x = jointAbsPos.x;
		thisFixed.pos.y = jointAbsPos.y;
		//同时更新自身的位置
		this.pos.x = jointAbsPos.x - thisFixed.x;
		this.pos.y = jointAbsPos.y - thisFixed.y;

	}
}
Bone.prototype.drawJoints = function(ctx){
	//重新调整自身关节绘画的位置(不影响实际位置)
	for(var i in this.joints){
		var joint = this.joints[i];
		//关节是依附在骨骼上，那么他的位置是相对于骨骼
		//它的位置只要计算在骨骼正常位置情况下所在就行了,骨骼旋转或平移会自动相对的了
		var posX = this.pos.x + joint.x;
		var posY = this.pos.y + joint.y;

		this.drawJoint(ctx,posX,posY);
	}
}
Bone.prototype.drawJoint = function(ctx,x,y,radius,lineWidth,color){
	ctx.lineWidth = lineWidth || 1;
    ctx.strokeStyle = color || 'green';
    radius = radius || 3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, true);
    ctx.stroke();
    ctx.closePath();
}

Bone.prototype.draw = function(ctx,pos,r){
	ctx.save();

	var jointPos = this.joints['fixed'].pos; //取出固定关节的实际位置(绝对位置)
	ctx.translate(jointPos.x, jointPos.y);
	ctx.rotate(this.angle);
	ctx.translate(-jointPos.x, -jointPos.y);
	//如果带有自己的绘制方法，就不使用默认的矩形
	if(typeof this.redraw == 'function'){
		this.redraw(ctx);
	}else{
		//如果为对象设置了图片渲染，就不使用默认样式
		if(!this.img){
			this.setStrokeStyle('#000').setFillStyle('#fff');
		}
		//this.setStrokeStyle('#ddd')
		//this.flipImage(true);	//效果不是我想要的
		this._super.draw.apply(this,arguments);
	}
	
	//画出关节
	//this.drawJoints(ctx);

	ctx.restore();	
}


/****************	机器人数据	***********************/

var robotData = {
	//骨骼部分
	body:{
		imgsrc:'images/robot/robot_body.png',
		size:[40,64],
		angle:Math.PI/18,
		joint:{'fixed':[0,32], 'head':[0,-32]},
		isMain:true,	//主骨骼标示位
		zIndex:0,
	},
	head:{
		imgsrc:'images/robot/robot_head.png',
		imgOffset:[0,-45],
		size:[128,72],
		angle:0,
		joint:{'fixed':[0,0]},
		constraint:['body','head'],
		zIndex:0
	},
	chest:{
		imgsrc:'images/robot/robot_chest.png',
		size:[72,36],
		angle:0,
		joint:{'fixed':[-10,-5]},
		constraint:['body','head'],
		zIndex:0
	},
	legL:{
		imgsrc:'images/robot/robot_legL.png',
		size:[56,112],
		angle:0,
		joint:{'fixed':[0,-40], 'knee':[0,40]},
		constraint:['body','fixed'],
		zIndex:-1
	},
	calfL:{
		imgsrc:'images/robot/robot_calf.png',
		size:[56,168],
		angle:0,
		joint:{'fixed':[0,-65] },
		constraint:['legL','knee'],
		zIndex:-1
	},
	legR:{
		imgsrc:'images/robot/robot_legR.png',
		size:[56,112],
		angle:0,
		joint:{'fixed':[0,-40],'knee':[0,40]},
		constraint:['body','fixed'],
		zIndex:1
	},
	calfR:{
		imgsrc:'images/robot/robot_calf.png',
		size:[56,168],
		angle:0,
		joint:{'fixed':[0,-65] },
		constraint:['legR','knee'],
		zIndex:1
	},
	armR:{
		imgsrc:'images/robot/robot_armR.png',
		size:[56,76],
		angle:0,
		joint:{'fixed':[0,-25],'elbow':[0,25]},
		constraint:['body','head'],
		zIndex:2
	},
	handR:{
		imgsrc:'images/robot/robot_handR.png',
		size:[56,76],
		angle:0,
		joint:{'fixed':[0,-30],'hand':[0,30]},
		constraint:['armR','elbow'],
		zIndex:3
	},
	palmR:{
		imgsrc:'images/robot/robot_palmR.png',
		size:[28,36],
		angle:-90*Math.PI/180,
		joint:{'fixed':[0,-16]},
		constraint:['handR','hand'],
		zIndex:2
	},
	armL:{
		imgsrc:'images/robot/robot_armL.png',
		size:[56,76],
		angle:0,
		joint:{'fixed':[0,-25],'elbow':[0,25]},
		constraint:['body','head'],
		zIndex:-2
	},
	handL:{
		imgsrc:'images/robot/robot_handL.png',
		size:[40,76],
		angle:0,
		joint:{'fixed':[0,-30],'hand':[0,30]},
		constraint:['armL','elbow'],
		zIndex:-2
	},
	palmL:{
		imgsrc:'images/robot/robot_palmL.png',
		size:[28,36],
		angle:-90*Math.PI/180,
		joint:{'fixed':[0,0]},
		constraint:['handL','hand'],
		zIndex:-2
	},
	weapon:{
		imgsrc:'images/robot/robot_weapon.png',
		size:[320,64],
		angle:0,
		joint:{'fixed':[-120,10],'muzzle':[100,0]},
		constraint:['handR','hand'],
		zIndex:1
	}
}


/****************	图片资源数据	***********************/
var imgPath = 'images/';
var imgSrcs = {
	crate: imgPath + 'crate.png',
	block: imgPath + 'block.png',
	bonus: imgPath + 'bonus.png',
	spring:imgPath + 'spring.png',
	lock_green: imgPath + 'lock_green.png'
}

/****************	游戏关卡数据	***********************/
var levelData = new Array();
//x,y 都是相对的，相对于游戏外框(960*640)左上角
//可以考虑player和door的width和height默认都为100*100
levelData[0] = [
	{type:'player',x:200, y:320},
	{type:'door',  x:760, y:540}

];

levelData[1] = [
	{type:'player',x:100, y:320},
	{type:'door',  x:900, y:350},
	{type:'wall',  x:450, y:520, width:260 ,height:10},
	{type:'wall',  x:720, y:400, width:250 ,height:10},

];

levelData[2] = [
	{type:'player',x:100, y:240},
	{type:'door',  x:860, y:540},
	{type:'wall',  x:650, y:540, width:70 ,height:70, img:imgSrcs.block},
	{type:'wall',  x:720, y:450, width:70 ,height:70, img:imgSrcs.block},
	{type:'box',  x:650, y:400, width:70 ,height:70, img:imgSrcs.crate},
	{type:'box',  x:500, y:520, width:70 ,height:70, img:imgSrcs.crate},
	{type:'box',  x:500, y:420, width:70 ,height:70, img:imgSrcs.crate},
	{type:'box',  x:500, y:320, width:70 ,height:70, img:imgSrcs.crate},
	{type:'box',  x:500, y:220, width:70 ,height:70, img:imgSrcs.crate},

];

levelData[3] = [
	{type:'player',x:100, y:150},
	{type:'door',  x:100, y:300},
	{type:'wall',  x:400, y:240, width:800 ,height:5},
	{type:'box',  x:500, y:210, width:70 ,height:70, img:imgSrcs.crate},
	{type:'box',  x:560, y:120, width:40 ,height:40, img:imgSrcs.crate},
	{type:'box',  x:620, y:50, width:90 ,height:90, img:imgSrcs.crate},
	{type:'box',  x:430, y:20, width:50 ,height:50, img:imgSrcs.crate},
	{type:'box',  x:550, y:46, width:100 ,height:100, img:imgSrcs.crate},

	{type:'wall',   x:100, y:510, width:15 ,height:210},
	{type:'block',  x:250, y:470, width:30 ,height:90, img:imgSrcs.block},
	{type:'box',    x:250, y:510, width:30 ,height:30, img:imgSrcs.bonus},
	{type:'block',  x:250, y:600, width:30 ,height:90, img:imgSrcs.block},
	{type:'block',  x:190, y:400, width:300 ,height:15, img:imgSrcs.block}

];

levelData[4] = [
	{type:'player',x:860, y:350},
	{type:'door',  x:100, y:100},
	{type:'spring',  x:200, y:600, width:100 ,height:20,img:imgSrcs.spring},
	{type:'spring',  x:500, y:360, width:100 ,height:20,img:imgSrcs.spring}
];

levelData[5] = [
	{type:'player',x:50, y:250},
	{type:'door',  x:850, y:270},
	{type:'wall', x:820,y:30,width:200,height:10},
	{type:'wall', x:250,y:200,width:500,height:10},
	{type:'wall', x:700,y:260,width:10,height:300},
	{type:'wall', x:470,y:500,width:470,height:10},
	{type:'spring',x:600,y:430,width:40,height:20,img:imgSrcs.spring},
	{type:'timeGate',x:250,y:260,width:60,height:10,fromNum:0,toNum:1,img:imgSrcs.lock_green},
	{type:'timeGate',x:840,y:360,width:60,height:10,fromNum:1,toNum:2,img:imgSrcs.lock_green},
	{type:'timeGate',x:600,y:500,width:60,height:10,fromNum:2,toNum:3,img:imgSrcs.lock_green},
	{type:'timeGate',x:50,y:200,width:60,height:10,fromNum:3,toNum:4,img:imgSrcs.lock_green},
	{type:'timeGate',x:400,y:260,width:60,height:10,fromNum:5,toNum:6,img:imgSrcs.lock_green},

	{type:'timeGate',x:450,y:10,width:60,height:10,fromNum:6,toNum:null,img:imgSrcs.lock_green},
	{type:'timeGate',x:890,y:30,width:60,height:10,fromNum:4,toNum:null,img:imgSrcs.lock_green},
];













