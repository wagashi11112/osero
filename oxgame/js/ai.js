export class BaseAI {
    constructor(color) {
        this.color = color;
    }

    think(board){
        throw new Error("think() must be implemented");
    }
}

export class RandomAI extends BaseAI{
    think(board) {
        const moves = board.get_legal_moves(this.color);
        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }
}

export class GreedyAI extends BaseAI{
    think(board) {
        const moves = board.get_legal_moves(this.color);
        if (moves.length === 0) return null;
        let best = null;
        let max = -1;
        for (const[y,x] of moves){
            const count = board.count_flips(y,x,this.color);
            if (count > max) {
                max = count
                best = [y,x]
            }
        }
        return best
    }
}

// --- 評価関数AI ---
export class EvalAI extends BaseAI {
    think(board) {
        const moves = board.get_legal_moves(this.color);
        if (moves.length === 0) return null;

        // 盤面の各マスの価値
        const boardValue = [
            [100, -20, 10, 5, 5, 10, -20, 100],
            [-20, -50, -2, -2, -2, -2, -50, -20],
            [10, -2, 0, 0, 0, 0, -2, 10],
            [5, -2, 0, 0, 0, 0, -2, 5],
            [5, -2, 0, 0, 0, 0, -2, 5],
            [10, -2, 0, 0, 0, 0, -2, 10],
            [-20, -50, -2, -2, -2, -2, -50, -20],
            [100, -20, 10, 5, 5, 10, -20, 100]
        ];

        let bestMove = moves[0];
        let bestScore = -Infinity;

        for (const [y, x] of moves) {
            // 仮想盤面で置く
            const tmpBoard = board.clone();
            tmpBoard.place(y, x, this.color);
            tmpBoard.next_turn();


            // 評価関数
            let score = 0;
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (tmpBoard.data[i][j] === this.color) score += boardValue[i][j];
                    else if (tmpBoard.data[i][j] === -this.color) score -= boardValue[i][j];

                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = [y, x];
            }
        }

        return bestMove;
    }
}