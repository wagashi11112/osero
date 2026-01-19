import { Board } from "./board.js";
import { BoardUi } from "./ui.js";
import { GreedyAI, RandomAI, EvalAI } from "./ai.js";
import { DomManager } from "./dom.js";

// --- Player ---
class Player {
    constructor(name, type, color, aiType = "random") {
        this.name = name;
        this.type = type; // human / ai
        this.color = color;
        this.aiType = aiType;
    }

    think(board) {
        if (this.type !== "ai") return null;
        switch (this.aiType) {
            case "greedy": return new GreedyAI(this.color).think(board);
            case "eval": return new EvalAI(this.color).think(board);
            default: return new RandomAI(this.color).think(board);
        }
    }
}

// --- TurnManager ---
/**
 * ターンマネージャーはターン処理することだけに注力するべき
 * UI,勝利判定は別のやつがするべき
 */
class TurnManager {
    constructor(board) {
        this.board = board;
        this.players = [];
    }

    setPlayers(p1, p2) {
        this.players = [p1, p2];
    }

    commitMove() {
        const next = this.board.getNextTurn(this.board.turn);
        if (next === null) return false;

        this.board.turn = next;
        return true;
    }


    async doTurn(y, x) {
        this.board.place(y, x, this.board.turn);
        return this.commitMove();
    }

    async passTurn() {
        console.log("pass")
        return this.commitMove();
    }

    async stepTurn(moves = null) {
        if (moves === null) return this.passTurn()
        else return this.doTurn(moves[0], moves[1])
    }

    getCurrentPlayer() {
        return this.players.find(p => p.color === this.board.turn);
    }

}

/**
 * Main
 * こいつはゲームの進行をするべき
 * ui操作はこいつを介してするべき
 */

class Main {
    constructor() {
        this.init()
        this.player1 = new Player("先手", "human", this.WHITETURN);
        this.player2 = new Player("後手", "human", this.BLACKTURN);
        this.board = new Board()
        this.ui = new BoardUi(this.board, document.querySelector(".board"))
        this.turnManager = new TurnManager(this.board);
        this.dom = new DomManager()
        this.domInit()
        this.runGame()
    }

    init() {
        this.WHITETURN = 1
        this.BLACKTURN = -1
        this.aiDelay = 500
        this.isAiEnabled = false
        this.isAiFightEnabled = false
        this.isCancelled = false
        this.fighting = false
        this.fightMode = "observe";
    }

    async handleCellClick(y, x) {
        const result = await this.turnManager.stepTurn([y, x]);
        if (!result) return;

        this.ui.set_turn(
            this.board.get_legal_moves(this.board.turn),
            this.board.count_stones()
        );
    }

    waitHumanMove() {
        return new Promise(resolve => {
            this.ui.set_locked(false);

            const handler = (y, x) => {
                this.ui.set_locked(true);
                this.ui.onCellClick(null); // ハンドラ解除
                resolve([y, x]);
            };

            this.ui.onCellClick(handler);
        });
    }




    domInit() {
        this.dom.onAiToggle(this.toggleAi.bind(this));
        this.dom.onAiSelect(this.selectAi.bind(this));
        this.dom.onAiInstant(this.changeDelay.bind(this));
        this.dom.onReset(this.reset.bind(this));
        this.dom.onFightToggle(this.fightAis.bind(this));
        this.dom.onFightMode(this.changeMode.bind(this));
        this.dom.onFightCancel(this.cancellFight.bind(this));
        this.dom.onFightStart(this.startFight.bind(this));
    }


    toggleAi() {
        this.isAiEnabled = !this.isAiEnabled
        this.dom.setAiToggleLabel(this.isAiEnabled ? "AI: ON" : "AI: OFF");
        this.player2.type = this.isAiEnabled ? "ai" : "human";
        this.player2.aiType = this.dom.aiSelectList.value;
        this.turnManager.setPlayers(this.player1, this.player2)
    }

    selectAi() {
        this.player2.aiType = this.dom.aiSelectList.value;
    }

    changeDelay() {
        if (this.fighting) return
        this.aiDelay = this.dom.aiInstant.checked ? 0 : 500;
    }

