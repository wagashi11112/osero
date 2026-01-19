export class Board {
    constructor() {
        this.data = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.turn = 1
        this.create_board()
    }

    create_board() {
        this.turn = 1
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                this.data[y][x] = null
            }
        }
        this.data[3][3] = this.data[4][4] = -1;
        this.data[4][3] = this.data[3][4] = 1;
    }

    place(y, x, color) {
        const path = this.check_direction(y, x, color)
        if (path.length === 0) return
        this.data[y][x] = color
        this.revese(path, color)
    }

    getNextTurn(current) {
        const opponent = -current;

        if (this.can_place(opponent)) return opponent;
        if (this.can_place(current)) return current;
        return null; // 両方打てない
    }


    is_finished() {
        return !this.can_place(1) && !this.can_place(-1);
    }

    get_legal_moves(color) {
        const moves = []
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                if (this.data[y][x] === null &&
                    this.check_direction(y, x, color).length > 0
                ) {
                    moves.push([y, x]);
                }
            }
        }
        return moves
    }

    can_place(color) {
        return this.get_legal_moves(color).length > 0;
    }

    check_direction(y, x, color) {
        const checked_pieces = []
        const dic = [[-1, -1], [-1, 0], [-1, 1],
        [0, -1],/*center*/[0, 1],
        [1, -1], [1, 0], [1, 1]];
        for (const [dy, dx] of dic) {
            const check_pieces = [];
            let nx = x + dx;
            let ny = y + dy;
            while (0 <= nx && 8 > nx && 0 <= ny && 8 > ny) {
                if (this.data[ny][nx] === null) break;
                if (this.data[ny][nx] === color) {
                    if (check_pieces.length > 0) checked_pieces.push(...check_pieces);
                    break;
                }
                check_pieces.push([ny, nx]);
                ny += dy;
                nx += dx;
            }
        }
        return checked_pieces
    }

    count_flips(y, x, color) {
        return this.check_direction(y, x, color).length
    }

    count_stones() {
        let black_stones = 0
        let white_stones = 0
        for (let y = 0; y < 8; ++y) {
            for (let x = 0; x < 8; ++x) {
                if (this.data[y][x] === 1) {
                    black_stones += 1;
                } if (this.data[y][x] === -1) {
                    white_stones += 1;
                }
            }
        }
        return [black_stones, white_stones]
    }

    revese(path, color) {
        for (const [ry, rx] of path) {
            this.data[ry][rx] = color;
        }
    }

    getData() {
        const [black, white] = this.count_stones();
        return {
            white,
            black,
            winner:
                white > black ? "white" :
                    black > white ? "black" :
                        "draw"
        };
    }

    clone() {
        const newBoard = new Board();
        newBoard.turn = this.turn;
        newBoard.data = this.data.map(row => [...row]);
        return newBoard;
    }
}