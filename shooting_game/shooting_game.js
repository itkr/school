// グローバル変数
let canvas = document.getElementById('shooting_game');
let mouseX = 0;
let mouseY = 0;
let context = null;
let field = null;
let machine = null;

class Obj {
    constructor(context, x=0, y=0) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.children = [];
        this.enabled = true;
    }
    push(obj) {
        this.children.push(obj);
    }
    pointIsIn(x, y) {
        // 与えられたポイントがこのオブジェクト内に入っているか
        // TODO: 数学とか使う
        // TODO: 大きさを可変に
        if (this.x + 10 < x || x < this.x - 10) {
            return false;
        }
        if (this.y + 10 < y || y < this.y - 10) {
            return false;
        }
        return true;
    }
    checkCollision() {
        let collisions = [];
        for (let child of field.children) {
            // 衝突判定
            if (child === this) {
                continue;
            }
            if (child.pointIsIn(this.x, this.y)) {
                collisions.push(child);
                console.log('collision');
            }
        }
        return collisions;
    }
    moveTo(x=null, y=null) {
        let collisions = [];
        this.x = x !== null? x: this.x;
        this.y = y !== null? y: this.y;
        return this.checkCollision();
    }
    makeObject() {
    }
    disable() {
        this.enabled = false;
    }
    preDraw() {
    }
    draw() {
        this.preDraw();
        this.makeObject();
        for (let child of this.children) {
            if (child.enabled) {
                child.draw();
            }
        }
        this.children = this.children.filter(child => child.enabled);
    }
}

class Shot extends Obj {
    makeObject() {
        this.context.fillStyle = 'rgb(00,00,00)';
        this.context.fillRect(this.x - 5 , this.y - 5 , 10, 10);
    }
    preDraw() {
        let collisions = this.moveTo(null, this.y - 20);
        if (0 < collisions.length) {
            this.disable();
            for (let collision of collisions) {
                collision.disable();
            }
        }
        if (this.y < 0 || this.x < 0 || this.context.width < this.x || this.height < this.y) {
            this.disable();
        }
    }
}

class Machine extends Obj {
    makeObject() {
        this.context.fillStyle = 'rgb(255,00,00)';
        const INSCRIBED_CIRCLE = 0.298;
        const CIRCUMCIRCLE = 0.577;
        let edge = 50;
        this.context.beginPath();
        this.context.moveTo(this.x, this.y - (edge * CIRCUMCIRCLE));
        this.context.lineTo(this.x + (edge / 2), this.y + (edge * INSCRIBED_CIRCLE));
        this.context.lineTo(this.x - (edge / 2), this.y + (edge * INSCRIBED_CIRCLE));
        this.context.closePath();
        this.context.fill();
    }
    shot() {
        field.push(new Shot(this.context, this.x, this.y));
    }
}

class Enemy extends Obj {
    makeObject() {
        this.context.fillStyle = 'rgb(00,00,00)';
        this.context.fillRect(this.x - 10 , this.y - 10 , 20, 20);
    }
}

class Field extends Obj {
    makeObject() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// イベント
function onMouseMove(e) {
    let rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}

function onMouseClick(e) {
    machine.shot();
}

// メインループ
function main() {
    field.draw();
    machine.moveTo(mouseX, mouseY);
    requestAnimationFrame(main);
}

function init() {
    // 初期化
    if (!canvas.getContext) {
        aleart('未対応');
    }
    context = canvas.getContext('2d');
    field = new Field(context);
    machine = new Machine(context, 10, 10);
    field.push(machine);
    field.push(new Enemy(context, 100, 100));
    field.push(new Enemy(context, 550, 130));
    field.push(new Enemy(context, 603, 300));
    field.push(new Enemy(context, 220, 200));
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('click', onMouseClick, false);
    requestAnimationFrame(main);
}

init();
