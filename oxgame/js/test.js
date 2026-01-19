function display_result() {
    const scores = board.count_stones();
    const resultElem = document.getElementById("game_result");
    resultElem.classList.remove("hidden");
    if (scores[1] > scores[0]) resultElem.textContent = "白の勝ち！";
    else if (scores[0] > scores[1]) resultElem.textContent = "黒の勝ち！";
    else resultElem.textContent = "引き分け";
}
