const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("database.db");

const ADMIN_PASSWORD = "allordinateur";

// DB
db.run(`
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    creneau TEXT,
    nom TEXT,
    prenom TEXT
)
`);

// GET
app.get("/reservations", (req, res) => {
    db.all("SELECT * FROM reservations", [], (err, rows) => {
        res.json(rows);
    });
});

// POST
app.post("/reservation", (req, res) => {
    const { date, creneau, nom, prenom } = req.body;

    db.get(
        "SELECT * FROM reservations WHERE date = ? AND creneau = ?",
        [date, creneau],
        (err, row) => {
            if (row) return res.status(400).json({ error: "Déjà réservé" });

            db.run(
                "INSERT INTO reservations (date, creneau, nom, prenom) VALUES (?, ?, ?, ?)",
                [date, creneau, nom, prenom],
                () => res.json({ ok: true })
            );
        }
    );
});

// ADMIN
app.post("/login", (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        res.json({ ok: true });
    } else {
        res.status(401).json({ error: "Mot de passe incorrect" });
    }
});

app.get("/admin-data", (req, res) => {
    db.all("SELECT * FROM reservations ORDER BY date", [], (err, rows) => {
        res.json(rows);
    });
});

app.delete("/delete-reservation/:id", (req, res) => {
    db.run("DELETE FROM reservations WHERE id = ?", [req.params.id], function(err) {
        res.json({ ok: true });
    });
});

app.listen(3000, () => {
    console.log("http://localhost:3000");
});