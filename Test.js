var myGamePiece;

function startGame() {
    myGamePiece = new tank( "redtank.png", 225, 225, "redshot.png");
    newGamePiece = new tank( "greentank.png", 25, 225, "greenshot.png");
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


function tank(color, x, y, shot, type) {
    this.alive = true;
    this.relode = 0;
    this.type = type;
    this.width = 30;
    this.height = 45;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;    
    this.image = new Image();
    this.image.src = color;
    this.shot = new Image();
    this.shot.src = shot;
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.relode<=0) {
                    ctx.drawImage(this.image, 
            this.width / -2, this.height / -2, this.width, this.height);
        }
        else {
            ctx.drawImage(this.shot, 
                this.width / -2, this.height / -2, this.width, this.height);
        }
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
    this.width = 8;
    this.height = 8;
    this.xspeed = 4;
    this.yspeed = 4;
    this.angle = angle;
    this.moveAngle = 0;
    this.image = new Image();
    this.image.src = "ball.png";
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, 
            this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();    
    }
    this.newPos = function() {
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.xspeed * Math.sin(this.angle);
        this.y -= this.yspeed * Math.cos(this.angle);
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) ||
        (mytop > otherbottom) ||
        (myright < otherleft) ||
        (myleft > otherright)) {
          crash = false;
        }
        return crash;
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
        red = new bullet(myGamePiece.angle, myGamePiece.x + 23* Math.sin(myGamePiece.angle), myGamePiece.y - 23* Math.cos(myGamePiece.angle));
        myGamePiece.relode = 150;
    }
    if (myGamePiece.relode > 0) {
        myGamePiece.relode = myGamePiece.relode - 1;
        if (red.x-4 < 0 || red.x+4 > myGameArea.canvas.width) {
            red.xspeed = -red.xspeed;
        }
        if (red.y-4 < 0 || red.y+4 > myGameArea.canvas.height) {
            red.yspeed = -red.yspeed;
        }
        red.newPos();
        red.update();
        if (red.crashWith(newGamePiece)||red.crashWith(myGamePiece)) {
            myGameArea.stop();
          }
    }
   
    
    newGamePiece.moveAngle = 0;
    newGamePiece.speed = 0;
    if (myGameArea.keys && myGameArea.keys[65]) {newGamePiece.moveAngle = -2; }
    if (myGameArea.keys && myGameArea.keys[68]) {newGamePiece.moveAngle = 2; }
    if (myGameArea.keys && myGameArea.keys[87]) {newGamePiece.speed= 1; }
    if (myGameArea.keys && myGameArea.keys[83]) { newGamePiece.speed = -1; }
    if (myGameArea.keys && myGameArea.keys[81] && newGamePiece.relode==0) {
        green = new bullet(newGamePiece.angle, newGamePiece.x+ 27* Math.sin(newGamePiece.angle), newGamePiece.y- 27* Math.cos(newGamePiece.angle));
        newGamePiece.relode = 150;
    }
    if (newGamePiece.relode > 0) {
        newGamePiece.relode = newGamePiece.relode - 1;
        if (green.x-4 < 0 || green.x+4 > myGameArea.canvas.width) {
            green.xspeed = -green.xspeed;
        }
        if (green.y-4 < 0 || green.y+4 > myGameArea.canvas.height) {
            green.yspeed = -green.yspeed;
        }
        green.newPos();
        green.update();
        if (green.crashWith(newGamePiece)||green.crashWith(myGamePiece)) {
            newGamePiece.alive = false;
          }
    }
    if (myGamePiece.alive == true) {
        myGamePiece.newPos();
        myGamePiece.update();
    }
    if (newGamePiece.alive == true) {
        newGamePiece.newPos();
        newGamePiece.update();
    }
}