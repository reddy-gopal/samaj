# Notice Explainer 🛡️📄
> **Understand official notices safely in Telugu, Hindi, or English.**  
> *Built for MLH Hacktoberfest Hackathon.*

---

## 🌟 Project Overview

**Notice Explainer** is a mobile-first, privacy-respecting web application designed to help elderly citizens, first-generation English readers, and small business owners in India navigate confusing and threatening official-looking notices. 

Whether it is an electricity disconnection warning, bank KYC deadline, tax demand, court summons, or insurance lapse letter, **Notice Explainer provides immediate safety triage—not legal advice.** Users photograph physical notices and receive instant, plain-language answers in their native language (Telugu, Hindi, or English).

---

## 🚩 Problem Statement

In India, cybercriminals frequently exploit fear and bureaucratic intimidation through deceptive physical letters and SMS notices:
- **Electricity Disconnection Scams:** Threatening power cut within hours unless money is paid to a personal UPI ID or an unverified mobile number.
- **Fake Bank KYC Notices:** Threatening immediate account freeze unless an OTP, card CVV, or PIN is provided.
- **Fraudulent Legal / Court Demands:** Using spoofed official seals to demand immediate money transfers.
- **Digital Literacy Barrier:** Millions of senior citizens and regional language speakers struggle to parse dense bureaucratic jargon, making them vulnerable to extortion or causing them to miss genuine critical deadlines.

**Notice Explainer eliminates this panic through instant, structured AI triage.**

---

## ✨ Key Features

1. **Mobile-First Camera Capture & Image Upload**:
   - Single-tap camera launch with `capture="environment"`.
   - File picker supporting JPEG, PNG, WebP (up to 8 MB).
   - Instant 1-click test sample notices for Hackathon evaluation and offline demonstration.

2. **Multilingual Plain-Language Triage**:
   - **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **English** support.
   - Large, high-contrast typography designed for elderly and visually impaired users.

3. **Strict Extraction (Zero Hallucination)**:
   - Visible deadlines, amounts due, issuer names, and account references are extracted **only when explicitly present**.
   - If missing or obscured, fields evaluate strictly to `null` and are omitted—never guessed or autocompleted.

4. **Automated Scam Shield**:
   - Automatically flags red flags: personal UPI IDs, requests for OTP/CVV/PIN, threats of immediate arrest or power cutoff, and unverified phone numbers.
   - Displays a high-visibility red warning card whenever suspicious indicators are detected.

5. **Amber Uncertainty Fallback Card**:
   - Whenever an image is blurry, low-contrast, or cropped, the app triggers an uncertainty card:
     > *"I’m not sure about this notice. Please ask someone you trust or contact the official issuer directly."*

6. **Web Speech API (Text-to-Speech)**:
   - Reads the explanation aloud in natural regional speech (`te-IN`, `hi-IN`, `en-IN`), enabling access for non-literate users.

7. **One-Tap WhatsApp Sharing**:
   - Creates a structured summary message using `https://wa.me/?text=...` deep link so elderly parents can easily consult family members or trusted advisors.

8. **Zero Storage & Privacy-First**:
   - Images are processed in-memory as inline multimodal data and are **never stored permanently in any database or cloud bucket**.

---

## 🏗️ Architecture Diagram

