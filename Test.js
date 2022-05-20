var playerTanks = [];
var player3 = false;
var walls = [];
const color = ["red","green","blue"]
function startGame() {
    while (true) {
        let huvudmeny = prompt("Välj hur många spelare, skriv in 2 för två spelare och 3 för tre");
        if (huvudmeny == 3){
            player3 = true;
            break
        }
        if (huvudmeny == 2) {
            break
        }
    }
    walls = [];
    playerTanks.push(new tank("redtank.png", Math.round(Math.random() * 8)*68+32, Math.round(Math.random() * 5)*68+32, "redshot.png", 0), new tank("greentank.png", Math.round(Math.random() * 8)*68+32, Math.round(Math.random() * 5)*68+32,"greenshot.png", 1));
    if (player3) {
        playerTanks.push(new tank("bluetank.png", Math.round(Math.random() * 8)*68+32, Math.round(Math.random() * 5)*68+32, "blueshot.png", 2));
    }
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 6; y++) {
            if (x<9 && Math.random()>0.7) walls.push(new wall(2+x*67, 67*(1.5+y)-4, 0));

            if (y<6 && Math.random()>0.7)     walls.push(new wall(67*(0.5+x),67*(y+1)-2,90));

        }
    }
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 599;
        this.canvas.height = 398;
        this.points = [new Point(0, 0), new Point(this.canvas.width, 0), new Point(this.canvas.width, this.canvas.height), new Point(0, this.canvas.height)]; //0=övre vänster 1=övre höger 2=nedre höger 3=nedre vänster
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    stop : function() {
        clearInterval(this.interval);
    },    
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

window.addEventListener('keydown', function (e) {
    e.preventDefault();

    if (playerTanks.length === 1) {
        playerTanks = [];
        this.keys = {};
        startGame();

        return;
    }

    myGameArea.keys = (myGameArea.keys || []);
    myGameArea.keys[e.keyCode] = (e.type == "keydown");
});
window.addEventListener('keyup', function (e) {
    myGameArea.keys[e.keyCode] = (e.type == "keydown");
});


function tank(color, x, y, shot, id) {
    this.id = id;
    this.activeBullet = null;
    this.alive = true;
    this.relode = 0;
    this.width = 18;
    this.height = 27;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;
    this.center = new Point(this.width / 2, this.height / 2);
    this.points = [new Point(0, 0), new Point(this.width, 0), new Point(this.width, this.height), new Point(0, this.height)]; //0=övre vänster 1=övre höger 2=nedre höger 3=nedre vänster
    this.vertices = this.points.map(point => point.rotate(this.angle, this.center).translate(this.x - (this.width / 2), this.y - (this.height / 2)));
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
    this.newPos = function (gameArea) {
        const angle = this.angle + this.moveAngle * Math.PI / 180;
        const x = this.x + this.speed * Math.sin(angle);
        const y = this.y - this.speed * Math.cos(angle);
        const vertices = this.points.map(point => point.rotate(angle, this.center).translate(x - (this.width / 2), y - (this.height / 2)));
        for (const wall of walls) {
            if (check_collision(vertices, wall.vertices)) return;
        }
        for (const point of vertices) {
            if (!inside(point, gameArea.points)) return;
        }
        for (id in playerTanks) {
            const other = playerTanks[id];
            if (other && other.id !== this.id) {
                if (check_collision(vertices, other.vertices)) return;
            }
        }
        
        this.angle = angle;
        this.x = x;
        this.y = y;

        this.vertices = vertices;
    }

}

function touch(line1, line2) {
    let p1 = line1.p1;
    let p2 = line1.p2;
    let p3 = line2.p1;
    let p4 = line2.p2;
    let denomintor = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denomintor;
    let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denomintor;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) return true;

    return false;
}

function check_collision(polygon1, polygon2) {
    const lines1 = get_lines(polygon1);
    const lines2 = get_lines(polygon2);

    for (let i = 0; i < lines1.length; i++) {
        for (let j = 0; j < lines2.length; j++) {
            if (touch(lines1[i], lines2[j])) {
                return true;
            }
        }
    }

    return false;
}

function get_lines(vertices) {
    let lines = [];

    for (let i = 0; i < vertices.length; i++) {
        lines.push(new Line(vertices[i], vertices[(i + 1) % vertices.length]));
    }

    return lines;
}

class Line {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
};

