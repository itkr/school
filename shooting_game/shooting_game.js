// グローバル変数
// TODO: gameオブジェクトを作る
let canvas = document.getElementById('shooting_game');
let mouseX = 0;
let mouseY = 0;
let context = null;
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
        this.context.fillStyle = 'rgb(00,00,255)';
        this.context.beginPath();
        this.context.arc(this.x, this.y, 5, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        this.context.fill();
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
    preDraw() {
        this.moveTo(mouseX, mouseY);
    }
    shot() {
        field.appendChild(new Shot(this.context, this.x, this.y));
    }
}

class Enemy extends Obj {
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
    field.appendChild(new Enemy(context, 200, 100));
    field.appendChild(new Enemy(context, 550, 130));
    field.appendChild(new Enemy(context, 603, 300));
    field.appendChild(new Enemy(context, 720, 200));
    // ゲーム開始
    requestAnimationFrame(main);
}

init();
