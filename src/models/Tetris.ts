//src/models/Tetris.ts
import * as m from 'mithril'

class Config {
    static BlockSize: number = 30;
    static Mid = 8;
    static Max = 15;
    static Min = 1;
    static Bottom = 30;
    static FrameTime = 350; // ms - same value as in CSS!
}


enum Blocks {
    L, J, O, S, Z, I, T
}

enum Orientation {
    North, East, South, West
}

function randomInt(min: number, max: number) { // min inclusive, max inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Block {
    constructor() {
        this.type = randomInt(0, Object.keys(Blocks).length / 2 - 1);
        this.posX = Config.Mid;
        this.posY = 2;
        this.Direction = 0;
    }
    type: Blocks;
    posX: number;
    posY: number;
    Direction: Orientation;
    getOffsets = () => {
        let cords = [[0, 0]];
        switch (this.type) {
            case (Blocks.T): return [[-1, 0, 1, 0], [0, 0, 0, 1]];
            case (Blocks.S): return [[-1, 0, 0, 0], [0, -1, 1, -1]];
            case (Blocks.Z): return [[-1, 0, 0, 0], [0, 1, 1, 1]];
            case (Blocks.I): return [[-1, 0, 2, 0]];
            case (Blocks.J): return [[0, -1, 0, 1], [1, -1, 1, -1]];
            case (Blocks.L): return [[0, -1, 0, 1], [-1, -1, -1, -1]];
            case (Blocks.O): return [[0, 0, 1, 1]];
        }
    }

    getCoordinates = () => {
        return this.getCoordinatesR().map(a => [this.posX + a[0], this.posY + a[1]]);
    }

    moveLeft = () => this.moveHorizontal(-1);
    moveRight = () => this.moveHorizontal(1);

    moveHorizontal = (n: number) => {
        if (n == 0) return true;
        var deny = false;
        this.getCoordinates().forEach(x => {
            var xn = x[0] + n;
            var yn = x[1];
            if (xn < 1 || xn > Config.Max || Game.Reserved[yn][xn] != -1) {
                deny = true;
            }
        });
        if (!deny) {
            this.posX += n;
        }
        return deny;
    }

    private getCoordinatesR = () => {
        let cords = [[0, 0]];
        switch (this.type) {
            case (Blocks.T): return cords.concat([[1, 0], [-1, 0], [0, 1]]).map(a => this.applyTurn(a));
            case (Blocks.S): return cords.concat([[-1, 0], [0, -1], [1, -1]]).map(a => this.applyTurn(a));
            case (Blocks.Z): return cords.concat([[-1, 0], [0, 1], [1, 1]]).map(a => this.applyTurn(a));
            case (Blocks.I): return cords.concat([[-1, 0], [1, 0], [2, 0]]).map(a => this.applyTurn(a));
            case (Blocks.J): return cords.concat([[0, 1], [0, -1], [1, -1]]).map(a => this.applyTurn(a));
            case (Blocks.L): return cords.concat([[0, 1], [0, -1], [-1, -1]]).map(a => this.applyTurn(a));
            case (Blocks.O): return cords.concat([[1, 1], [0, 1], [1, 0]]).map(a => this.applyTurn(a));
        }
    }

    Turned = 0;

    TurnLeft = () => {
        var valid = true;
        this.getCoordinates().forEach(x => {
            var xn = x[0];
            var yn = x[1];
            if (xn < 1 || xn > Config.Max || Game.Reserved[yn][xn] != -1) {
                valid = false;
            }
        });
        if (!valid) return; // if not valid before => don't turn
        this.Turned += 1;
        this.getCoordinates().forEach(x => {
            var xn = x[0];
            var yn = x[1];
            if (xn < 1 || xn > Config.Max || Game.Reserved[yn][xn] != -1) {
                valid = false;
            }
        });
        if (!valid) { // if not valid any longer => undo turn
            this.Turned -= 1;
        }
    }

    TurnRight = () => {
        var valid = true;
        this.getCoordinates().forEach(x => {
            var xn = x[0];
            var yn = x[1];
            if (xn < 1 || xn > Config.Max || Game.Reserved[yn][xn] != -1) {
                valid = false;
            }
        });
        if (!valid) return; // if not valid before => don't turn
        this.Turned += 3;
        this.getCoordinates().forEach(x => {
            var xn = x[0];
            var yn = x[1];
            if (xn < 1 || xn > Config.Max || Game.Reserved[yn][xn] != -1) {
                valid = false;
            }
        });
        if (!valid) { // if not valid any longer => undo turn
            this.Turned -= 3;
        }
    }

    applyTurn = (a: number[]) => {
        this.Turned = (this.Turned) % 4;
        switch (this.Turned) {
            case (0): return a;
            case (1): return [a[1], -a[0]];
            case (2): return [-a[0], -a[1]];
            case (3): return [-a[1], a[0]];
        }
        return a;
    }

    getView = (x: number, y: number) => {
        return m('.grid-item', { style: `background-color: var(--${Blocks[this.type]});grid-area: ${this.posY + y}/${this.posX + x}/${this.posY + y}/${this.posX + x};` }, " ")
    }

    getView2 = (x: number[], active = false) => {
        return m(`.grid-item${active ? '.active' : ''}`, { style: `background-color: var(--${Blocks[this.type]});grid-area: ${this.posY + x[1]}/${this.posX + x[0]}/${this.posY + x[3] + 1}/${this.posX + x[2] + 1};` }, " ")

    }
    view2 = (vnode: m.Vnode<{}, {}>) => {
        return this.getOffsets().map(a => this.getView2(a));
    }
    viewActive = (vnode: m.Vnode<{}, {}>) => {
        // return this.getOffsets().map(a => this.getView2(a, true));
        return this.getCoordinatesR().map(a => this.getView(a[0], a[1]));

    }
    view = (vnode: m.Vnode<{}, {}>) => {
        return this.getCoordinatesR().map(a => this.getView(a[0], a[1]));
    }
}



