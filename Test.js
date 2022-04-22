var myGamePiece;

function startGame() {
    myGamePiece = new tank( "red", 225, 225);
    newGamePiece = new tank( "green", 25, 225);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1000;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


function tank(color, x, y, type) {
    this.relode = 0;
    this.type = type;
    this.width = 30;
    this.height = 40;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = color;
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();    
    }
    this.newPos = function() {
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
}

function bullet(angle, x, y, type) {

    this.type = type;
    this.width = 10;
    this.height = 10;
    this.speed = 4;
    this.angle = angle;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = "black";
        ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();    
    }
    this.newPos = function() {
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }
}


function updateGameArea() {
    myGameArea.clear();
    myGamePiece.moveAngle = 0;
    myGamePiece.speed = 0;
    if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.moveAngle = -2; }
    if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.moveAngle = 2; }
    if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.speed= 1; }
    if (myGameArea.keys && myGameArea.keys[40]) { myGamePiece.speed = -1; }
    if (myGameArea.keys && myGameArea.keys[77] && myGamePiece.relode==0) {
        red = new bullet(myGamePiece.angle, myGamePiece.x, myGamePiece.y);
        myGamePiece.relode = 150;
    }
    if (myGamePiece.relode > 0) {
        myGamePiece.relode=myGamePiece.relode - 1;
        red.newPos();
        red.update();
    }
   
    
    newGamePiece.moveAngle = 0;
    newGamePiece.speed = 0;
    if (myGameArea.keys && myGameArea.keys[65]) {newGamePiece.moveAngle = -2; }
    if (myGameArea.keys && myGameArea.keys[68]) {newGamePiece.moveAngle = 2; }
    if (myGameArea.keys && myGameArea.keys[87]) {newGamePiece.speed= 1; }
    if (myGameArea.keys && myGameArea.keys[83]) { newGamePiece.speed = -1; }
    if (myGameArea.keys && myGameArea.keys[81] && newGamePiece.relode==0) {
        green = new bullet(newGamePiece.angle, newGamePiece.x, newGamePiece.y);
        newGamePiece.relode = 150;
    }
    if (newGamePiece.relode > 0) {
        newGamePiece.relode=newGamePiece.relode - 1;
        green.newPos();
        green.update();
    }
    myGamePiece.newPos();
    myGamePiece.update();
    newGamePiece.newPos();
    newGamePiece.update();
}