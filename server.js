const express = require("express");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new Database("reservations.db");

const ADMIN_PASSWORD = "allordinateur";

// DB
db.prepare(`
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    creneau TEXT,
    nom TEXT,
    prenom TEXT
)
`).run();

// GET
app.get("/reservations", (req, res) => {
    const rows = db.prepare("SELECT * FROM reservations").all();
    res.json(rows);
});

// POST
app.post("/reservation", (req, res) => {
    const { date, creneau, nom, prenom } = req.body;

    const existing = db
        .prepare("SELECT * FROM reservations WHERE date = ? AND creneau = ?")
        .get(date, creneau);

    if (existing) {
        return res.status(400).json({ error: "Déjà réservé" });
    }

    db.prepare(
        "INSERT INTO reservations (date, creneau, nom, prenom) VALUES (?, ?, ?, ?)"
    ).run(date, creneau, nom, prenom);

    res.json({ ok: true });
});

// ADMIN LOGIN
app.post("/login", (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        res.json({ ok: true });
    } else {
        res.status(401).json({ error: "Mot de passe incorrect" });
    }
});

// ADMIN DATA
app.get("/admin-data", (req, res) => {
    const rows = db
        .prepare("SELECT * FROM reservations ORDER BY date")
        .all();

    res.json(rows);
});

// DELETE
app.delete("/delete-reservation/:id", (req, res) => {
    db.prepare("DELETE FROM reservations WHERE id = ?")
      .run(req.params.id);

    res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Serveur lancé sur le port " + PORT);
});