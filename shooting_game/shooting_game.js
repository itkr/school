// グローバル変数
// TODO: gameオブジェクトを作る
let canvas = document.getElementById('shooting_game');
let context = null;

let mouseX = 0;
let mouseY = 0;

let field = null;
let machine = null;

let score = 0;


class Obj {
    constructor(context, x=0, y=0) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.children = [];
        this.enabled = true;
    }
    appendChild(obj) {
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
            if (child !== this && child.pointIsIn(this.x, this.y)) {
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
    disable() {
        this.enabled = false;
    }
    makeObject() {}
    preDraw() {}
    draw() {
        this.preDraw();
        this.makeObject();
        this.children = this.children.filter(child => child.enabled);
        for (let child of this.children) {
            child.draw();
        }
    }
}

class Shot extends Obj {
    makeObject() {
        drawCircle(this.context, this.x, this.y, 5, 'rgb(0, 0, 255)');
    }
    preDraw() {
        let collisions = this.moveTo(null, this.y - 15);
        // 敵にぶつかったら消す
        for (let collision of collisions) {
            if (collision instanceof Enemy) {
                collision.disable();
                this.disable();
                score++;
                break;
            }
        }
        // フィールドから出たら無効にする
        if (this.y < 0 || this.x < 0 || this.context.width < this.x || this.height < this.y) {
            this.disable();
        }
    }
}

class Machine extends Obj {
    makeObject() {
        drawTriangle(this.context, this.x, this.y, 50, 'rgb(255, 0, 0)')
    }
    preDraw() {
        this.moveTo(mouseX, mouseY);
    }
    shot() {
        field.appendChild(new Shot(this.context, this.x, this.y));
    }
}

class Enemy extends Obj {
    makeObject() {
        drawRect(this.context, this.x, this.y, 20, 20, 'rgb(0, 0, 0)');
    }
    preDraw() {
        let collisions = this.moveTo(
            this.x + Math.random() * 10 - Math.random() * 10,
            this.y + Math.random() * 5 - Math.random() * 5
        );
        for (let collision of collisions) {
            if (collision instanceof Machine) {
                collision.disable();
                this.disable();
                machine = null;
                break;
            }
        }
    }
}

class Field extends Obj {
    makeObject() {
        this.context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// 図形
function drawTriangle(context, x=0, y=0, edge=50, fill='rgb(255, 0, 0)') {
    const INSCRIBED_CIRCLE = 0.298;
    const CIRCUMCIRCLE = 0.577;
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(x, y - (edge * CIRCUMCIRCLE));
    context.lineTo(x + (edge / 2), y + (edge * INSCRIBED_CIRCLE));
    context.lineTo(x - (edge / 2), y + (edge * INSCRIBED_CIRCLE));
    context.closePath();
    context.fill();
}

function drawCircle(context, x=0, y=0, redius=5, fill='rgb(0, 0, 255)') {
    context.fillStyle = fill;
    context.beginPath();
    context.arc(x, y, redius, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
    context.fill();
}

function drawRect(context, x=0, y=0, width=20, height=20, fill='rgb(0, 0, 0)') {
    context.fillStyle = fill;
    context.fillRect(x - width / 2 , y - width / 2 , width, height);
}

// イベント
function onMouseMove(e) {
    let rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}

function onMouseClick(e) {
    if (machine instanceof Machine){
        machine.shot();
    }
}

// メインループ
function main() {
    field.draw();
    context.fillText('score: ' + score, 10, 20)
    requestAnimationFrame(main);
}

// 初期化
function init() {
    // Canvas取得
    if (!canvas.getContext) {
        aleart('未対応');
    }
    context = canvas.getContext('2d');
    // イベント設定
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('click', onMouseClick, false);
    // フィールド設置
    field = new Field(context);
    // 自機設置
    machine = new Machine(context, 10, 10);
    field.appendChild(machine);
    // 敵設置
    // ゲーム開始
    requestAnimationFrame(main);
}

setInterval(function() {
    let min_x = 0;
    let min_y = 0;
    let max_x = 800;
    let max_y = 450
    let x = Math.floor(Math.random() * (max_x - min_x + 1) + min_x)
    let y = Math.floor(Math.random() * (max_y - min_y + 1) + min_y)
    field.appendChild(new Enemy(context, x, y));
}, 300)


init();