function bullet(angle, x, y, type) {

    this.type = type;
    this.width = 6;
    this.height = 6;
    this.xspeed = 4;
    this.yspeed = 4;
    this.angle = angle;
    this.moveAngle = 0;
    this.image = new Image();
    this.image.src = "ball.png";
    this.x = x;
    this.y = y;
    this.position = new Point(this.x, this.y);
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, 
            this.width / -2, this.height / -2, this.width, this.height);
        ctx.restore();
    }
    this.newPos = function() {
        this.x += this.xspeed * Math.sin(this.angle);
        this.y -= this.yspeed * Math.cos(this.angle);

        this.position = new Point(this.x, this.y);
    }

}

function wall(x, y, rotation) {
    this.length = 67;
    this.width = 4;
    this.center = new Point(this.length / 2, this.width / 2);
    this.x = x;
    this.y = y;
    this.rotation = rotation * Math.PI / 180;
    this.points = [new Point(0, 0), new Point(this.length, 0), new Point(this.length, this.width), new Point(0, this.width)];
    this.vertices = this.points.map(point => point.rotate(this.rotation, this.center).translate(this.x - (this.width / 2), this.y - (this.length / 2)));
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);

        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }

        ctx.closePath();
        ctx.fill();
    }
}



class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    translate(x, y) {
        return new Point(this.x + x, this.y + y);
    }
    rotate(angle, center) {
        const x = this.x - center.x;
        const y = this.y - center.y;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Point(
            center.x + cos * x - sin * y,
            center.y + sin * x + cos * y
        );
    }
    distance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }
}
function inside(point, points) {
    let i, j, c = false;
    for (i = 0, j = points.length - 1; i < points.length; j = i++) {
        if (((points[i].y > point.y) != (points[j].y > point.y)) &&
            (point.x < (points[j].x - points[i].x) * (point.y - points[i].y) / (points[j].y - points[i].y) + points[i].x)) {
            c = !c;
        }
    }
    return c;
}

function updateGameArea() {
    myGameArea.clear();

    for (const tank of playerTanks) {
        if (!tank.alive) continue;

        tank.moveAngle = 0;
        tank.speed = 0;
        //0=övre vänster 1=övre höger 2=nedre höger 3=nedre vänster
        const input = tank.id == 0 ? [37, 39, 38, 40, 77] : tank.id == 1 ? [83, 70, 69, 68, 87] : [74, 76, 73, 75, 85];
        if (myGameArea.keys != null) {
            if (myGameArea.keys[input[0]] ) {tank.moveAngle = -4; }
            if (myGameArea.keys[input[1]]) {tank.moveAngle = 4; }
            if (myGameArea.keys[input[2]] ) {tank.speed= 1.2; }
            if (myGameArea.keys[input[3]]) { tank.speed = -1.; }
            if (myGameArea.keys[input[4]] && tank.relode == 0) {
                tank.activeBullet = new bullet(tank.angle, tank.x + 27/2* Math.sin(tank.angle), tank.y - 27/2* Math.cos(tank.angle));
                tank.relode = 250;
            }
        }

        if (tank.relode > 0) {
            tank.relode = tank.relode - 1;
            if (tank.activeBullet.x-3 < 0 || tank.activeBullet.x+3 > myGameArea.canvas.width) {
                tank.activeBullet.xspeed = -tank.activeBullet.xspeed;
            }
            if (tank.activeBullet.y-3 < 0 || tank.activeBullet.y+3 > myGameArea.canvas.height) {
                tank.activeBullet.yspeed = -tank.activeBullet.yspeed;
            }

            for (const wall of walls) {
                if (inside(tank.activeBullet.position, wall.vertices)) {
                    if (wall.rotation == Math.PI/2) tank.activeBullet.xspeed = -tank.activeBullet.xspeed;
                    if (wall.rotation == 0) tank.activeBullet.yspeed = -tank.activeBullet.yspeed;
                }
            }

            tank.activeBullet.newPos();
            tank.activeBullet.update();
            for (const other of playerTanks) {
                if (inside(tank.activeBullet.position, other.vertices)) {
                    other.alive = false;
                    playerTanks = playerTanks.filter(tank => tank.alive);
                    if (playerTanks.length === 1) {
                        myGameArea.clear();

                        const ctx = myGameArea.context;
                        ctx.fillStyle = color[playerTanks[0].id];
                        ctx.font = '30px roboto';
                        ctx.textAlign = "center";
                        ctx.fillText(`The winner is ${color[playerTanks[0].id]}!`, ctx.canvas.width / 2, ctx.canvas.height / 2);
                        ctx.fillText("Press any key to play again!", ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);

                        myGameArea.stop();
                        return
                    }
                }
            }
        }


            tank.newPos(myGameArea);
            tank.update();
    } 
    for (const wall of walls) {
        wall.update();
    }
}