export abstract class Game {

    public static Running: Boolean = false;
    // static Blocks: number[][] = [];
    static Active: Block = new Block();

    static Keys: { [id: string]: boolean } = {};


    static Reserved: number[][] = [];

    static first = false;

    static moveH = 0;
    static Points = 0;
    private static _points = [0, 10, 25, 50, 100];
    static Reset = () => {
        console.log("Reset");
        Game.Points = 0;
        if (!Game.first) {
            Game.first = true;
            document.body.addEventListener('keydown', e => {
                switch (e.code) {
                    case ("ArrowLeft"):
                        Game.Active.moveLeft();
                        m.redraw();
                        break;
                    case ("ArrowRight"):
                        Game.Active.moveRight();
                        m.redraw();
                        break;
                    case ("ArrowUp"):
                        Game.Active.TurnLeft();
                        m.redraw();
                        break;
                    case ("ArrowDown"):
                        Game.Active.TurnRight();
                        m.redraw();
                        break;
                    case ("KeyR"):
                        Game.Reset();
                        break;
                    case ("Space"): Game.DropBlock(); break;
                }
            });
        }
        Game.moveH = 0;
        Game.Active = new Block();
        Game.Reserved = []
        Array(Config.Max + 2)
        Game.Reserved.push(Array(Config.Bottom + 1).fill(-1));
        for (var y = 0; y < Config.Bottom - 1; y++) {
            Game.Reserved.push(Game.clearLine());
        }
        Game.Reserved.push(Array(Config.Max + 2).fill(-2));
        return false;
    }

    static clearLine = () => {
        var cl = Array(Config.Max + 2).fill(-1);
        for (var x = 0; x < cl.length; x++) {
            if (x < Config.Min || x > Config.Max) {
                cl[x] = -2;
            }
        }
        return cl;
    }

    private static init = Game.Reset();
    static Touching = () => {
        var touching = false;
        var c = Game.Active.getCoordinates();
        c.forEach(a => {
            var x = a[0];
            var y = a[1];
            if (Game.Reserved[y][x] != -1) {
                touching = true;
            }
        });
        if (touching) {
            console.log(Game.Reserved);
            console.log("Touching!");
        }
        return touching;
    }

    static ftTemp = Config.FrameTime;
    static DropBlock = () => {
        Config.FrameTime = 10;
    }

    static PutDownBlock = () => {
        Config.FrameTime = Game.ftTemp;
        var c = Game.Active.getCoordinates();
        var ys: number[] = [];
        c.forEach(a => {
            var x = a[0];
            var y = a[1] - 1;
            console.log("laying down at " + x + " " + (y + 1));
            Game.Reserved[y][x] = Game.Active.type;
            ys.push(y);
            if (y <= 2) {
                console.log("Y < 2");
                Game.Reset();
            }
        }
        );
        return ys;
    }
    static getViewBlock = (x: number, y: number, t: Blocks) => {
        return m('.grid-item', { style: `background-color: var(--${Blocks[t]});grid-area: ${y}/${x}/${y}/${x};` }, " ")
    }


    static view = (vnode: m.Vnode<{}, {}>) => {
        if (!Game.Running) {
            Game.Running = true;
            setTimeout(Game.nextStep, Config.FrameTime);
        }
        var blocks = Game.Active.viewActive(vnode);
        for (var x = Config.Min; x <= Config.Max; x++) {
            for (var y = 1; y <= Config.Bottom; y++) {
                blocks.push(Game.getViewBlock(x, y + 1, Game.Reserved[y][x]));
            }
        }

        return m('.tetris-grid', [Game.Active.viewActive(vnode), blocks]);
    }

    static nextStep = () => {
        if (Game.Running) {
            m.redraw();
            setTimeout(Game.nextStep, Config.FrameTime);
        }
        Game.Active.posY++;
        Game.moveH = 0;
        if (Game.Touching()) {
            let ys = Game.PutDownBlock();
            Game.deleteLines(ys);

            Game.Active = new Block();
            return true;
        }
        return false;
    }

    static deleteLines = (yi: number[]) => {
        var ys: number[] = [];
        for (var y = 0; y < Config.Bottom; y++) {
            if (yi.indexOf(y) > -1) {
                var line = true;
                for (var x = Config.Min; x <= Config.Max; x++) {
                    if (Game.Reserved[y][x] == -1) {
                        line = false;
                        break;
                    }
                }
                if (line) {
                    ys.push(y);
                }
            }
        }
        console.log(ys);
        Game.Points += Game._points[ys.length];
        ys.forEach(yDel => {
            for (var y = yDel; y >= 1; y--) {
                Game.Reserved[y] = Game.Reserved[y - 1];
            }
            Game.Reserved[0] = Game.clearLine();

        });
    }
}

export default {
    view(vnode) {
        return Game.view(vnode);
    }
} as m.Component<{}, {}>