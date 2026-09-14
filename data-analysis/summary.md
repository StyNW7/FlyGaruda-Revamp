# Summary: Isi Slide Rangkuman Data Analysis (Survey Respondent Profile)

Dokumen ini menjelaskan **teks apa yang harus mengganti setiap placeholder di `data-slide.png`** agar slide 100% konsisten dengan output `data-analysis/garuda-youth-traveler-analysis.ipynb` (n = 64, Google Forms, 8–12 Sep 2026). Semua angka di bawah dihitung ulang langsung dari `data-analysis/dataset_clean.csv` dan sudah dicocokkan dengan `figures/12_headline_numbers.png`.

> Kaidah: teks slide dalam **bahasa Inggris** (sesuai ketentuan deck), penjelasan di dokumen ini dalam bahasa Indonesia.

---

## 0. Tiga hal yang salah di template dan harus diperbaiki dulu

| Masalah di template | Kenapa salah | Perbaikan |
|---|---|---|
| Kolom tengah **"Regular Traveler User (≤ 2 flight/year)"** dan kolom kanan **"Non-Regular Traveler User (> 2 flight/year)"** | Labelnya terbalik (yang terbang ≤2× justru "regular"?). Selain itu, opsi jawaban survei kita adalah `0 / 1 / 2–3 / 4–6 / 7–10 / >10`, jadi **tidak mungkin memotong di angka 2**. | Gunakan potongan yang ada di data: **≤ 3 flights/yr (n = 45)** vs **4+ flights/yr (n = 19)** — ini definisi "Frequent flyer" yang dipakai di seluruh notebook dan angka 16%-nya sudah menjadi headline deck. |
| Placeholder "With Who?" (Family Trip) dan "Go Where?" (Domestic Flight) | Survei kita **tidak menanyakan** teman perjalanan maupun domestik/internasional. | Ganti dengan variabel yang benar-benar ada: **life stage** dan **trip purpose** (lihat §2). |
| Callout "96% Multi-app Planning" dan "62% Discovery Gap" | Angka dan konsepnya berasal dari case lain (travel app), bukan dari survei kita. | Ganti dengan dua temuan terkuat kita: **92% OTA-first** dan **Graduation Gap 50% → 16%** (lihat §3). |

---

## 1. Judul slide

**Template:** `APPENDIX 10. Collecting Feedback and Future Improvement for Garuda Indonesia (part 1)`

**Ganti menjadi (pilih salah satu):**

- `APPENDIX X. Primary Research – What 64 Next-Generation Travelers Told Us About Choosing (or Skipping) Garuda (part 1)` ← rekomendasi, karena langsung menjawab pertanyaan case.
- Versi lebih pendek: `APPENDIX X. Survey of 64 Young Travelers: Profile, Barriers, and What Keeps Them on Garuda`

Nomor appendix sesuaikan dengan urutan deck kalian.

---

## 2. Kolom kiri – "Respondent Segmentation Profile (64)"

Header kotak biru tetap: **`Respondent Profile (n = 64)`**.

Tiga kotak profil, ganti menjadi:

| Kotak (label kiri) | Isi kotak (teks kanan) | Sumber |
|---|---|---|
| **Age** | **18 – 23 years old** <br> N = 60 respondents (94%) | `age` = 18–20 (43) + 21–23 (17) |
| **Life Stage** (ganti "With Who?") | **University student** <br> N = 57 respondents (89%) | `status` |
| **Why Fly?** (ganti "Go Where?") | **Leisure / holiday** <br> N = 48 respondents (75%) | `trip_purpose` (max 3 pilihan) |

Jika ingin kotak ke-4 atau mengganti salah satu: **Flew in last 2 years – N = 56 (88%)** (menegaskan bahwa responden adalah *actual travelers*, bukan hipotetis) atau **Jabodetabek-based – N = 55 (86%)**.

Tambahkan satu baris kecil di bawah kotak (font kecil) supaya konteks finansial ikut terbaca:
`Monthly income: 27% < Rp2M · 52% Rp2–6M · 20% > Rp6M`

---

## 3. Dua callout angka besar (kiri bawah)

### Callout 1 – ganti "96% Multi-app Planning"

**Angka besar:** `92%` **Judul miring:** `OTA-First Discovery`

**Body text:**
> respondents search and compare tickets on **Traveloka (84%)** or **Tiket.com (64%)**; only **30%** ever use an airline's own website or app.

