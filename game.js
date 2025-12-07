// 连接 Socket.io
const socket = io();

// 玩家 ID 和本地状态
let playerId = null;
let state = { players: {}, hand: [] };

// 初始化玩家
socket.on("player:init", (data) => {
    playerId = data.playerId;
    console.log("Player initialized:", playerId);
});

// 接收服务器状态更新
socket.on("game:stateUpdate", (serverState) => {
    if (!serverState || !serverState.players) {
        console.warn("Invalid state received:", serverState);
        return;
    }
    state = serverState;
    display();
});

// 网络事件处理
socket.on("disconnect", () => {
    alert("Disconnected from server. Please refresh the page.");
});
socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
});

// 使用卡牌
function useCard(index) {
    if (!playerId) return;
    socket.emit("game:useCard", { index });
}

// 渲染界面
function display() {
    try {
        const you = state.players[playerId];
        const opponent = Object.values(state.players).find(p => p.id !== playerId);

        if (!you || !opponent) return;

        // 更新英雄血量
        const playerHealthEl = document.getElementById("playerHealth");
        const opponentHealthEl = document.getElementById("opponentHealth");
        if (!playerHealthEl || !opponentHealthEl) return;

        playerHealthEl.textContent = you.hp;
        opponentHealthEl.textContent = opponent.hp;

        // 渲染手牌
        const inventory = document.getElementById("inventory");
        if (!inventory || !Array.isArray(you.hand)) return;

        inventory.innerHTML = "";
        you.hand.forEach((card, i) => {
            const el = document.createElement("div");
            el.className = "card";

            // 你妈死了vscode
            const nameEl = document.createElement("div");
            nameEl.textContent = card.name || "Unknown";
            const costEl = document.createElement("div");
            costEl.textContent = `Price: ${card.cost ?? 0}`;
            const descEl = document.createElement("div");
            descEl.textContent = card.desc || "";

            el.append(nameEl, costEl, descEl);
            el.onclick = () => useCard(i);

            inventory.appendChild(el);
        });

    } catch (err) {
        console.error("Error during display():", err);
    }
}
