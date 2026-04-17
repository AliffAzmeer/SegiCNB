let employeeData = [];
let selectedRow = null;
const UI_STATE_KEY = "hrLetterUiState";
const PREVIEW_STATE_KEY = "hrLetterPreviewState";

const excelFile    = document.getElementById("excelFile");
const searchBox    = document.getElementById("searchBox");
const statusFilter = document.getElementById("statusFilter");
const tableBody    = document.getElementById("tableBody");
const modal        = document.getElementById("modal");
const printArea    = document.getElementById("printArea");

function loadUiState() {
    try {
        const raw = localStorage.getItem(UI_STATE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn("Failed to parse UI state.", e);
        return {};
    }
}

function saveUiState() {
    const state = {
        search: searchBox.value || "",
        status: statusFilter.value === "SN" ? "SN" : "FN"
    };
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(state));
}

function restoreUiState() {
    const state = loadUiState();
    if (typeof state.search === "string") {
        searchBox.value = state.search;
    }
    if (state.status === "SN" || state.status === "FN") {
        statusFilter.value = state.status;
    }
}

function savePreviewState(row, isOpen) {
    const state = {
        isOpen: Boolean(isOpen),
        staff: row ? getValue(row, "Staff") : ""
    };
    localStorage.setItem(PREVIEW_STATE_KEY, JSON.stringify(state));
}

function restorePreviewState() {
    try {
        const raw = localStorage.getItem(PREVIEW_STATE_KEY);
        const state = raw ? JSON.parse(raw) : null;
        if (!state || !state.isOpen || !state.staff) return;
        const row = employeeData.find(r => getValue(r, "Staff") === state.staff);
        if (row) {
            generateLetter(row);
        }
    } catch (e) {
        console.warn("Failed to restore preview state.", e);
    }
}

const REQUIRED_COLUMNS = [
    "Status",
    "Reference Number",
    "Date Text",
    "Staff",
    "Name",
    "Company"
];

function getMissingColumns(rows, requiredColumns) {
    const present = new Set();

    rows.forEach(r => {
        Object.keys(r).forEach(k => {
            present.add(String(k).trim());
        });
    });

    return requiredColumns.filter(col => !present.has(col));
}

function setSystemStatus(text) {
    const el = document.getElementById("systemStatus");
    if (el) el.textContent = text;
}

function getLetterTemplate(status, isBM) {
    const templates = {
        FN: {
            BM: {
                title: "PENERIMAAN SURAT PERLETAKAN JAWATAN",
                body: `
        Dengan segala hormatnya merujuk kepada perkara di atas.
        <br><br>
        Pihak syarikat menerima surat perletakan jawatan anda.
        Tarikh akhir perkhidmatan anda adalah seperti yang telah dipersetujui.
        <br><br>
        Pihak syarikat ingin merakamkan setinggi-tinggi penghargaan
        di atas segala jasa dan sumbangan anda sepanjang tempoh perkhidmatan.
        `
            },
            EN: {
                title: "ACCEPTANCE OF RESIGNATION",
                body: `
        We refer to the above matter.
        <br><br>
        The Management hereby accepts your resignation.
        Your last working day shall be as mutually agreed.
        <br><br>
        The company would like to express its appreciation
        for your service and contribution throughout your employment.
        `
            }
        },
        SN: {
            BM: {
                title: "GANTI RUGI GAJI SEBAGAI GANTI NOTIS",
                body: `
        Adalah dimaklumkan bahawa anda dikehendaki membuat bayaran
        ganti rugi gaji sebagai ganti notis mengikut terma kontrak pekerjaan.
        <br><br>
        Sila berhubung dengan pihak Human Resource Department
        untuk tindakan selanjutnya.
        `
            },
            EN: {
                title: "INDEMNITY SALARY IN LIEU OF NOTICE",
                body: `
        Please be informed that you are required to make payment
        for indemnity salary in lieu of notice in accordance
        with the terms of your employment contract.
        <br><br>
        Kindly liaise with the Human Resource Department
        for further action.
        `
            }
        }
    };

    const type = status === "FN" ? "FN" : "SN";
    const lang = isBM ? "BM" : "EN";
    return templates[type][lang];
}

excelFile.addEventListener("change", async function (e) {

    const file = e.target.files[0];
    if (!file) return;

    try {

        const buffer = await file.arrayBuffer();

        const workbook = XLSX.read(buffer, {
            type: "array"
        });

        const sheet =
            workbook.Sheets["Letter Generate"] ||
            workbook.Sheets[workbook.SheetNames[0]];

        if (!sheet) {
            alert("Sheet not found.");
            return;
        }

        const rawData = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
            raw: false
        });

        const cleanedData = rawData.map(row => cleanHeaders(row));

        if (cleanedData.length === 0) {
            employeeData = [];
            renderTable();
            updateDashboard();
            setSystemStatus("No data");
            alert("No rows found in the selected sheet.");
            return;
        }

        const missing = getMissingColumns(cleanedData, REQUIRED_COLUMNS);
        if (missing.length > 0) {
            employeeData = [];
            renderTable();
            updateDashboard();
            setSystemStatus("Missing columns");
            alert(
                "Missing required columns:\n\n" +
                missing.map(m => `- ${m}`).join("\n") +
                "\n\nPlease update the Excel header row to match."
            );
            return;
        }

        employeeData = cleanedData;

        employeeData = employeeData.filter(row => {

            const status = getValue(row, "Status")
                .toUpperCase()
                .trim();

            return status === "FN" || status === "SN";
        });

        renderTable();
        updateDashboard();
        setSystemStatus("Loaded");
        restorePreviewState();

        console.log("Loaded Data:", employeeData);

    } catch (error) {
        console.error(error);
        setSystemStatus("Error");
        alert("Failed to read Excel file.");
    }

});

