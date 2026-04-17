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
          <td class="lt-sn-value">: <b>RM${esc(overtakenMedicalMoney)}</b> ( <b>Deduction</b> )<br>
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
      <div class="lt-pay-row"><span class="lt-pay-label">Total Need to Pay</span><span class="lt-pay-colon">:</span><span class="lt-pay-value"><b>RM${esc(totalDeductionMoney)}</b></span></div>
      <div class="lt-pay-row"><span class="lt-pay-label">Account Name</span><span class="lt-pay-colon">:</span><span class="lt-pay-value">${esc(accountName)}</span></div>
      <div class="lt-pay-row"><span class="lt-pay-label">Bank</span><span class="lt-pay-colon">:</span><span class="lt-pay-value"><b>${esc(bank)}</b></span></div>
      <div class="lt-pay-row"><span class="lt-pay-label">Account Number</span><span class="lt-pay-colon">:</span><span class="lt-pay-value"><b>${esc(account)}</b></span></div>
    </div>
  `;
