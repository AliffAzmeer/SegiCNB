// HTML print templates for GitHub Pages (no backend).
// These aim to closely match the FN/SN layouts from screenshots.

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[c]));
}

function linesToHtml(text) {
  return esc(text).replace(/\r?\n/g, "<br>");
}

function formatAddressHtml(roadDistrict, postcodeArea) {
  const line1 = String(roadDistrict ?? "").trim();
  const line2 = String(postcodeArea ?? "").trim();
  return [line1, line2].filter(Boolean).map(esc).join("<br>");
}

function formatDateValue(value, mode = "long") {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  // Keep already-human dates as-is (example: "7 April 2026").
  if (/[A-Za-z]/.test(raw) && !/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw;

  let d = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    d = new Date(raw);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(raw)) {
    const parts = raw.split("/");
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2].length === 2 ? `20${parts[2]}` : parts[2]);
    d = new Date(year, month, day);
  }

  if (!d || Number.isNaN(d.getTime())) return raw;

  if (mode === "short") {
    return new Intl.DateTimeFormat("en-GB").format(d);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatMoney(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "0.00";
  const num = Number(raw.replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(num)) return raw;
  return num.toFixed(2);
}

function pick(row, ...keys) {
  for (const k of keys) {
    if (row && row[k] !== undefined && row[k] !== null) {
      const v = String(row[k]).trim();
      if (v) return v;
    }
  }
  return "";
}

function isBahasa(row) {
  return pick(row, "Company").toLowerCase().includes("dmart");
}

function renderHeaderBlock(row, lang) {
  const isBM = lang === "BM";
  const refLabel = isBM ? "RUJUKAN" : "REFERENCE";
  const dateLabel = isBM ? "TARIKH" : "DATE";

  const ref = pick(row, "Reference Number");
  const dateText = pick(row, "Date Text");

  const name = pick(row, "Name");
  const staff = pick(row, "Staff");
  const ic = pick(row, "I/C Number", "IC", "No IC", "NRIC");
  const roadDistrict = pick(row, "Road District");
  const postcodeArea = pick(row, "Postcode Area");

  const icLabel = isBM ? "No. K/P" : "IC No";

  return `
    <div class="lt-header-grid">
      <div class="lt-meta">
        <div class="lt-meta-row"><span class="lt-meta-label">${refLabel}</span><span class="lt-meta-colon">:</span><span class="lt-meta-value">${esc(ref)}</span></div>
        <div class="lt-meta-row"><span class="lt-meta-label">${dateLabel}</span><span class="lt-meta-colon">:</span><span class="lt-meta-value">${esc(dateText)}</span></div>
      </div>
    </div>

    <div class="lt-recipient">
      <div class="lt-recipient-name"><b>${esc(name)} (${esc(staff)})</b></div>
      <div class="lt-recipient-ic">${esc(icLabel)}: ${esc(ic)}</div>
      <div class="lt-recipient-address">${formatAddressHtml(roadDistrict, postcodeArea)}</div>
    </div>
  `;
}

function renderSignatureBlock(lang) {
  // Fixed as per user confirmation.
  const isBM = lang === "BM";
  return `
    <div class="lt-signoff">
      <div>${isBM ? "Yang Benar," : "Yours sincerely,"}</div>
      <div class="lt-company-line"><b>${isBM ? "Dmart Segi Sdn Bhd" : "Ehsan Segi Sdn Bhd"}</b></div>
    </div>
    <br>

    <div class="lt-signer">
      <div><b>NOR ZAINI BINTI SAMAT</b></div>
      <div>Senior Manager, People Analytics & Rewards</div>
      <div>${isBM ? "Kumpulan Sumber Manusia" : "Group Human Resources"}</div>
    </div>
  `;
}

function renderAckFooter(lang) {
  const isBM = lang === "BM";
  return `
    <div class="lt-ack">
      <div class="lt-ack-sign">
        <div>${isBM ? "Tandatangan:" : "Signature:"}</div>
        <div>${isBM ? "Tarikh:" : "Date:"}</div>
      </div>
    </div>
  `;
}

function renderFnLetter(row, lang) {
  const isBM = lang === "BM";
  const pageClass = `lt-page${isBM ? " lt-fn-bm" : ""}`;
  const firstName = pick(row, "First Name", "First name", "FirstName", "Name");
  const salutation = isBM ? `Tuan/Puan ${esc(firstName)},` : `Dear ${esc(firstName)},`;

  const dateReceived = formatDateValue(pick(row, "Date received", "Date Text", "Date"), "long");
  const lwd = formatDateValue(pick(row, "LWD", "Last Working Day"), "long");
  const position = pick(row, "Position");
  const branch = pick(row, "Branch");

  // Sentence-style claims values (no table, matching template format)
  const alBalance = pick(row, "AL Balance");
  const medicalUsed = pick(row, "Used");
  const medicalEnt = pick(row, "Medical Entitlement Earned", "Medical Entitlement (RM)");
  const overtakenMedical = pick(row, "Overtaken Medical");
  const overtakenAlDays = pick(row, "Overtaken AL");
  const overtakenAlAmt = pick(row, "Overtaken Al Amt");
  const medicalUsedMoney = formatMoney(medicalUsed);
  const medicalEntMoney = formatMoney(medicalEnt);
  const overtakenMedicalMoney = formatMoney(overtakenMedical);
  const overtakenAlAmtMoney = formatMoney(overtakenAlAmt);

  const subject = isBM ? "PERKARA: PENERIMAAN PELETAKAN JAWATAN" : "SUBJECT: ACCEPTANCE OF RESIGNATION";

  const body = isBM
    ? `
      <p>Merujuk kepada surat peletakan jawatan anda yang kami terima pada <b>${esc(dateReceived)}</b>. Dimaklumkan bahawa peletakan jawatan anda sebagai <b>${esc(position)}</b> di ${esc(branch)} adalah dengan ini diterima.</p>
      <p>Hari terakhir perkhidmatan rasmi anda adalah pada <b>${esc(lwd)}</b>.</p>
      <p>Cuti &amp; Faedah Perubatan:</p>
    `
    : `
      <p>We refer to your resignation letter, which we received on <b>${esc(dateReceived)}</b>. We wish to inform you that your resignation as <b>${esc(position)}</b> at <b>${esc(branch)}</b> is hereby accepted.</p>
      <p>Your official last day of service is <b>${esc(lwd)}</b>.</p>
    `;

  const claims = isBM
    ? `
      <div class="lt-claims">
        <p><b>Cuti &amp; Tuntutan Perubatan:</b></p>
        <table class="lt-fn-bm-table">
          <tbody>
            <tr>
              <td class="lt-fn-bm-label"><b>Cuti Tahunan</b></td>
              <td class="lt-fn-bm-value">: Baki <b>${esc(alBalance || "0")}</b> hari</td>
            </tr>
            <tr>
              <td class="lt-fn-bm-label"><b>MiCare</b></td>
              <td class="lt-fn-bm-value">: <b>RM${esc(overtakenMedicalMoney)}</b> (Potongan)<br>
                (Kelayakan MiCare: <b>RM${esc(medicalEntMoney)}</b>; Jumlah penggunaan: <b>RM${esc(medicalUsedMoney)}</b>)</td>
            </tr>
            <tr>
              <td class="lt-fn-bm-label"><b>Cuti Tahunan melebihi kelayakan</b></td>
              <td class="lt-fn-bm-value">: <b>${esc(overtakenAlDays || "0")}</b> day(s)/<b>RM${esc(overtakenAlAmtMoney)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
    `
    : `
      <div class="lt-claims">
        <p><b>Leave &amp; Medical Claims:</b></p>
        <div class="lt-claim-row">
          <span class="lt-claim-label"><b>Annual Leave</b></span>
          <span class="lt-claim-colon">:</span>
          <span class="lt-claim-value">Balance <b>${esc(alBalance || "0")}</b> day(s)</span>
        </div>
        <div class="lt-claim-row">
          <span class="lt-claim-label"><b>MiCare</b></span>
          <span class="lt-claim-colon">:</span>
          <span class="lt-claim-value"><b>RM${esc(overtakenMedicalMoney)}</b> (Deduction)</span>
        </div>
        <div class="lt-claim-subline">(Your Micare entitlement is <b>RM${esc(medicalEntMoney)}</b>. As you have utilized <b>RM${esc(medicalUsedMoney)}</b>)</div>
      </div>
    `;

  const closing = isBM
    ? `
      <p class="lt-final-heading"><b>Bayaran Akhir &amp; Serahan Tugas:</b></p>
      <p>Bayaran akhir anda akan dikira sehingga hari terakhir perkhidmatan, tertakluk kepada sebarang tunggakan kepada syarikat. Bayaran akhir adalah tertakluk kepada perkara berikut:</p>
      <ol class="lt-final-list">
        <li>Penyempurnaan penyerahan tugas yang lengkap dan teratur kepada pegawai yang bertanggungjawab.</li>
        <li>Pemulangan semua harta milik Syarikat kepada Jabatan Kumpulan Sumber Manusia.</li>
      </ol>
      <p>Pihak kami merakamkan penghargaan atas segala jasa dan sumbangan anda sepanjang tempoh perkhidmatan dan mengucapkan selamat maju jaya dalam apa jua bidang yang diceburi pada masa hadapan.</p>
      <p>Sekian, terima kasih.</p>
    `
    <br>
    : `
      <p class="lt-final-heading"><b>Final Payment &amp; Handover:</b></p>
      <p>Your final salary will be calculated up to your last day, less any monies owing to the Company. Final payment is subject to the following:</p>
      <ol class="lt-final-list">
        <li>Completion of a proper handover of all duties to the person-in-charge.</li>
        <li>Return of all Company property to Group Human Resources.</li>
      </ol>
      <p>We thank you for your service and wish you the best in your future endeavours.</p>
      <p>Thank you.</p>
    `;

  return `
    <div class="${pageClass}">
      ${renderHeaderBlock(row, lang)}
      <div class="lt-salutation">${salutation}</div>
      <div class="lt-subject"><b>${subject}</b></div>
      <div class="lt-body">
        ${body}
        ${claims}
        ${closing}
      </div>
      ${renderSignatureBlock(lang)}
      ${renderAckFooter(lang)}
    </div>
  `;
}

function renderSnLetter(row, lang) {
  const isBM = lang === "BM";
  const pageClass = `lt-page${isBM ? " lt-sn-bm" : ""}`;
  const firstName = pick(row, "First Name", "First name", "FirstName", "Name");
  const salutation = isBM ? `Kepada ${esc(firstName)},` : `Dear ${esc(firstName)},`;

  const lwd = formatDateValue(pick(row, "LWD", "Last Working Day"), "long");
  const dateReceived = formatDateValue(pick(row, "Date received", "Date Text", "Date"), "long");
  const noticePeriod = pick(row, "Notice Period");
  const clause = pick(row, "Clause", "Contract Clause");
  const totalDeduction = pick(row, "Total deduction");
  const totalPaidAmount = pick(row, "Total Paid Amount");
  const alBalance = pick(row, "AL Balance");
  const shortNoticeBalance = pick(row, "SN Balance");
  const overtakenAl = pick(row, "Overtaken AL");
  const overtakenAlAmt = pick(row, "Overtaken Al Amt");
  const medicalUsed = pick(row, "Used");
  const medicalEnt = pick(row, "Medical Entitlement Earned", "Medical Entitlement (RM)");
  const overtakenMedical = pick(row, "Overtaken Medical");
  const totalDeductionMoney = formatMoney(totalDeduction);
  const totalPaidAmountMoney = formatMoney(totalPaidAmount);
  const overtakenAlAmtMoney = formatMoney(overtakenAlAmt);
  const medicalUsedMoney = formatMoney(medicalUsed);
  const medicalEntMoney = formatMoney(medicalEnt);
  const overtakenMedicalMoney = formatMoney(overtakenMedical);

  const bank = pick(row, "Bank");
  const account = pick(row, "Account");
  const defaultAccountName = isBM ? "Dmart Segi Sdn Bhd" : "Segi Cash & Carry Sdn Bhd";
  const accountName = pick(row, "Account Name", "Nama Syarikat", "Company") || defaultAccountName;
  const receiptEmail = "cnb_hr@segigroup.com";

  const subject = isBM ? "PERKARA: TUNTUTAN INDEMNITI GAJI SEBAGAI GANTI NOTIS" : "SUBJECT: INDEMNITY SALARY IN LIEU";

  const body = isBM
    ? `
      <p>Merujuk kepada surat peletakan jawatan anda, dimaklumkan bahawa tarikh akhir perkhidmatan anda adalah pada <b>${esc(lwd)}</b>.</p>
      <p>Berdasarkan <b>Klausa (${esc(clause)}): Penamatan Perkhidmatan dalam Surat Pelantikan</b>, anda dikehendaki memberikan notis satu (${esc(noticePeriod)}) bulan atau membayar satu (${esc(noticePeriod)}) bulan gaji sebagai ganti notis sekiranya ingin meletakkan jawatan.</p>
      <p>Walau bagaimanapun, tempoh notis yang diberikan adalah tidak mencukupi sebanyak <b>${esc(shortNoticeBalance || "0")}</b> hari. Sehubungan itu, pelarasan telah dibuat seperti berikut:</p>
      <div class="lt-sn-bm-rows">
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>Cuti Tahunan</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>${esc(alBalance || "0")}</b> day(s) (Digunakan untuk mengimbangi tempoh notis)</span></div>
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>Baki Ganti Notis</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>${esc(shortNoticeBalance || "0")}</b> day(s) / <b>RM${esc(totalPaidAmountMoney)}</b></span></div>
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>Cuti Tahunan Melebihi Kelayakan</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>${esc(overtakenAl || "0")}</b> day(s)/<b>RM${esc(overtakenAlAmtMoney)}</b></span></div>
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>MiCare</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>RM${esc(overtakenMedicalMoney)}</b> (Potongan)</span></div>
        <div class="lt-sn-bm-subline">(Kelayakan MiCare:<b>RM${esc(medicalEntMoney)}</b>; Jumlah penggunaan:<b>RM${esc(medicalUsedMoney)}</b>)</div>
      </div>
    `
    : `
      <p>We refer to your resignation letter and your official last day of service on <b>${esc(lwd)}</b>.</p>
      <p>As stipulated in <b>Clause (${esc(clause)}): Termination of Employment of your Letter of Appointment</b>, you are required to serve one (${esc(noticePeriod)}) month's notice or one (${esc(noticePeriod)}) month's salary in lieu upon resignation.</p>
      <p>As your resignation notice is short, the Company has applied your leave balance and any applicable deductions to settle the notice period as follows:</p>
      <table class="lt-sn-table">
        <tbody>
          <tr>
            <td class="lt-sn-label"><b>Annual Leave</b></td>
            <td class="lt-sn-value">: <b>${esc(alBalance || "0")}</b> day(s) (utilized to offset notice period)</td>
          </tr>
          <tr>
            <td class="lt-sn-label"><b>Short Notice Balance</b></td>
            <td class="lt-sn-value">: <b>${esc(shortNoticeBalance || "0")}</b> day(s) / <b>RM${esc(totalPaidAmountMoney)}</b></td>
          </tr>
          <tr>
            <td class="lt-sn-label"><b>Overtaken Annual Leave</b></td>
            <td class="lt-sn-value">: <b>${esc(overtakenAl || "0")}</b> day(s) (Overtaken)/<b>RM${esc(overtakenAlAmtMoney)}</b></td>
          </tr>
          <tr>
            <td class="lt-sn-label"><b>MiCare</b></td>
            <td class="lt-sn-value">: <b>RM${esc(overtakenMedicalMoney)}</b> (Deduction)<br>
              (Your MiCare entitlement is <b>RM${esc(medicalEntMoney)}</b>. As you have utilized <b>RM${esc(medicalUsedMoney)}</b>)</td>
          </tr>
        </tbody>
      </table>
    `;

  const paymentDetails = isBM
    ? `
      <p>Sehubungan itu, anda bertanggungjawab untuk menjelaskan bayaran indemniti kepada pihak Syarikat dan hendaklah dibuat melalui IBG atau DuitNow ke akaun berikut:</p>
      <div class="lt-sn-bm-pay-rows">
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>Bayaran yang perlu dibayar</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>RM${esc(totalDeductionMoney)}</b></span></div>
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>Nama Syarikat</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value">${esc(accountName)}</span></div>
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>Bank</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>${esc(bank)}</b></span></div>
        <div class="lt-sn-bm-row"><span class="lt-sn-bm-label"><b>No. Akaun</b></span><span class="lt-sn-bm-colon">:</span><span class="lt-sn-bm-value"><b>${esc(account)}</b></span></div>
      </div>
    `
    : `
      <p>You are required to make the indemnity payment via Online Transfer (IBG or DuitNow) to the following account:</p>
      <div class="lt-pay-rows">
        <div class="lt-pay-row"><span class="lt-pay-label">Total Need to Pay</span><span class="lt-pay-colon">:</span><span class="lt-pay-value">RM${esc(totalDeductionMoney)}</span></div>
        <div class="lt-pay-row"><span class="lt-pay-label">Account Name</span><span class="lt-pay-colon">:</span><span class="lt-pay-value">${esc(accountName)}</span></div>
        <div class="lt-pay-row"><span class="lt-pay-label">Name Bank</span><span class="lt-pay-colon">:</span><span class="lt-pay-value"><b>${esc(bank)}</b></span></div>
        <div class="lt-pay-row"><span class="lt-pay-label">Account Number</span><span class="lt-pay-colon">:</span><span class="lt-pay-value"><b>${esc(account)}</b></span></div>
      </div>
    `;

  const receipt = isBM
    ? `<p>Setelah bayaran dibuat, sila emelkan resit pembayaran ke <b>${esc(receiptEmail)}</b> untuk tujuan rekod.</p>
       <p>Sekian, terima kasih.</p>`
    : `<p>Kindly forward the payment receipt to <b>${esc(receiptEmail)}</b> upon completion of the transaction for our record purposes.</p>`;

  return `
    <div class="${pageClass}">
      ${renderHeaderBlock(row, lang)}
      <div class="lt-salutation">${salutation}</div>
      <div class="lt-subject"><b>${subject}</b></div>
      <div class="lt-body">
        ${body}
        ${paymentDetails}
        ${receipt}
      </div>
      ${renderSignatureBlock(lang)}
      ${renderAckFooter(lang)}
    </div>
  `;
}

function renderLetterHtml(row) {
  const status = pick(row, "Status").toUpperCase();
  const lang = isBahasa(row) ? "BM" : "EN";
  if (status === "SN") return renderSnLetter(row, lang);
  return renderFnLetter(row, lang);
}

// Expose globally for script.js
window.renderLetterHtml = renderLetterHtml;
window.isBahasa = isBahasa;