function cleanHeaders(row) {

    const cleanRow = {};

    Object.keys(row).forEach(key => {
        cleanRow[key.trim()] = row[key];
    });

    return cleanRow;
}

function getValue(row, key) {

    if (row[key] !== undefined) return String(row[key]).trim();

    return "";
}

function renderTable() {

    const keyword = searchBox.value.toLowerCase().trim();
    const filter  = statusFilter.value === "SN" ? "SN" : "FN";

    tableBody.textContent = "";

    const frag = document.createDocumentFragment();

    employeeData.forEach(row => {

        const status = getValue(row, "Status").toUpperCase();
        const staff  = getValue(row, "Staff");
        const name   = getValue(row, "Name");
        const ref    = getValue(row, "Reference Number");

        const matchSearch =
            (staff + " " + name).toLowerCase().includes(keyword);

        const matchFilter = status === filter;

        if (!matchSearch || !matchFilter) return;

        const badgeClass =
            status === "FN" ? "fn" : "sn";

        const tr = document.createElement("tr");

        const tdStatus = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `badge ${badgeClass}`;
        badge.textContent = status;
        tdStatus.appendChild(badge);

        const tdRef = document.createElement("td");
        tdRef.textContent = ref;

        const tdStaff = document.createElement("td");
        tdStaff.textContent = staff;

        const tdName = document.createElement("td");
        tdName.textContent = name;

        const tdAction = document.createElement("td");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "Generate";
        btn.addEventListener("click", () => generateLetter(row));
        tdAction.appendChild(btn);

        tr.appendChild(tdStatus);
        tr.appendChild(tdRef);
        tr.appendChild(tdStaff);
        tr.appendChild(tdName);
        tr.appendChild(tdAction);

        frag.appendChild(tr);
    });

    tableBody.appendChild(frag);
    saveUiState();

}

searchBox.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);

function generateLetter(row){
    selectedRow = row;

    if(!selectedRow){
        alert("Staff record not found.");
        return;
    }

    // Render print template HTML (FN/SN + EN/BM) from Excel row
    printArea.innerHTML = window.renderLetterHtml(selectedRow);

    modal.style.display = "flex";
    savePreviewState(selectedRow, true);
}

function sendEmail() {

    if (!selectedRow) return;

    const email  = getValue(selectedRow, "Email");
    const status = getValue(selectedRow, "Status");

    const isFn = status.toUpperCase() === "FN";
    const subject = isFn
        ? "Acceptance of Resignation - Further Action Required"
        : "Acceptance of Resignation";

    const body = isFn
        ? `Dear All,

Hereby new acceptance of resignation for your further action.
1. Kindly advise staff regarding the acceptance letter.
2. Please inform staff to answer Exit Interview. The link has been sent to staff personal email.
3. Prepare staff Benefit Checklist once the staff resign/return the benefits OR on staff last day and send the attachment to CNB.

Afina Mahazir
Human Resource
Segi Value Holdings Sdn Bhd
Unit 504, Block A, Kelana Business Centre,
No. 97, Jalan SS 7/2, Kelana Jaya,
47301 Petaling Jaya, Selangor`
        : `Hi,

kindly find the attachment regarding your Acceptance of Resignation for your perusal.

Regard,`;

    window.location.href =
        `mailto:${email}?cc=cnb_hr@segigroup.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function downloadPDF() {

    if (!selectedRow) return;
    const activeFilter = statusFilter.value === "SN" ? "SN" : "FN";
    const rowStatus = getValue(selectedRow, "Status").toUpperCase();
    if (rowStatus !== activeFilter) {
        alert(`Current filter is ${activeFilter}. Please generate a ${activeFilter} letter before printing.`);
        return;
    }
    // GitHub-only mode: use browser print -> Save as PDF
    setSystemStatus("Print to PDF");
    window.print();
}

function printLetter() {
    if (!selectedRow) return;
    const activeFilter = statusFilter.value === "SN" ? "SN" : "FN";
    const rowStatus = getValue(selectedRow, "Status").toUpperCase();
    if (rowStatus !== activeFilter) {
        alert(`Current filter is ${activeFilter}. Please generate a ${activeFilter} letter before printing.`);
        return;
    }
    window.print();
}

function closeModal() {
    modal.style.display = "none";
    savePreviewState(null, false);
}

function updateDashboard(){

    const total = employeeData.length;

    const fn = employeeData.filter(row => {
        return getValue(row,"Status").toUpperCase() === "FN";
    }).length;

    const sn = employeeData.filter(row => {
        return getValue(row,"Status").toUpperCase() === "SN";
    }).length;

    document.getElementById("totalStaff").textContent = total;
    document.getElementById("totalFN").textContent = fn;
    document.getElementById("totalSN").textContent = sn;
    document.getElementById("systemStatus").textContent = "Loaded";
}

restoreUiState();
renderTable();
