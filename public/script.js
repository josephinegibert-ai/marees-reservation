function formatDateFR(dateStr) {
    if (!dateStr) return "";

    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const d = new Date(year, month, day);

    return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

let currentDate = new Date(2026, 3); // Avril par défaut
let selectedDate = null;
let selectedSlot = null;
let reservations = [];

// INIT
async function init() {
    await loadReservations();
    renderCalendar();
    chargerMarees();
}

async function loadReservations() {
    const res = await fetch("/reservations");
    reservations = await res.json();
}

// CALENDRIER
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Janvier","Février","Mars","Avril","Mai","Juin",
        "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];

    document.getElementById("monthTitle").innerText = monthNames[month] + " " + year;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let start = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < start; i++) {
        calendar.innerHTML += `<div class="empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        let dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let today = new Date();
        let currentDayDate = new Date(year, month, d);

        let dayReservations = reservations.filter(r => r.date === dateStr);

        let color = "#e3f2fd";
        if (dayReservations.length === 1) color = "orange";
        if (dayReservations.length === 2) color = "red";

        let isPast = currentDayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());

        calendar.innerHTML += `
        <div class="day"
            style="background:${isPast ? '#ccc' : color}; cursor:${isPast ? 'not-allowed' : 'pointer'}; opacity:${isPast ? 0.6 : 1}"
            ${isPast ? '' : `onclick="selectDate(${d}, this)"`}>
            
            ${d}
            <div class="weekday">
                ${["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][new Date(year, month, d).getDay()]}
            </div>
        </div>`;
    }
}

// NAVIGATION
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    chargerMarees();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    chargerMarees();
}

// SELECTION DATE
function selectDate(day, element) {
    selectedSlot = null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    selectedDate = `${year}-${month+1}-${day}`;

    const dateText = new Date(year, month, day).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("selectedDate").innerText = dateText;

    // 🔵 surbrillance
    document.querySelectorAll(".day").forEach(d => d.classList.remove("selectedDay"));
    element.classList.add("selectedDay");

    renderSlots();
}

// CRENEAUX
function renderSlots() {
    const slotsDiv = document.getElementById("slots");

    const taken = reservations
        .filter(r => r.date === selectedDate)
        .map(r => r.creneau);

    slotsDiv.innerHTML = `
        <button 
            onclick="selectSlot('matin')" 
            class="slotBtn"
            ${taken.includes('matin') ? 'disabled style="background:#ccc;cursor:not-allowed"' : ''}>
            Matin
        </button>

        <button 
            onclick="selectSlot('après-midi')" 
            class="slotBtn"
            ${taken.includes('après-midi') ? 'disabled style="background:#ccc;cursor:not-allowed"' : ''}>
            Après-midi
        </button>
    `;
}

function selectSlot(slot) {
    selectedSlot = slot;

    document.querySelectorAll("#slots button").forEach(b => b.classList.remove("selectedSlot"));
    event.target.classList.add("selectedSlot");
}

// RESERVATION
async function reserver() {
    const prenom = document.getElementById("prenom").value;
    const nom = document.getElementById("nom").value;

    if (!selectedDate || !selectedSlot || !prenom || !nom) {
        alert("Merci de remplir tous les champs");
        return;
    }

    await fetch("/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, creneau: selectedSlot, nom, prenom })
    });

    alert(`Votre réservation le ${formatDateFR(selectedDate)} (${selectedSlot}) est confirmée`);

    await loadReservations();
    renderCalendar();
    renderSlots();
}

// MARÉES
function chargerMarees() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // 🔵 AJOUT : mise à jour du titre dynamique
    const monthNames = [
        "Janvier","Février","Mars","Avril","Mai","Juin",
        "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ];

    document.getElementById("mareeTitle").innerText =
        "Marées - " + monthNames[month] + " " + year;

    let data = [];

    // AVRIL
    if (month === 3) {
        data = [
            {j:1, pm1:"04:58", c1:89, pm2:"17:08", c2:92, bm1:"11:36", bm2:"23:48"},
            {j:2, pm1:"05:19", c1:93, pm2:"17:31", c2:93, bm1:"12:10", bm2:"--"},
            {j:3, pm1:"05:45", c1:93, pm2:"17:58", c2:91, bm1:"00:22", bm2:"12:42"},
            {j:4, pm1:"06:13", c1:89, pm2:"18:25", c2:86, bm1:"00:54", bm2:"13:13"},
            {j:5, pm1:"06:39", c1:82, pm2:"18:52", c2:78, bm1:"01:26", bm2:"13:43"},
            {j:6, pm1:"07:05", c1:73, pm2:"19:19", c2:68, bm1:"01:59", bm2:"14:14"},
            {j:7, pm1:"07:32", c1:62, pm2:"19:48", c2:56, bm1:"02:33", bm2:"14:47"},
            {j:8, pm1:"08:00", c1:50, pm2:"20:20", c2:43, bm1:"03:11", bm2:"15:26"},
            {j:9, pm1:"08:31", c1:37, pm2:"21:03", c2:32, bm1:"03:58", bm2:"16:19"},
            {j:10, pm1:"09:19", c1:27, pm2:"--", c2:"--", bm1:"05:01", bm2:"17:38"},
            {j:11, pm1:"00:43", c1:25, pm2:"13:57", c2:26, bm1:"06:23", bm2:"19:13"},
            {j:12, pm1:"01:57", c1:29, pm2:"14:47", c2:35, bm1:"07:54", bm2:"20:34"},
            {j:13, pm1:"02:47", c1:42, pm2:"15:21", c2:50, bm1:"08:59", bm2:"21:23"},
            {j:14, pm1:"03:26", c1:58, pm2:"15:49", c2:66, bm1:"09:43", bm2:"22:02"},
            {j:15, pm1:"04:00", c1:73, pm2:"16:17", c2:81, bm1:"10:21", bm2:"22:39"},
            {j:16, pm1:"04:32", c1:87, pm2:"16:45", c2:93, bm1:"10:58", bm2:"23:17"},
            {j:17, pm1:"05:04", c1:97, pm2:"17:15", c2:101, bm1:"11:36", bm2:"23:57"},
            {j:18, pm1:"05:36", c1:104, pm2:"17:46", c2:105, bm1:"12:15", bm2:"--"},
            {j:19, pm1:"06:09", c1:104, pm2:"18:18", c2:102, bm1:"00:38", bm2:"12:56"},
            {j:20, pm1:"06:44", c1:99, pm2:"18:53", c2:94, bm1:"01:22", bm2:"13:39"},
            {j:21, pm1:"07:21", c1:88, pm2:"19:31", c2:81, bm1:"02:09", bm2:"14:26"},
            {j:22, pm1:"08:03", c1:73, pm2:"20:15", c2:65, bm1:"03:02", bm2:"15:20"},
            {j:23, pm1:"09:02", c1:58, pm2:"21:26", c2:51, bm1:"04:02", bm2:"16:25"},
            {j:24, pm1:"12:52", c1:46, pm2:"--", c2:"--", bm1:"05:13", bm2:"17:41"},
            {j:25, pm1:"01:18", c1:44, pm2:"14:04", c2:44, bm1:"06:34", bm2:"19:03"},
            {j:26, pm1:"02:25", c1:47, pm2:"14:59", c2:51, bm1:"07:54", bm2:"20:16"},
            {j:27, pm1:"03:16", c1:56, pm2:"15:39", c2:61, bm1:"08:57", bm2:"21:14"},
            {j:28, pm1:"03:53", c1:66, pm2:"16:02", c2:71, bm1:"09:46", bm2:"22:01"},
            {j:29, pm1:"04:09", c1:74, pm2:"16:12", c2:77, bm1:"10:28", bm2:"22:42"},
            {j:30, pm1:"04:23", c1:80, pm2:"16:32", c2:81, bm1:"11:05", bm2:"23:19"}
        ];
    }

    // MAI
    if (month === 4) {
        data = [
            {j:1, pm1:"04:48", c1:82, pm2:"17:00", c2:82, bm1:"11:38", bm2:"23:53"},
            {j:2, pm1:"05:16", c1:82, pm2:"17:29", c2:82, bm1:"12:10", bm2:"--"},
            {j:3, pm1:"05:45", c1:80, pm2:"17:58", c2:78, bm1:"00:26", bm2:"12:41"},
            {j:4, pm1:"06:13", c1:76, pm2:"18:27", c2:73, bm1:"01:00", bm2:"13:13"},
            {j:5, pm1:"06:42", c1:69, pm2:"18:58", c2:66, bm1:"01:35", bm2:"13:47"},
            {j:6, pm1:"07:13", c1:62, pm2:"19:32", c2:57, bm1:"02:13", bm2:"14:23"},
            {j:7, pm1:"07:47", c1:53, pm2:"20:14", c2:48, bm1:"02:53", bm2:"15:04"},
            {j:8, pm1:"08:29", c1:44, pm2:"21:48", c2:40, bm1:"03:39", bm2:"15:58"},
            {j:9, pm1:"11:04", c1:37, pm2:"23:44", c2:35, bm1:"04:34", bm2:"17:05"},
            {j:10, pm1:"12:38", c1:35, pm2:"--", c2:"--", bm1:"05:39", bm2:"18:17"},
            {j:11, pm1:"00:53", c1:36, pm2:"13:40", c2:40, bm1:"06:50", bm2:"19:27"},
            {j:12, pm1:"01:51", c1:45, pm2:"14:27", c2:51, bm1:"07:56", bm2:"20:25"},
            {j:13, pm1:"02:39", c1:57, pm2:"15:06", c2:64, bm1:"08:51", bm2:"21:14"},
            {j:14, pm1:"03:22", c1:70, pm2:"15:42", c2:77, bm1:"09:38", bm2:"22:00"},
            {j:15, pm1:"04:01", c1:83, pm2:"16:13", c2:88, bm1:"10:22", bm2:"22:46"},
            {j:16, pm1:"04:38", c1:92, pm2:"16:47", c2:96, bm1:"11:06", bm2:"23:32"},
            {j:17, pm1:"05:16", c1:98, pm2:"17:23", c2:99, bm1:"11:50", bm2:"--"},
            {j:18, pm1:"05:55", c1:99, pm2:"18:02", c2:97, bm1:"00:19", bm2:"12:36"},
            {j:19, pm1:"06:38", c1:95, pm2:"18:44", c2:91, bm1:"01:09", bm2:"13:25"},
            {j:20, pm1:"07:25", c1:87, pm2:"19:33", c2:81, bm1:"02:02", bm2:"14:17"},
            {j:21, pm1:"08:26", c1:76, pm2:"20:35", c2:70, bm1:"02:57", bm2:"15:14"},
            {j:22, pm1:"10:53", c1:64, pm2:"23:16", c2:59, bm1:"03:57", bm2:"16:16"},
            {j:23, pm1:"12:24", c1:55, pm2:"--", c2:"--", bm1:"05:00", bm2:"17:23"},
            {j:24, pm1:"00:44", c1:52, pm2:"13:29", c2:51, bm1:"06:08", bm2:"18:32"},
            {j:25, pm1:"01:46", c1:50, pm2:"14:20", c2:51, bm1:"07:15", bm2:"19:37"},
            {j:26, pm1:"02:35", c1:53, pm2:"14:58", c2:55, bm1:"08:15", bm2:"20:34"},
            {j:27, pm1:"03:10", c1:57, pm2:"15:19", c2:60, bm1:"09:07", bm2:"21:25"},
            {j:28, pm1:"03:29", c1:62, pm2:"15:37", c2:65, bm1:"09:52", bm2:"22:10"},
            {j:29, pm1:"03:53", c1:67, pm2:"16:05", c2:68, bm1:"10:33", bm2:"22:50"},
            {j:30, pm1:"04:25", c1:70, pm2:"16:38", c2:70, bm1:"11:10", bm2:"23:28"},
            {j:31, pm1:"04:58", c1:71, pm2:"17:11", c2:71, bm1:"11:44", bm2:"--"}
        ];
    }

    // JUIN
    if (month === 5) {
        data = [
            {j:1, pm1:"05:30", c1:71, pm2:"17:44", c2:71, bm1:"00:05", bm2:"12:19"},
            {j:2, pm1:"06:03", c1:70, pm2:"18:18", c2:69, bm1:"00:42", bm2:"12:54"},
            {j:3, pm1:"06:36", c1:68, pm2:"18:54", c2:66, bm1:"01:21", bm2:"13:31"},
            {j:4, pm1:"07:12", c1:64, pm2:"19:35", c2:62, bm1:"02:00", bm2:"14:09"},
            {j:5, pm1:"07:53", c1:59, pm2:"20:24", c2:57, bm1:"02:39", bm2:"14:50"},
            {j:6, pm1:"08:41", c1:54, pm2:"21:31", c2:52, bm1:"03:21", bm2:"15:37"},
            {j:7, pm1:"09:50", c1:50, pm2:"22:47", c2:48, bm1:"04:06", bm2:"16:30"},
            {j:8, pm1:"11:21", c1:47, pm2:"23:54", c2:47, bm1:"04:58", bm2:"17:27"},
            {j:9, pm1:"12:33", c1:47, pm2:"--", c2:"--", bm1:"05:55", bm2:"18:28"},
            {j:10, pm1:"00:55", c1:49, pm2:"13:34", c2:52, bm1:"06:56", bm2:"19:28"},
            {j:11, pm1:"01:52", c1:55, pm2:"14:26", c2:60, bm1:"07:58", bm2:"20:28"},
            {j:12, pm1:"02:47", c1:64, pm2:"15:12", c2:69, bm1:"08:56", bm2:"21:24"},
            {j:13, pm1:"03:38", c1:74, pm2:"15:52", c2:79, bm1:"09:50", bm2:"22:20"},
            {j:14, pm1:"04:28", c1:83, pm2:"16:34", c2:87, bm1:"10:42", bm2:"23:14"},
            {j:15, pm1:"05:18", c1:90, pm2:"17:17", c2:93, bm1:"11:34", bm2:"--"},
            {j:16, pm1:"06:08", c1:94, pm2:"18:05", c2:95, bm1:"00:08", bm2:"12:25"},
            {j:17, pm1:"06:58", c1:94, pm2:"18:55", c2:93, bm1:"01:02", bm2:"13:17"},
            {j:18, pm1:"07:47", c1:90, pm2:"19:47", c2:87, bm1:"01:55", bm2:"14:09"},
            {j:19, pm1:"08:32", c1:83, pm2:"20:37", c2:79, bm1:"02:48", bm2:"15:02"},
            {j:20, pm1:"09:14", c1:74, pm2:"21:25", c2:69, bm1:"03:40", bm2:"15:56"},
            {j:21, pm1:"09:56", c1:64, pm2:"22:13", c2:59, bm1:"04:34", bm2:"16:52"},
            {j:22, pm1:"12:28", c1:55, pm2:"23:05", c2:51, bm1:"05:29", bm2:"17:51"},
            {j:23, pm1:"13:26", c1:48, pm2:"--", c2:"--", bm1:"06:26", bm2:"18:50"},
            {j:24, pm1:"01:39", c1:47, pm2:"14:09", c2:46, bm1:"07:25", bm2:"19:49"},
            {j:25, pm1:"02:23", c1:46, pm2:"14:42", c2:47, bm1:"08:23", bm2:"20:46"},
            {j:26, pm1:"03:00", c1:49, pm2:"15:16", c2:51, bm1:"09:17", bm2:"21:38"},
            {j:27, pm1:"03:39", c1:54, pm2:"15:53", c2:56, bm1:"10:06", bm2:"22:27"},
            {j:28, pm1:"04:19", c1:59, pm2:"16:31", c2:61, bm1:"10:49", bm2:"23:11"},
            {j:29, pm1:"04:57", c1:63, pm2:"17:08", c2:65, bm1:"11:28", bm2:"23:52"},
            {j:30, pm1:"05:34", c1:67, pm2:"17:43", c2:69, bm1:"12:06", bm2:"--"}
        ];
    }

    // JUILLET
    if (month === 6) {
        data = [
            {j:1, pm1:"06:05", c1:70, pm2:"18:18", c2:71, bm1:"00:31", bm2:"12:42"},
            {j:2, pm1:"06:38", c1:71, pm2:"18:53", c2:72, bm1:"01:08", bm2:"13:18"},
            {j:3, pm1:"07:11", c1:72, pm2:"19:30", c2:71, bm1:"01:44", bm2:"13:54"},
            {j:4, pm1:"07:45", c1:70, pm2:"20:09", c2:69, bm1:"02:20", bm2:"14:30"},
            {j:5, pm1:"08:21", c1:68, pm2:"20:50", c2:66, bm1:"02:56", bm2:"15:10"},
            {j:6, pm1:"09:00", c1:64, pm2:"21:37", c2:61, bm1:"03:35", bm2:"15:54"},
            {j:7, pm1:"09:46", c1:59, pm2:"22:39", c2:56, bm1:"04:20", bm2:"16:44"},
            {j:8, pm1:"10:57", c1:54, pm2:"23:55", c2:52, bm1:"05:10", bm2:"17:40"},
            {j:9, pm1:"12:37", c1:52, pm2:"--", c2:"--", bm1:"06:08", bm2:"18:42"},
            {j:10, pm1:"01:11", c1:52, pm2:"13:54", c2:53, bm1:"07:12", bm2:"19:50"},
            {j:11, pm1:"02:28", c1:56, pm2:"15:00", c2:60, bm1:"08:21", bm2:"20:59"},
            {j:12, pm1:"03:41", c1:65, pm2:"15:58", c2:70, bm1:"09:29", bm2:"22:06"},
            {j:13, pm1:"04:43", c1:76, pm2:"16:48", c2:81, bm1:"10:30", bm2:"23:07"},
            {j:14, pm1:"05:35", c1:86, pm2:"17:34", c2:90, bm1:"11:26", bm2:"--"},
            {j:15, pm1:"06:18", c1:94, pm2:"18:16", c2:96, bm1:"00:03", bm2:"12:18"},
            {j:16, pm1:"06:53", c1:98, pm2:"18:56", c2:98, bm1:"00:54", bm2:"13:07"},
            {j:17, pm1:"07:24", c1:97, pm2:"19:29", c2:94, bm1:"01:42", bm2:"13:54"},
            {j:18, pm1:"07:55", c1:91, pm2:"20:05", c2:86, bm1:"02:29", bm2:"14:40"},
            {j:19, pm1:"08:25", c1:81, pm2:"20:39", c2:75, bm1:"03:13", bm2:"15:26"},
            {j:20, pm1:"08:56", c1:69, pm2:"21:13", c2:63, bm1:"03:58", bm2:"16:13"},
            {j:21, pm1:"09:31", c1:57, pm2:"21:51", c2:50, bm1:"04:43", bm2:"17:03"},
            {j:22, pm1:"10:15", c1:45, pm2:"22:38", c2:40, bm1:"05:33", bm2:"17:58"},
            {j:23, pm1:"11:24", c1:37, pm2:"--", c2:"--", bm1:"06:30", bm2:"19:00"},
            {j:24, pm1:"01:43", c1:35, pm2:"14:21", c2:35, bm1:"07:36", bm2:"20:07"},
            {j:25, pm1:"02:53", c1:37, pm2:"15:10", c2:40, bm1:"08:45", bm2:"21:14"},
            {j:26, pm1:"03:45", c1:44, pm2:"15:52", c2:48, bm1:"09:46", bm2:"22:12"},
            {j:27, pm1:"04:26", c1:53, pm2:"16:29", c2:57, bm1:"10:36", bm2:"22:59"},
            {j:28, pm1:"05:00", c1:61, pm2:"17:03", c2:65, bm1:"11:17", bm2:"23:39"},
            {j:29, pm1:"05:29", c1:69, pm2:"17:35", c2:72, bm1:"11:53", bm2:"--"},
            {j:30, pm1:"05:57", c1:75, pm2:"18:05", c2:78, bm1:"00:15", bm2:"12:26"},
            {j:31, pm1:"06:22", c1:80, pm2:"18:36", c2:82, bm1:"00:48", bm2:"12:59"}
        ];
    }

    // AOUT
    if (month === 7) {
        data = [
        {j:1, pm1:"06:51", c1:83, pm2:"19:07", c2:83, bm1:"01:21", bm2:"13:32"},
        {j:2, pm1:"07:20", c1:83, pm2:"19:39", c2:82, bm1:"01:54", bm2:"14:05"},
        {j:3, pm1:"07:50", c1:80, pm2:"20:13", c2:77, bm1:"02:28", bm2:"14:41"},
        {j:4, pm1:"08:22", c1:74, pm2:"20:47", c2:70, bm1:"03:04", bm2:"15:21"},
        {j:5, pm1:"08:57", c1:66, pm2:"21:28", c2:61, bm1:"03:45", bm2:"16:08"},
        {j:6, pm1:"09:39", c1:57, pm2:"22:32", c2:52, bm1:"04:33", bm2:"17:04"},
        {j:7, pm1:"10:55", c1:48, pm2:"--", c2:"--", bm1:"05:31", bm2:"18:11"},
        {j:8, pm1:"00:57", c1:46, pm2:"13:51", c2:46, bm1:"06:41", bm2:"19:29"},
        {j:9, pm1:"02:39", c1:48, pm2:"15:12", c2:53, bm1:"08:04", bm2:"20:54"},
        {j:10, pm1:"03:51", c1:59, pm2:"16:09", c2:66, bm1:"09:24", bm2:"22:06"},
        {j:11, pm1:"04:45", c1:74, pm2:"16:54", c2:81, bm1:"10:28", bm2:"23:03"},
        {j:12, pm1:"05:27", c1:87, pm2:"17:29", c2:93, bm1:"11:20", bm2:"23:53"},
        {j:13, pm1:"05:58", c1:97, pm2:"17:59", c2:100, bm1:"12:06", bm2:"--"},
        {j:14, pm1:"06:22", c1:102, pm2:"18:30", c2:102, bm1:"00:38", bm2:"12:50"},
        {j:15, pm1:"06:48", c1:101, pm2:"18:57", c2:98, bm1:"01:20", bm2:"13:31"},
        {j:16, pm1:"07:16", c1:95, pm2:"19:29", c2:90, bm1:"02:00", bm2:"14:11"},
        {j:17, pm1:"07:44", c1:84, pm2:"19:58", c2:78, bm1:"02:39", bm2:"14:51"},
        {j:18, pm1:"08:12", c1:71, pm2:"20:27", c2:64, bm1:"03:17", bm2:"15:31"},
        {j:19, pm1:"08:42", c1:57, pm2:"20:58", c2:49, bm1:"03:56", bm2:"16:15"},
        {j:20, pm1:"09:19", c1:42, pm2:"21:37", c2:36, bm1:"04:39", bm2:"17:05"},
        {j:21, pm1:"10:11", c1:30, pm2:"22:38", c2:27, bm1:"05:34", bm2:"18:11"},
        {j:22, pm1:"14:05", c1:26, pm2:"--", c2:"--", bm1:"06:49", bm2:"19:33"},
        {j:23, pm1:"02:54", c1:28, pm2:"15:04", c2:32, bm1:"08:18", bm2:"20:57"},
        {j:24, pm1:"03:47", c1:38, pm2:"15:45", c2:44, bm1:"09:31", bm2:"21:58"},
        {j:25, pm1:"04:21", c1:51, pm2:"16:17", c2:57, bm1:"10:20", bm2:"22:41"},
        {j:26, pm1:"04:44", c1:63, pm2:"16:45", c2:68, bm1:"10:57", bm2:"23:16"},
        {j:27, pm1:"05:06", c1:74, pm2:"17:13", c2:78, bm1:"11:30", bm2:"23:48"},
        {j:28, pm1:"05:30", c1:83, pm2:"17:40", c2:86, bm1:"12:02", bm2:"--"},
        {j:29, pm1:"05:53", c1:89, pm2:"18:09", c2:91, bm1:"00:20", bm2:"12:33"},
        {j:30, pm1:"06:21", c1:93, pm2:"18:38", c2:93, bm1:"00:52", bm2:"13:05"},
        {j:31, pm1:"06:49", c1:93, pm2:"19:08", c2:91, bm1:"01:24", bm2:"13:39"}
        ];
    }

    // SEPTEMBRE
    if (month === 8) {
        data = [
        {j:1, pm1:"07:19", c1:89, pm2:"19:39", c2:85, bm1:"01:59", bm2:"14:15"},
        {j:2, pm1:"07:49", c1:81, pm2:"20:12", c2:75, bm1:"02:36", bm2:"14:55"},
        {j:3, pm1:"08:22", c1:69, pm2:"20:49", c2:62, bm1:"03:17", bm2:"15:43"},
        {j:4, pm1:"09:01", c1:55, pm2:"21:43", c2:48, bm1:"04:06", bm2:"16:42"},
        {j:5, pm1:"10:04", c1:43, pm2:"--", c2:"--", bm1:"05:09", bm2:"17:58"},
        {j:6, pm1:"01:25", c1:40, pm2:"14:08", c2:41, bm1:"06:30", bm2:"19:31"},
        {j:7, pm1:"02:50", c1:45, pm2:"15:16", c2:52, bm1:"08:05", bm2:"21:00"},
        {j:8, pm1:"03:49", c1:60, pm2:"16:06", c2:68, bm1:"09:24", bm2:"22:03"},
        {j:9, pm1:"04:33", c1:76, pm2:"16:43", c2:83, bm1:"10:19", bm2:"22:51"},
        {j:10, pm1:"05:04", c1:90, pm2:"17:08", c2:95, bm1:"11:05", bm2:"23:34"},
        {j:11, pm1:"05:23", c1:98, pm2:"17:30", c2:101, bm1:"11:47", bm2:"--"},
        {j:12, pm1:"05:45", c1:102, pm2:"17:56", c2:101, bm1:"00:14", bm2:"12:27"},
        {j:13, pm1:"06:11", c1:100, pm2:"18:24", c2:97, bm1:"00:52", bm2:"13:04"},
        {j:14, pm1:"06:39", c1:93, pm2:"18:53", c2:89, bm1:"01:28", bm2:"13:40"},
        {j:15, pm1:"07:07", c1:83, pm2:"19:20", c2:77, bm1:"02:02", bm2:"14:15"},
        {j:16, pm1:"07:34", c1:70, pm2:"19:47", c2:63, bm1:"02:36", bm2:"14:52"},
        {j:17, pm1:"08:03", c1:56, pm2:"20:16", c2:49, bm1:"03:12", bm2:"15:32"},
        {j:18, pm1:"08:36", c1:41, pm2:"20:50", c2:35, bm1:"03:53", bm2:"16:21"},
        {j:19, pm1:"09:22", c1:28, pm2:"21:41", c2:24, bm1:"04:47", bm2:"17:28"},
        {j:20, pm1:"13:37", c1:22, pm2:"--", c2:"--", bm1:"06:07", bm2:"18:58"},
        {j:21, pm1:"02:37", c1:24, pm2:"14:39", c2:29, bm1:"07:47", bm2:"20:33"},
        {j:22, pm1:"03:24", c1:35, pm2:"15:20", c2:42, bm1:"09:05", bm2:"21:31"},
        {j:23, pm1:"03:51", c1:50, pm2:"15:50", c2:57, bm1:"09:50", bm2:"22:09"},
        {j:24, pm1:"04:10", c1:64, pm2:"16:16", c2:71, bm1:"10:25", bm2:"22:42"},
        {j:25, pm1:"04:31", c1:77, pm2:"16:43", c2:82, bm1:"10:58", bm2:"23:15"},
        {j:26, pm1:"04:56", c1:87, pm2:"17:10", c2:92, bm1:"11:30", bm2:"23:47"},
        {j:27, pm1:"05:21", c1:95, pm2:"17:39", c2:97, bm1:"12:03", bm2:"--"},
        {j:28, pm1:"05:50", c1:99, pm2:"18:09", c2:99, bm1:"00:21", bm2:"12:38"},
        {j:29, pm1:"06:19", c1:98, pm2:"18:40", c2:96, bm1:"00:55", bm2:"13:15"},
        {j:30, pm1:"06:50", c1:92, pm2:"19:12", c2:88, bm1:"01:32", bm2:"13:55"}
        ];
    }

    // OCTOBRE
    if (month === 9) {
        data = [
        {j:1, pm1:"07:23", c1:82, pm2:"19:47", c2:75, bm1:"02:12", bm2:"14:39"},
        {j:2, pm1:"07:59", c1:68, pm2:"20:27", c2:60, bm1:"02:58", bm2:"15:32"},
        {j:3, pm1:"08:42", c1:53, pm2:"23:54", c2:46, bm1:"03:54", bm2:"16:38"},
        {j:4, pm1:"12:41", c1:41, pm2:"--", c2:"--", bm1:"05:05", bm2:"18:00"},
        {j:5, pm1:"01:38", c1:40, pm2:"14:08", c2:43, bm1:"06:31", bm2:"19:34"},
        {j:6, pm1:"02:45", c1:48, pm2:"15:07", c2:55, bm1:"08:01", bm2:"20:51"},
        {j:7, pm1:"03:35", c1:62, pm2:"15:52", c2:70, bm1:"09:08", bm2:"21:45"},
        {j:8, pm1:"04:11", c1:77, pm2:"16:21", c2:83, bm1:"09:59", bm2:"22:29"},
        {j:9, pm1:"04:31", c1:87, pm2:"16:38", c2:91, bm1:"10:43", bm2:"23:09"},
        {j:10, pm1:"04:46", c1:94, pm2:"16:58", c2:95, bm1:"11:23", bm2:"23:47"},
        {j:11, pm1:"05:10", c1:95, pm2:"17:24", c2:95, bm1:"12:01", bm2:"--"},
        {j:12, pm1:"05:38", c1:93, pm2:"17:54", c2:91, bm1:"00:21", bm2:"12:36"},
        {j:13, pm1:"06:07", c1:88, pm2:"18:22", c2:83, bm1:"00:55", bm2:"13:10"},
        {j:14, pm1:"06:35", c1:79, pm2:"18:49", c2:74, bm1:"01:28", bm2:"13:45"},
        {j:15, pm1:"07:04", c1:68, pm2:"19:17", c2:62, bm1:"02:01", bm2:"14:22"},
        {j:16, pm1:"07:35", c1:56, pm2:"19:47", c2:50, bm1:"02:38", bm2:"15:03"},
        {j:17, pm1:"08:10", c1:43, pm2:"20:21", c2:37, bm1:"03:20", bm2:"15:52"},
        {j:18, pm1:"09:03", c1:32, pm2:"--", c2:"--", bm1:"04:15", bm2:"16:55"},
        {j:19, pm1:"00:09", c1:28, pm2:"12:35", c2:25, bm1:"05:28", bm2:"18:13"},
        {j:20, pm1:"01:49", c1:26, pm2:"13:48", c2:29, bm1:"06:54", bm2:"19:40"},
        {j:21, pm1:"02:35", c1:34, pm2:"14:34", c2:41, bm1:"08:13", bm2:"20:42"},
        {j:22, pm1:"03:03", c1:48, pm2:"15:09", c2:55, bm1:"09:03", bm2:"21:25"},
        {j:23, pm1:"03:27", c1:62, pm2:"15:39", c2:69, bm1:"09:43", bm2:"22:02"},
        {j:24, pm1:"03:53", c1:76, pm2:"16:10", c2:82, bm1:"10:19", bm2:"22:37"},
        {j:25, pm1:"03:20", c1:87, pm2:"15:40", c2:92, bm1:"09:55", bm2:"22:13"},
        {j:26, pm1:"03:50", c1:95, pm2:"16:12", c2:98, bm1:"10:33", bm2:"22:51"},
        {j:27, pm1:"04:22", c1:99, pm2:"16:45", c2:100, bm1:"11:13", bm2:"23:30"},
        {j:28, pm1:"04:54", c1:99, pm2:"17:19", c2:96, bm1:"11:56", bm2:"--"},
        {j:29, pm1:"05:30", c1:93, pm2:"17:57", c2:88, bm1:"00:12", bm2:"12:42"},
        {j:30, pm1:"06:08", c1:82, pm2:"18:39", c2:76, bm1:"00:58", bm2:"13:33"},
        {j:31, pm1:"06:52", c1:69, pm2:"19:35", c2:62, bm1:"01:50", bm2:"14:31"}
        ];
    }


let html = "";
data.forEach(d => {
    html += `<tr>
        <td style="font-weight:bold">${d.j}</td>
        <td>${d.pm1}</td>
        <td style="color:red; font-weight:bold">${d.c1}</td>
        <td>${d.pm2}</td>
        <td style="color:red; font-weight:bold">${d.c2}</td>
        <td>${d.bm1}</td>
        <td>${d.bm2}</td>
    </tr>`;
});

    document.getElementById("mareesTable").innerHTML = html;
}

init();