import { VacancyItem } from "@/types/vacancy";

export function exportToPDF(items: VacancyItem[], title = "CSAB 2026 Vacancy & Choice Preference Report", userState = "") {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the PDF report.");
    return;
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalSeats = items.reduce((acc, curr) => acc + curr.vacancy, 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            color: #1d1d1f;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-b: 2px solid #0071e3;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            font-size: 18px;
            font-weight: 800;
            color: #1d1d1f;
            margin: 0;
          }
          .brand span {
            color: #0071e3;
          }
          .subtitle {
            font-size: 10px;
            color: #86868b;
            margin-top: 2px;
          }
          .meta {
            text-align: right;
            font-size: 10px;
            color: #515154;
          }
          .summary-bar {
            background-color: #f5f5f7;
            border-radius: 8px;
            padding: 10px 14px;
            margin-bottom: 16px;
            display: flex;
            gap: 20px;
            font-size: 11px;
          }
          .summary-item strong {
            color: #0071e3;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th {
            background-color: #fafafa;
            color: #515154;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1.5px solid #e5e5ea;
            padding: 8px 6px;
            text-align: left;
          }
          td {
            padding: 8px 6px;
            border-bottom: 1px solid #f2f2f7;
            font-size: 10.5px;
          }
          tr:nth-child(even) {
            background-color: #fbfbfd;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
          }
          .badge-nit { background: #e3f2fd; color: #0288d1; }
          .badge-iiit { background: #e8eaf6; color: #3f51b5; }
          .badge-gfti { background: #f3e5f5; color: #7b1fa2; }
          .badge-hs { background: #e8f5e9; color: #2e7d32; }
          .badge-[#0071e3] { background: #e0f2fe; color: #0284c7; }
          .footer {
            margin-top: 24px;
            border-top: 1px solid #e5e5ea;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #86868b;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div className="no-print" style="margin-bottom: 12px; text-align: right;">
          <button onclick="window.print()" style="background: #0071e3; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <h1 class="brand">CSAB <span>Vacancies 2026</span></h1>
            <p class="subtitle">Official Seat Allocation & Choice Locking Preference Report</p>
          </div>
          <div class="meta">
            <div>Date: <strong>${currentDate}</strong></div>
            <div>Total Options: <strong>${items.length}</strong></div>
          </div>
        </div>

        <div class="summary-bar">
          <div class="summary-item">Total Vacant Seats: <strong>${totalSeats.toLocaleString()}</strong></div>
          ${userState ? `<div class="summary-item">Candidate State of Eligibility: <strong>${userState}</strong></div>` : ""}
          <div class="summary-item">Generated from CSAB Finder Platform</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
              <th>Institute Name</th>
              <th>Program / Branch</th>
              <th style="width: 45px;">Quota</th>
              <th style="width: 65px;">Category</th>
              <th style="width: 80px;">Seat Pool</th>
              <th style="width: 50px; text-align: right;">Vacancies</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr>
                <td style="text-align: center; color: #86868b; font-weight: 600;">${idx + 1}</td>
                <td>
                  <span class="badge badge-${item.instituteType.toLowerCase()}">${item.instituteType}</span>
                  <strong style="margin-left: 4px;">${item.instituteName}</strong>
                  <div style="font-size: 9px; color: #86868b; margin-top: 1px;">State: ${item.instituteState} | Code: ${item.instituteCode}</div>
                </td>
                <td>
                  <strong>${item.programName}</strong>
                  <div style="font-size: 9px; color: #86868b; margin-top: 1px;">Code: ${item.programCode}</div>
                </td>
                <td><span class="badge badge-[#0071e3]">${item.quota}</span></td>
                <td>${item.category}</td>
                <td>${item.seatPool.includes("Female") ? "Female-Only" : "Gender-Neutral"}</td>
                <td style="text-align: right; font-weight: 800; color: #0071e3;">${item.vacancy}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          <div>CSAB Vacancies 2026 Platform — Verified Seat Intelligence Report</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
