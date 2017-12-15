//VRWorld written with aframep5

var world;
var stoneFloor;
var balloons = [];
var rings = [];
var cylinders = [];
var followbox;
var timer = 50;

var popSound;
function preload(){
	popSound = loadSound("sound/pop.mp3");
}
function setup(){
	noCanvas();
	world = new World("VRScene");

	stoneFloor = new Plane({x:0, y:-5, z:0, width: 300, height: 300, asset: 'stonefloor', repeatX:300, repeatY: 300, rotationX: -90, metalness:.25});

	world.add(stoneFloor);
	for(let i = 0; i < 250; i++){
		balloons.push(new Balloon(random(-200, 200), 0, random(-200, 200)));
	}
	followbox = new FollowerBox;

	for(let i = 0; i < 100; i++){
		rings.push(new Torus({
			x: random(-150,150), y: random(10, 100), z: random(-150, 150),
			radius: random(2, 5),
			radiusTubular: .05,
			red: 100, green: 75, blue: 0,
			clickFunction: function(me){
				world.slideToObject(me, 2000 );
			}
		}));
		world.add(rings[i]);
	}
	for(let i = 0; i < 50; i++){
		cylinders.push(new Cylinder({
			x: random(-150, 150), y: -5, z: random(-150, 150),
			height: random(10, 40),
			radius: 1.5,
			red: random(255), green: random(255), blue: random(255),
			clickFunction: function(me){
				world.teleportToObject(me);
			}
		}));
		world.add(cylinders[i]);
	}

	world.setFlying(true);
}
function draw(){
	if(mouseIsPressed) {
    	world.moveUserForward(0.05);
  	}
	for(let i = 0; i < balloons.length; i++){
		if(!balloons[i].move()){
			balloons.splice(i, 1);
			i--;
			balloons.push(new Balloon(random(-200, 200), 0, random(-200, 200)));
		}
	}
	timer--;
	if(timer === 0){
		balloons.push(new Balloon(random(-200, 200), 0, random(-200, 200)));
		timer = 50;
	}
	followbox.follow();
}
function FollowerBox(){
	var userPosition = world.getUserPosition();
	var userRotation = world.getUserRotation();
	this.container = new Container3D({x: userPosition.x, y: 0, z: userPosition.z, rotationX: userRotation.x, rotationY: 0, rotationZ: userRotation.z});
	world.add(this.container);

	this.followCube = new Box({x:0, y:-1, z: 0, red: 255, blue: 0, green: 0, width: 2, height: 2, depth: 2, asset: 'carpet' });
	this.fringeCubes = [];
	for(let i = 0; i < 10; i++){
		if(i < 5){
			let littleCube = new Box({x:i*.4, y:-1, z:2, red: 255, blue: 0, green: 0, width: .2, height: .2, depth:1});
			this.fringeCubes.push(littleCube);
			this.container.addChild(this.fringeCubes[this.fringeCubes.length-1]);

			let littleCube2 = new Box({x:-(i*.4), y:-1, z:2, red: 255, blue: 0, green: 0, width: .2, height: .2, depth:1});
			this.fringeCubes.push(littleCube2);
			this.container.addChild(this.fringeCubes[this.fringeCubes.length-1]);
		}else{
			let littleCube = new Box({x:((i-5)*.4), y:-1, z:-2, red: 255, blue: 0, green: 0, width: .2, height: .2, depth:1});
			this.fringeCubes.push(littleCube);
			this.container.addChild(this.fringeCubes[this.fringeCubes.length-1]);

			let littleCube2 = new Box({x: -((i-5)*.4), y:-1, z:-2, red: 255, blue: 0, green: 0, width: .2, height: .2, depth:1});
			this.fringeCubes.push(littleCube2);
			this.container.addChild(this.fringeCubes[this.fringeCubes.length-1]);
		}
	}
	this.container.addChild(this.followCube);
	this.follow = function(){
		var currUserPosition = world.getUserPosition();
		var currUserRotation = world.getUserRotation();

		this.container.setPosition(currUserPosition.x, currUserPosition.y-1, currUserPosition.z);
		this.container.setRotation(0, 0, currUserRotation.z);
	}
}
function Balloon(x, y, z){
	this.shape = new Sphere({x:x, y:y, z:z, red:random(255), green: random(255), blue: random(255), radius: .75,
		clickFunction: function(shape){
			popSound.play();
			world.remove(shape);
			for(let i = 0; i < balloons.length; i++){
				if(balloons[i].shape.x === shape.x && balloons[i].shape.y === shape.y && balloons[i].shape.z === shape.z){
					balloons.splice(i, 1);
				}
			}
		}});
	world.add(this.shape);
	this.xPos = x;
	this.yPos = y;
	this.zPos = z;

	this.ySpeed = (random(17) + 2)/200;

	this.xOffset = random(1000);
	this.zOffset = random(2000,3000);

	this.move = function(){
		var yMovement = this.ySpeed;
		var xMovement = map(noise(this.xOffset), 0 , 1, -.05, .05);
		var zMovement = map(noise(this.zOffset), 0 , 1, -.05, .05);

		this.xOffset += 0.01;
		this.yOffset += 0.01;

		this.shape.nudge(xMovement, yMovement, zMovement);
		this.xPos += xMovement;
		this.yPos += yMovement;
		this.zPos += zMovement;

		//Remove the balloon if it flies out of the world
		if(this.yPos > 350){
			world.remove(this.shape);
			return false;
		}
		else{
			return true;
		}
	}

}
