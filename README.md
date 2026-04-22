# HR_AutoLetter_System

Client-side HR letter generator:
- Upload Excel (`.xlsx/.xls/.xlsm`)
- Browse/filter staff list
- Auto-generate a resignation-related letter (preview)
- Export via email draft (`mailto:`) and browser print (Save as PDF)


When you upload a workbook, the app tries to read:

1. A sheet named **`Letter Generate`**
2. Otherwise, the **first sheet** in the workbook

### Row filtering

Only rows with `Status` equal to **`FN`** or **`SN`** (case-insensitive) are loaded into the table.

### Letter type logic

- **`FN`**: Acceptance of Resignation (or BM variant)
- **`SN`**: Indemnity Salary in Lieu of Notice (or BM variant)

### Language (BM vs English)

The app switches to Bahasa Melayu when the `Company` cell contains the substring **`dmart`** (case-insensitive). Otherwise it uses English.

### Columns used (headers)

Headers are read exactly as shown below (after trimming leading/trailing spaces).

#### Required for table + letter

- `Status` (must be FN or SN to be included)
- `Reference Number`
- `Date Text`
- `Staff` (staff ID; used as lookup key)
- `Name`
- `Company` (used for BM/EN selection)

#### Optional / with fallbacks

- **IC/NRIC** (shown as “No. IC” in the letter; first non-empty wins):
  - `IC`
  - `No IC`
  - `NRIC`
- **Address** (printed as a block; first non-empty wins):
  - `Address`
  - `Home Address`
  - `Residential Address`
- **Email** (for the email draft action):
  - `Email`

## Notes / limitations

- The **Email** button opens a mail draft using `mailto:`. This does **not** send email automatically and cannot attach the generated PDF without a backend/service.
- The current implementation injects Excel values into HTML; if Excel content is untrusted, it should be sanitized or rendered using `textContent` to prevent HTML injection.

## PDF export mode

The app is now fully frontend-only for GitHub Pages:

- Generate letter preview in-browser
- Use Print / Save as PDF from the browser dialog

"# SegiCNB" 
"# SegiCNB" 
