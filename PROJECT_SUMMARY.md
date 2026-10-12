# LetterWise 🛡️📄
> **Understand official notices, bills, and legal letters safely in plain Telugu, Hindi, or English.**  
> *Built for MLH Hacktoberfest Hackathon 2026.*

---

## ⚡ Short Descriptions

### One-Liner / Tagline
> **Understand official notices, bills, and legal letters safely in plain Telugu, Hindi, or English.**

### Two-Sentence Elevator Pitch
> **LetterWise is a multilingual AI triage tool that helps elderly citizens and regional-language readers understand confusing official notices without panic. Users photograph or upload physical letters or PDFs to instantly receive plain-language summaries, scam shield warnings, regional voice readouts, and step-by-step guidance.**

### 50-Word Overview
> **LetterWise eliminates bureaucratic jargon and protects families from extortion scams. Powered by Google Gemma 4 multimodal AI, it examines physical documents and PDFs, extracts strict deadlines and amounts due, detects phishing red flags, and explains immediate next steps aloud in native Telugu, Hindi, or English—with zero permanent data storage.**

---

## 🚩 The Problem
In India, millions of elderly citizens, first-generation English readers, and small business owners receive intimidating official letters:
- **Electricity Cutoff Scams:** Threatening immediate power disconnection unless money is paid to a personal UPI handle or phone number.
- **Urgent Bank KYC Phishing:** Threatening bank account suspension unless sensitive OTPs, PINs, or card CVVs are revealed.
- **Dense Bureaucratic Jargon:** Legitimate court summons, municipal property tax notices, and insurance renewal grace periods go unaddressed because recipients cannot decipher complex legal jargon.

**LetterWise provides instant safety triage—not legal advice—preventing extortion panic and missed genuine deadlines.**

---

## ✨ Core Features

1. **Multimodal Input & Multi-Page PDF Inspection**:
   - Live camera viewfinder modal with environment-facing lens and torch controls.
   - Client-side image compression (< 400 KB) for high-speed analysis.
   - Client-side multi-page PDF rendering via vendored Mozilla PDF.js (100% offline, zero SSR errors) with interactive page-by-page inspection.
   - Drag-and-drop dropzone on desktop.

2. **Multilingual Regional Support**:
   - Plain-language triage available in **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **English**.
   - Dynamic real-time switching: toggle languages instantly to update explanations without re-uploading.

3. **Strict Zero-Hallucination Extraction**:
   - Extracts issuer name, deadline date, amount due, and reference ID **only when visibly present**.
   - Missing fields evaluate strictly to `null` and are omitted—never estimated or guessed.

4. **Automated Scam Shield**:
   - Flags suspicious indicators: personal UPI handles (`@ybl`, `@paytm`), OTP/PIN requests, artificial panic ("pay tonight to avoid disconnection"), and spoofed seals.
   - Renders a high-contrast amber/red warning alert.

5. **Amber Uncertainty Fallback**:
   - Blurry, low-contrast, or cropped photographs trigger an explicit advisory: *"I'm not sure about this notice. Please show this to family or contact the issuer directly."*

6. **Web Speech API (Regional TTS)**:
   - Reads the explanation aloud in natural Indian regional accents (`te-IN`, `hi-IN`, `en-IN`), making official letters accessible for non-literate seniors.

7. **1-Tap WhatsApp Family Sharing**:
   - Pre-formats a structured summary and action plan with deep link (`wa.me`) so users can consult trusted family members before taking action.

8. **8 Preloaded Demo Scenarios**:
   - Instant 1-tap testing for hackathon judges across 8 authentic scenarios (Electricity Bill, KYC Phishing, Court Summons, Property Tax, LIC Insurance, Blurry Notice, and Lottery Phishing).

---

## 🏗️ Architecture & Tech Stack

```text
               +-------------------------------------------+
               |        User Browser / PWA Interface       |
               |  (Telugu / Hindi / English UI & Speech)  |
               +-------------------------------------------+
                     |                     |
          [Camera / Image]           [Multi-Page PDF]
                     |                     |
                     v                     v
            Client-Side JPEG        Vendored PDF.js
               Compressor           (Client Canvas)
                     \                     /
                      \                   /
                       v                 v
               +-------------------------------------------+
               |            Next.js App Router             |
               |      POST /api/explain & /api/triage      |
               +-------------------------------------------+
                                   |
                         Zod Runtime Validation
                         Prompt-Injection Guard
                                   |
                                   v
               +-------------------------------------------+
               |       Google Gemma 4 / Gemini API         |
               |  Primary: gemma-4-26b-a4b-it / 31b-it    |
               |  Resilient Fallback: gemini-2.5-flash     |
               +-------------------------------------------+
                                   |
                            Strict JSON Output
                                   |
                                   v
               +-------------------------------------------+
               |               Triage Result               |
               |  • Plain-Language Core Meaning            |
               |  • Immediate Action & Step-by-Step        |
               |  • Scam Shield Flagging                   |
               |  • Regional Voice TTS (te-IN/hi-IN/en-IN) |
               |  • WhatsApp 1-Tap Family Sharing          |
               +-------------------------------------------+
```

- **Model Engine**: Google Gemma 4 open-weight multimodal models (`gemma-4-26b-a4b-it`, `gemma-4-31b-it`) with automatic fallback to Gemini 2.5 Flash.
- **Frontend**: Next.js 16 (Turbopack, App Router), React 19, TypeScript Strict Mode, Tailwind CSS.
- **PDF Engine**: Mozilla PDF.js v3.11 vendored locally in `public/pdfjs/` for zero SSR overhead and offline rendering.
- **Validation**: Zod runtime schema validation on all inputs and model outputs.
- **Fonts**: `next/font/google` with `Noto Sans Telugu` and `Noto Sans Devanagari`.
- **Audio & Sharing**: Web Speech API (`speechSynthesis`) and WhatsApp (`wa.me`) deep linking.

---

## 🧪 Benchmark Testing & Verification

LetterWise includes an automated 24-test evaluation suite covering all document types, scam detection, ambiguity handling, and language parity:

```bash
npm run eval
```

**Results:**
- **Total Tests**: 24
- **Passed Tests**: 24
- **Pass Rate**: **100.0%**
- **TypeScript Typecheck**: 0 errors (`npx tsc --noEmit`)
- **Production Build**: Clean compilation (`npm run build`)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/reddy-gopal/samaj.git
cd samaj
npm install
```

### 2. Configure Environment
Create `.env.local` with your Google Gemini / Gemma API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
