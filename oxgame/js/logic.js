import { GreedyAI, RandomAI } from "./ai.js";

// --- Playerクラス ---
class Player {
    constructor(name, type, color) {
        this.name = name;       // 表示用
        this.type = type;       // "human" or "ai"
        this.color = color;     // 1:白, -1:黒 など
    }

    think(board) {
        if (this.type === "ai") {
            return this.aiThink(board);
        }
        return null; // humanなら入力待ち
    }

    aiThink(board) {
        // 今までのAI生成と同じ
        switch (ai_type) {
            case "greedy":
                return new GreedyAI(this.color).think(board);
            case "random":
            default:
                return new RandomAI(this.color).think(board);
        }
    }
}

