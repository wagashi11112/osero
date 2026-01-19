export class DomManager {
    constructor() {

            this.aiToggleBtn = document.getElementById("ai_toggle");
            this.aiSelectList = document.getElementById("select_ai");
            this.resetBtn = document.getElementById("resetbtn");
            this.aiInstant = document.getElementById("ai_instant");

            this.fightAis = document.getElementById("ai_vs_ai_toggle");
            this.fightPanel = document.getElementById("setting_panel");
            this.fightCount = document.getElementById("ai_fight_count");
            this.whiteSel = document.getElementById("ai_fighter_white");
            this.blackSel = document.getElementById("ai_fighter_black");
            this.fightInstant = document.getElementById("ai_fight_instant");
            this.fightStart = document.getElementById("ai_fight_start");
            this.fightCancel = document.getElementById("ai_fight_cancelled");
            this.fightModeBtn = document.getElementById("ai_fight_mode");
    }

    // ---- 通常AI ----
    onAiToggle(handler) {
        this.aiToggleBtn.addEventListener("click", handler);
    }

    onAiSelect(handler) {
        this.aiSelectList.addEventListener("change", e => {
            handler(e.target.value);
        });
    }

    onReset(handler) {
        this.resetBtn.addEventListener("click", handler);
    }

    onAiInstant(handler) {
        this.aiInstant.addEventListener("change", e => {
            handler(e.target.checked);
        });
    }

    // ---- AI vs AI ----
    onFightToggle(handler) {
        this.fightAis.addEventListener("click", handler);
    }

    onFightStart(handler) {
        this.fightStart.addEventListener("click", () => {
            handler({
                count: parseInt(this.fightCount.value) || 1,
                white: this.whiteSel.value,
                black: this.blackSel.value,
                instant: this.fightInstant.checked,
            });
        });
    }

    onFightCancel(handler) {
        this.fightCancel.addEventListener("click", handler);
    }

    onFightMode(handler) {
        this.fightModeBtn.addEventListener("click", handler);
    }

    // ---- 表示系（判断しない）----
    showFightPanel(show) {
        this.fightPanel.classList.toggle("hidden", !show);
    }

    setFightToggleLabel(text) {
        this.fightAis.textContent = text
    }

    setFightModeLabel(text) {
        this.fightModeBtn.textContent = text;
    }

    setAiToggleLabel(text) {
        this.aiToggleBtn.textContent = text;
    }
}