Kenapa kuat: ini bukti bahwa kesan pertama terhadap Garuda adalah *daftar harga OTA yang di-sort dari termurah* — jadi benefit full-service tidak terlihat saat momen memilih. Ini fondasi rekomendasi "surface the value inside OTAs".

### Callout 2 (dengan ikon lampu = key insight) – ganti "62% Discovery Gap"

**Angka besar:** `50% → 16%` **Judul miring:** `The Graduation Gap`

**Body text:**
> Garuda is considered next by **50%** of youth who fly ≤ 1×/yr, but only **16%** of frequent flyers (4+/yr); **54%** of high-income youth prefer a foreign full-service carrier (mainly Singapore Airlines).

Kenapa kuat: ini temuan inti seluruh analisis (satu-satunya prediktor yang signifikan secara statistik, p ≈ 0.02) dan menjadi alasan mengapa dua kolom di kanan dipecah berdasarkan frekuensi terbang. Angka 50% dan 16% identik dengan `figures/12_headline_numbers.png` dan `08b2_graduation_gap.png`, jadi konsisten dengan slide utama.

*Alternatif jika ingin satu angka saja:* `34%` **Would Consider Garuda Next** — "vs 19% Singapore Airlines, 17% Citilink; two-thirds of young travelers look elsewhere."

---

## 4. Kolom tengah – ganti "Regular Traveler User (n)"

**Header kotak biru:** `Occasional & Regular Flyers (n = 45)`
**Sub-label kecil di kanan header:** `≤ 3 flights / year`

**Satu baris konteks di bawah header** (font kecil, opsional tapi sangat disarankan):
`Would consider Garuda next: 42% · Top barrier: price gap too large (60%)`

### Box 1 – ganti "Reason They Use Other Airlines"

**Judul baru:** `What Makes a Premium Fare Worth It`

| Label bar | % |
|---|---|
| Larger baggage allowance | **62%** |
| Better punctuality | **60%** |
| More comfortable seats | **60%** |
| Quality food & beverage | **58%** |

Insight untuk speaker notes: bagi kelompok ini "premium" = **kepastian perjalanan** (bagasi, tepat waktu, reschedule) → cocok dengan bundle *Certainty+*.

### Box 2 – ganti "Willing To Use Garuda If"

**Judul baru:** `Would Still Choose a Pricier Garuda For…`

| Label bar | % |
|---|---|
| Safety & reputation | **64%** |
| Punctuality | **62%** |
| Comfort | **53%** |
| Service | **53%** |

---

## 5. Kolom kanan – ganti "Non-Regular Traveler User (n)"

**Header kotak biru:** `Frequent Flyers (n = 19)`
**Sub-label kecil di kanan header:** `4+ flights / year`

**Satu baris konteks di bawah header:**
`Would consider Garuda next: 16% · 37% prefer a foreign full-service carrier`

### Box 1 – ganti "What They Love about Garuda"

**Judul baru:** `What Makes a Premium Fare Worth It`

| Label bar | % |
|---|---|
| Quality food & beverage | **74%** |
| More comfortable seats | **74%** |
| Better punctuality | **63%** |
| Better cabin crew service | **53%** |

Insight: bagi frequent flyer "premium" = **on-board experience** (makanan, kursi, crew) — bagasi turun ke 42%. Kontras dengan kolom tengah inilah yang membenarkan dua bundle berbeda (*Comfort+* vs *Certainty+*).

### Box 2 – ganti "Things To Improve for Garuda"

**Judul baru:** `Would Still Choose a Pricier Garuda For…`

| Label bar | % |
|---|---|
| Safety & reputation | **74%** |
| Punctuality | **58%** |
| Comfort | **47%** |
| Service | **37%** |

Insight: brand equity Garuda tetap utuh bahkan di kelompok yang paling sering "kabur" — tetapi kredit untuk **service hanya 37%** (vs 53% di kolom tengah). Inilah masalah *konsistensi*, bukan harga.

> **Kenapa kedua kolom dibuat simetris (judul box sama):** pembaca bisa langsung membandingkan angka kiri–kanan. Template aslinya memakai 4 judul berbeda sehingga tidak bisa dibandingkan.

---

## 6. Opsi B – kalau ingin mempertahankan judul template "Reason They Use Other Airlines"

Ganti Box 1 di **kedua** kolom dengan data hambatan (`reasons_not_premium`, max 3 pilihan):

**Judul:** `Why They Don't Pick the Pricier Airline`

