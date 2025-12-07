const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};
let nextId = 1;

function createCard() {
    return [
        { name: "Strike", cost: 1, desc: "deal 2 damage", type: "atk", value: 2 },
        { name: "Shield", cost: 1, desc: "reduce 2 damage", type: "def", value: 2 },
        { name: "Heal", cost: 1, desc: "heal 2 hp", type: "heal", value: 2 }
    ][Math.floor(Math.random() * 3)];
}

function broadcastState() {
    io.emit("state", { players });
}

io.on("connection", (socket) => {
    const id = "P" + nextId++;
    players[id] = { id, hp: 20, hand: [], defense: 0 };

    socket.emit("init", { playerId: id });

    socket.on("useCard", ({ index }) => {
        const p = players[id];
        const card = p.hand[index];
        if (!card) return;

        p.hand.splice(index, 1);
        p.defense = 0;

        const opponent = Object.values(players).find(x => x.id !== id);

        if (card.type === "atk") opponent.hp -= Math.max(0, card.value - opponent.defense);
        if (card.type === "def") p.defense = card.value;
        if (card.type === "heal") p.hp += card.value;

        broadcastState();
    });

    socket.on("disconnect", () => delete players[id]);
});

setInterval(() => {
    for (const p of Object.values(players)) {
        if (p.hand.length < 5) p.hand.push(createCard());
    }
    broadcastState();
}, 2000);

http.listen(3000, () => console.log("Server running on 3000"));
