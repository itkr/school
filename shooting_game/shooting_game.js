// グローバル変数
// TODO: gameオブジェクトを作る
// TODO: JSON読み込み
// TODO: API呼び出し
// TODO: 最高点など記録(session storage)
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
    controllCollisions(collisions){
        for (let collision of collisions) {
            if (collision instanceof Enemy) {
                collision.disable();
                this.disable();
                score++;
                break;
            }
        }
    }
    preDraw() {
        let collisions = this.moveTo(null, this.y - 15);
        // 敵にぶつかったら消す
        this.controllCollisions(collisions);
        // フィールドから出たら無効にする
        if (this.y < 0 || this.x < 0 || this.context.width < this.x || this.height < this.y) {
            this.disable();
        }
    }
}

class Machine extends Obj {
    makeObject() {
        drawTriangle(this.context, this.x, this.y, 30, 'rgb(255, 0, 0)')
    }
    preDraw() {
        this.moveTo(mouseX, mouseY);
    }
    shot() {
        field.appendChild(new Shot(this.context, this.x, this.y));
    }
}

class Enemy extends Obj {
    constructor(context, x=0, y=0, move=null) {
        super(context, x, y);
        this.move = move !== null ? move: this.defaultMove;
    }
    defaultMove(x, y) {
        let _x = x + Math.random() * 10 - Math.random() * 10
        let _y = y + Math.random() * 5 - Math.random() * 5
        return [_x, _y]
    }
    makeObject() {
        drawRect(this.context, this.x, this.y, 20, 20, 'rgb(0, 0, 0)');
    }
    controllCollisions(collisions) {
        for (let collision of collisions) {
            if (collision instanceof Machine) {
                collision.disable();
                this.disable();
                machine = null;
                break;
            }
        }
    }
    preDraw() {
        let point = this.move(this.x, this.y)
        let collisions = this.moveTo(point[0], point[1]);
        this.controllCollisions(collisions);
    }
}

class LinerEnemy extends Enemy {
    defaultMove(x, y){
        return [x - randint(1, 5), y - randint(1, 5)];
    }
}

class Bomb extends Obj {
    makeObject() {
        drawCircle(this.context, this.x, this.y, 10, 'rgb(255, 255, 255)', 'rgb(0, 0, 0)');
    }
    controllCollisions(collisions) {
        for (let collision of collisions) {
            if (collision instanceof Machine) {
                this.disable();
                for (let child of field.children) {
                    if (child instanceof Enemy) {
                        child.disable();
                    }
                }
                score -= 10;
                break;
            }
        }
    }
    preDraw() {
        let collisions = this.moveTo(this.x, this.y + 4);
        this.controllCollisions(collisions);
        if (this.y < 0 || this.x < 0 || this.context.width < this.x || this.height < this.y) {
            this.disable();
        }
    }
}

class Field extends Obj {
    makeObject() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
}

// 図形
function drawTriangle(context, x, y, edge, fill) {
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

function drawCircle(context, x, y, redius, fill, stroke) {
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.beginPath();
    context.arc(x, y, redius, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
    context.fill();
    context.stroke();
}

function drawRect(context, x, y, width, height, fill) {
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
    field.context.fillStyle = 'rgb(0, 0, 0)';
    field.context.fillText('score: ' + score, 10, 20)
    requestAnimationFrame(main);
}

function randint(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from)
}

class Wave {
    constructor(field, time=3000) {
        this.field = field;
        this.time = time;
    }
    enter() {}
    exit() {}
}

class Wave1 extends Wave {
    enter() {
        let count = 10;
        let stance = this.field.context.canvas.width / count;
        let y = 0;
        for (let i=0; i<count; i++) {
            y = randint(10, this.field.context.canvas.height);
            this.field.appendChild(new Enemy(this.field.context, stance * i, y));
        }
    }
}

class Wave2 extends Wave {
    enter() {
        let that = this;
        this.wave = setInterval(function(){
            that.action(that.field.context);
        }, 300);
    }
    action() {
        let x = randint(0, this.field.context.canvas.width)
        let y = randint(0, this.field.context.canvas.height)
        this.field.appendChild(new LinerEnemy(this.field.context, this.field.context.canvas.width, y));
        this.field.appendChild(new LinerEnemy(this.field.context, x, this.field.context.canvas.height));
    }
    exit() {
        clearInterval(this.wave);
    }
}

function setWaveChain(waves) {
    let index = 0;
    let wave = waves[index];
    wave.enter();
    setInterval(function(){
        // 前回のWaveを削除
        wave.exit();
        // Machineが倒れていたら次のWaveは追加しない
        if (machine === null) {
            return;
        }
        // Waveをループさせるようにインデックスを更新
        index++;
        if (waves.length === index) {
            index = 0;
        }
        // 次のWaveをセット
        wave = waves[index];
        wave.enter();
    }, 3000)
}

// 初期化
function init() {
    // Canvas取得
    let canvas = document.getElementById('shooting_game');
    if (!canvas.getContext) {
        aleart('未対応');
        return;
    }
    let context = canvas.getContext('2d');

    // イベント設定
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('click', onMouseClick, false);

    // フィールド設置
    field = new Field(context);

    // 自機設置
    machine = new Machine(context, 10, 10);
    field.appendChild(machine);

    // 敵設置
    setWaveChain([new Wave1(field), new Wave2(field)]);

    // Bomb設置
    setInterval(function() {
        let x = randint(0, field.context.canvas.width);
        field.appendChild(new Bomb(field.context, x, 0));
    }, 5000)

    // ゲーム開始
    requestAnimationFrame(main);
}


init();