| Label bar | ≤ 3 flights/yr (n = 45) | 4+ flights/yr (n = 19) |
|---|---|---|
| Price gap is too large | **60%** | **58%** |
| I don't really need premium benefits | **51%** | **47%** |
| Cheaper airlines are comfortable enough | **42%** | **47%** |
| Other airlines' schedules fit better / promos more attractive | 27% (schedule) | 21% (promo) |

Catatan: hambatannya hampir sama di kedua kelompok → pesannya "the barrier is **legibility**, not refusal" (hanya 5% dari total yang menolak membayar lebih sama sekali; 48% "depends on the benefit"). Data ini lebih cocok dipakai di slide utama tentang *price war tension*; untuk slide profil ini, §4–5 lebih kaya kontrasnya.

---

## 7. Opsi split alternatif (jika kalian lebih suka 2 kelompok yang lebih seimbang)

Potongan **0–1 flights/yr (n = 24)** vs **2+ flights/yr (n = 40)**:

| Metrik | 0–1 flights/yr (n = 24) | 2+ flights/yr (n = 40) |
|---|---|---|
| Would consider Garuda next | **50%** | **25%** |
| Prefer foreign FSC | 8% | 30% |
| Income > Rp6M | 4% | 30% |
| WTP "depends on benefit" | 33% | 57% |
| Worth-it top 4 | F&B 67%, Baggage 62%, Seats 58%, Reschedule/Wi-Fi 50% | Punctuality 72%, Seats 68%, F&B 60%, Baggage 52% |
| Stay-with-Garuda top 4 | Punctuality 67%, Safety & reputation 58%, Comfort 54%, Service 54% | Safety & reputation 72%, Punctuality 57%, Comfort 50%, Service 45% |

Kelebihan: angka 50% cocok persis dengan callout. Kekurangan: kehilangan angka 16% yang menjadi headline deck. **Rekomendasi tetap §4–5 (≤3 vs 4+).**

---

## 8. Footnote sumber (wajib, sesuai case book: disclose methodology & limitations)

Teks kecil di bagian bawah slide:

> Source: Team primary survey (Google Forms, 8–12 Sep 2026), n = 64 young Indonesian travelers; convenience sample (89% university students, 86% Jabodetabek) – directional, not nationally representative. Multi-select questions show % of respondents selecting each option and do not sum to 100%.

---

## 9. Checklist angka final (untuk verifikasi saat desain)

| Elemen slide | Angka | Basis |
|---|---|---|
| Age 18–23 | 60 / 64 = 94% | semua responden |
| University student | 57 / 64 = 89% | semua |
| Leisure / holiday | 48 / 64 = 75% | semua, multi-select |
| Flew in last 2 yrs | 56 / 64 = 88% | semua |
| OTA-first (Traveloka dan/atau Tiket.com) | 59 / 64 = 92% | semua |
| Traveloka / Tiket.com / airline direct | 84% / 64% / 30% | semua |
| Garuda consideration: ≤1 flight → 4+ flights | 50% (n = 24) → 16% (n = 19) | `considers_garuda` |
| High-income prefer foreign FSC | 54% (n = 13) | `income_tier` = High |
| Garuda consideration ≤3 flights | 42% (n = 45) | kolom tengah |
| Worth-it ≤3: baggage / punctuality / seats / F&B | 62 / 60 / 60 / 58% | n = 45 |
| Stay ≤3: safety-rep / punctuality / comfort / service | 64 / 62 / 53 / 53% | n = 45 |
| Worth-it 4+: F&B / seats / punctuality / crew | 74 / 74 / 63 / 53% | n = 19 |
| Stay 4+: safety-rep / punctuality / comfort / service | 74 / 58 / 47 / 37% | n = 19 |
| Frequent flyers prefer foreign FSC | 37% (n = 19) | kolom kanan |

Figure pendukung yang bisa ditempel di appendix berikutnya (part 2): `02_respondent_profile.png`, `03_trip_purpose_and_channels.png`, `08b2_graduation_gap.png`, `06b_worth_it_by_segment.png`, `08c_garuda_retention_levers.png`.

---

## 10. Satu kalimat "so-what" untuk dibacakan saat slide ini tampil

> "Our respondents are the exact cohort the case describes – young students who already fly and book through OTAs. Garuda is the default for those who fly rarely, but consideration collapses to 16% once they fly 4+ times a year. Both groups would still pay more for Garuda for safety and punctuality; what differs is *what premium means* – certainty and baggage for occasional flyers, on-board food, seats and crew for frequent flyers. That is why our strategy is a retention ladder with two bundles, not a discount."
