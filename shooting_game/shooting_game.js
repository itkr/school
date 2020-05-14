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
    }
    checkCollision() {
        let collisions = [];
        for (let child of this.children) {
            // TODO: 衝突判定
            if (false) {
                collisions.push(child);
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
        this.moveTo(null, this.y - 20);
        if (this.y < 0 || this.x < 0 || this.context.width < this.x || this.height < this.y) {
            this.disable();
        }
    }
}

class Machine extends Obj {
    makeObject() {
        this.context.fillStyle = 'rgb(255,00,00)';
        this.context.beginPath();
        this.context.moveTo(this.x, this.y - 20);
        this.context.lineTo(this.x - 20, this.y + 10);
        this.context.lineTo(this.x + 20, this.y + 10);
        this.context.lineTo(this.x, this.y - 20);
        this.context.closePath();
        this.context.fill();
    }
    shot() {
        field.push(new Shot(this.context, this.x, this.y));
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
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('click', onMouseClick, false);
    requestAnimationFrame(main);
}

init();