    reset() {
        if (this.fighting) return
        this.board.create_board();
        this.ui.set_turn(
            this.board.get_legal_moves(this.board.turn),
            this.board.count_stones()
        )
        this.runGame()
    }

    fightAis() {
        this.isAiFightEnabled = !this.isAiFightEnabled;
        this.dom.showFightPanel(this.isAiFightEnabled)
        this.dom.setFightToggleLabel(this.isAiFightEnabled ? "AI VS AI: ON" : "AI VS AI: OFF")
    }

    changeMode() {
        this.fightMode = this.fightMode === "observe" ? "auto" : "observe";
        this.dom.setFightModeLabel(this.fightMode)
    }

    cancellFight() {
        this.isCancelled = true
    }

    async startFight(count, white, black, instant) {
        if (this.fighting) return;   // ← 連打防止
        this.fighting = true;
        const games = this.fightMode === "observe" ? 1 : count;
        this.ui.set_locked(true);
        const results = []
        for (let gameCount = 1; gameCount <= games; ++gameCount) {
            if (this.isCancelled) break
            this.turnManager.setPlayers(
                new Player("白AI", "ai", 1, white),
                new Player("黒AI", "ai", -1, black)
            );
            if (instant && this.fightMode === "observe") {
                this.aiDelay = 50
            }
            else if (instant) {
                this.aiDelay = 0
            }
            else this.aiDelay = 500

            console.log(instant)

            this.board.create_board();
            this.ui.set_turn(
                this.board.get_legal_moves(this.board.turn),
                this.board.count_stones()
            );

            const result = await this.runAutoGame();
            results.push(result)
        }
        this.isCancelled = false
        this.ui.set_locked(false);
        this.fighting = false
        displayFightResults(results)
        this.runGame()
    }

    async runGame() {
        this.turnManager.setPlayers(this.player1, this.player2)
        this.ui.set_turn(
            this.board.get_legal_moves(this.board.turn),
            this.board.count_stones()
        )
        while (true) {
            if (this.board.is_finished()) break;

            const currentPlayer = this.turnManager.getCurrentPlayer()
            let move = null

            if (currentPlayer.type === "human") {
                move = await this.waitHumanMove()
            } else {
                move = currentPlayer.think(this.board)
                if (this.aiDelay > 0) {
                    await sleep(this.aiDelay)
                }
            }

            const result = await this.turnManager.stepTurn(move)
            this.ui.set_turn(
                this.board.get_legal_moves(this.board.turn),
                this.board.count_stones()
            )
            if (!result) break
        }
        displayResult(this.board.getData())
    }

    async runAutoGame() {
        while (true && !this.isCancelled) {
            if (this.board.is_finished()) break
            const currentPlayer = this.turnManager.getCurrentPlayer()
            let move
            move = currentPlayer.think(this.board)
            console.log(move)
            if (this.aiDelay > 0) {
                await sleep(this.aiDelay)
            }
            const result = await this.turnManager.stepTurn(move)
            if (this.fightMode === "observe") {
                this.ui.set_turn(
                    this.board.get_legal_moves(this.board.turn),
                    this.board.count_stones()
                )
            }
            if (!result) break
        }
        this.isCancelled = false
        return this.board.getData()
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function displayResult({ winner }) {
    const e = document.getElementById("game_result");
    e.classList.remove("hidden");
    e.textContent = winner;
}

function displayFightResults(results) {
    let w = 0, b = 0, d = 0;
    let tw = 0, tb = 0;

    results.forEach(r => {
        tw += r.white;
        tb += r.black;
        if (r.white > r.black) w++;
        else if (r.black > r.white) b++;
        else d++;
    });

    const g = results.length;
    document.getElementById("fight_result_panel").classList.remove("hidden");
    document.getElementById("fight_result_content").innerHTML = `
        <p>ゲーム数: ${g}</p>
        <p>白勝率: ${(w / g * 100).toFixed(1)}% / 平均 ${(tw / g).toFixed(1)}</p>
        <p>黒勝率: ${(b / g * 100).toFixed(1)}% / 平均 ${(tb / g).toFixed(1)}</p>
        <p>引き分け: ${(d / g * 100).toFixed(1)}%</p>
    `;
}

const main = new Main()