```text
               +-------------------------------------------+
               |             Mobile User / PWA             |
               |  (Telugu / Hindi / English UI & Voice)   |
               +-------------------------------------------+
                                     |
                         [Capture Photo / Upload]
                                     |
                                     v
               +-------------------------------------------+
               |            Next.js App Router             |
               |             (Client Side)                 |
               |  • Language Switcher                      |
               |  • High-Contrast Accessible View          |
               |  • Web Speech TTS (te-IN / hi-IN / en-IN) |
               |  • WhatsApp wa.me Deep Linking            |
               +-------------------------------------------+
                                     |
                            POST /api/triage
                     (Base64 Image + Target Language)
                                     |
                                     v
               +-------------------------------------------+
               |          Secure Backend API Route         |
               |            (/app/api/triage)              |
               |  • Payload size validation (<= 8 MB)      |
               |  • MIME type validation                   |
               |  • GEMINI_API_KEY protected on server     |
               +-------------------------------------------+
                                     |
                             Inline Image Data
                          + Strict JSON Schema
                                     |
                                     v
               +-------------------------------------------+
               |       Google Gemini / Gemma Model         |
               |            (@google/genai SDK)            |
               |  • Multimodal Document Analysis           |
               |  • Scam Red Flag Detection                |
               |  • Native Script Translation              |
               +-------------------------------------------+
                                     |
                            Structured JSON
                                     |
                                     v
               +-------------------------------------------+
               |             Zod Schema Guard              |
               |             (lib/schema.ts)               |
               |  • Strict validation of all fields        |
               |  • Fallback trigger if low confidence     |
               +-------------------------------------------+
                                     |
                                     v
               +-------------------------------------------+
               |              Triage Result                |
               |  • What is this notice?                   |
               |  • What should I do?                      |
               |  • Deadline & Amount Due                  |
               |  • Scam Shield Alert (if risky)           |
               |  • Amber Fallback (if illegible)          |
               +-------------------------------------------+
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router) + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS (Tailwind v4 `@tailwindcss/turbopack`)
- **AI SDK**: `@google/genai` (Google Gen AI SDK)
- **Validation**: Zod runtime schema validation
- **Icons**: Lucide React
- **Audio**: Web Speech API (`SpeechSynthesis`)
- **Sharing**: WhatsApp Deep Linking (`wa.me`)
- **PWA**: Web App Manifest (`manifest.json`) + mobile-friendly viewport

---

## 📋 Structured JSON Schema

The backend enforces the following schema via Gemini structured outputs and Zod:

```json
{
  "language": "te",
  "is_legible": true,
  "document_type": "electricity",
  "core_meaning": "ఈ నోటీసు మీ విద్యుత్ కనెక్షన్ రాత్రి 9:30 గంటలలోపు కట్ చేయబడుతుందని బెదిరిస్తుంది.",
  "immediate_action": "ask_trusted_person",
  "action_instructions": "ఇది తీవ్రమైన మోసం (ఫేక్ నోటీస్). నోటీసులోని నంబర్‌కు కాల్ చేయవద్దు.",
  "deadline": "Today 9:30 PM",
  "amount_due": null,
  "issuer_name": "Fake Electricity Officer",
  "reference_id": "BILL-FAKE-9921",
  "scam_risk": "high_risk",
  "red_flags": [
    "వ్యక్తిగత మొబైల్ నంబర్‌కు కాల్ చేయమని డిమాండ్ చేస్తోంది",
    "తక్షణమే లైన్ కట్ చేస్తామని అనవసర అత్యవసర ఒత్తిడి తెస్తోంది"
  ],
  "confidence": "high",
  "disclaimer": "ఇది న్యాయ సలహా కాదు. చర్య తీసుకునే ముందు అధికారిక కార్యాలయంలో ధృవీకరించుకోండి."
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google AI Studio API key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Open-weight model selection (default: gemma-4-26b-a4b-it, fallback: gemma-4-31b-it)
GEMINI_MODEL=gemma-4-26b-a4b-it
```

> **Note:** If `GEMINI_API_KEY` is not provided, the app runs in built-in **Hackathon Demo Mode**, allowing judges and offline testers to test all real-world flows with the built-in sample notices.

---

## 🚀 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/notice-explainer.git
   cd notice-explainer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or open on mobile on the same local Wi-Fi network).

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `notice-explainer` repository.
4. Add the Environment Variable:
   - `GEMINI_API_KEY` = your API key.
5. Click **Deploy**. Next.js App Router and serverless routes deploy automatically.

---

## 🔒 Safety Limitations & Disclaimer

- **Not Legal Advice**: This application provides automated plain-language summaries and safety triage only. It does not provide legal representation, statutory interpretation, or binding counsel.
- **No Direct Verification**: Notice Explainer cannot authenticate physical stamps or government seals. Always contact the official department using the verified contact details on their official `.gov.in` portal or a previous physical bill.
- **Privacy Assurance**: Images are processed in-memory and are never permanently stored on servers or cloud databases.

---

## 🎬 Hackathon Demo Script

For judges and reviewers evaluating the project:

1. **Step 1: Open the Application**
   - Visit [http://localhost:3000](http://localhost:3000).
   - Observe the mobile-first high contrast UI, large touch buttons, and privacy disclosure.

2. **Step 2: Switch Languages**
   - Tap **తెలుగు (Telugu)**, **हिन्दी (Hindi)**, or **English**.
   - Notice all UI elements update immediately.

3. **Step 3: Test Scam Detection ("🚨 Fake Disconnect Notice")**
   - Click the **"🚨 Fake Disconnect Notice"** sample button.
   - See the prominent **Red Scam Warning Card** appear with detected red flags (personal UPI ID, fake officer mobile number, urgent 9:30 PM cutoff threat).
   - Notice the security rules: *"Never share OTP"*, *"Do not pay to personal UPI IDs"*.

4. **Step 4: Test Audio Narration & Sharing**
   - Click **"Listen to Summary"** to hear the text read aloud in the selected regional language.
   - Click **"Share on WhatsApp"** to preview the formatted triage summary ready to send to family members.

5. **Step 5: Test Uncertainty Fallback ("🌫️ Blurry / Cut-off Photo")**
   - Click **"Check another notice"**.
   - Click the **"🌫️ Blurry / Cut-off Photo"** sample button.
   - Observe the amber **FallbackCard**: *"I’m not sure about this notice. Please ask someone you trust or contact the official issuer directly."*

---

## 📜 License

MIT License. Developed for MLH Hacktoberfest Hackathon 2026.
