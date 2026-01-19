export class BoardUi {
    constructor(board, root) {
        this.board = board;
        this.root = root;
        this.cells = [];
        this.clickHandler = null;
        this.init();
        this.black_score = document.getElementById("black_count");
        this.white_score = document.getElementById("white_count");
    }

    init() {
        for (let y = 0; y < 8; y++) {
            this.cells[y] = [];
            for (let x = 0; x < 8; x++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.addEventListener("click", () => {
                    if (!cell.classList.contains("hint")) return;
                    if (this.clickHandler) {
                        this.clickHandler(y, x);
                    }
                });
                this.root.appendChild(cell);
                this.cells[y][x] = cell;
            }
        }
        this.render_board();
    }

    onCellClick(handler) {
        this.clickHandler = handler;
    }


    set_locked(islocked) {
        this.root.style.pointerEvents = islocked ? "none" : "auto"
    }

    set_turn(color, scores) {
        this.update_hints(color)
        this.update_score(scores)
        this.render_board()
    }

    update_hints(moves) {
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                this.cells[y][x].classList.remove("hint");
            }
        }
        for (const [hy, hx] of moves) {
            this.cells[hy][hx].classList.add("hint");
        }
    }


    update_score(scores) {
        this.black_score.textContent = scores[0];
        this.white_score.textContent = scores[1];

    }

    render_board() {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const cell = this.cells[y][x];
                cell.innerHTML = "";
                const v = this.board.data[y][x]
                if (v === 1 || v === -1) {
                    const piece = document.createElement("div");
                    piece.className = v === 1 ? "piece_black" : "piece_white";
                    cell.appendChild(piece);
                }
            }
        }
    }
}