# Submission: Notice Explainer — Team Notice Explainer

## Project Name
Notice Explainer 🛡️📄

## Tagline
Understand official notices safely in Telugu, Hindi, or English.

## Team or Attendee Name
Team Notice Explainer

## Summary
Notice Explainer helps elderly users, first-generation English readers, and small business owners in India quickly understand official-looking notices such as electricity disconnection warnings, bank KYC requests, court summons, tax demands, and insurance lapse notices.

The app performs immediate triage, not legal advice:
1. Photograph a physical notice (with in-browser automatic compression under Vercel payload limits).
2. Select Telugu, Hindi, or English.
3. Receive a clear, high-contrast triage summary:
   - What the notice is
   - What immediate action is required
   - Explicitly visible deadlines or amounts due (strictly null if absent; no guessing)
   - Scam Shield red flag warnings (OTP/PIN, personal UPI, fake officer threats)
   - Uncertainty FallbackCard for blurry or ambiguous photos
4. Listen to the summary aloud in native regional speech (`te-IN`, `hi-IN`, `en-IN`) via Web Speech API.
5. Share the formatted summary directly with family on WhatsApp via `wa.me` deep link.

## Technology Stack
- **AI Model**: Gemma 4 through the Gemini API (`gemma-4-31b-it`, `gemma-4-26b-a4b-it`) using `@google/genai`
- **Frontend / Framework**: Next.js App Router (TypeScript Strict Mode), Tailwind CSS
- **Typography & Localization**: `next/font/google` loading `Noto Sans Telugu` and `Noto Sans Devanagari` to prevent broken regional glyphs
- **Validation**: Zod runtime schema validation on all inputs and model outputs
- **Audio & Sharing**: Web Speech API (`speechSynthesis`) and WhatsApp (`wa.me`)
- **PWA**: Web App Manifest (`manifest.json`) and mobile viewport optimization
- **Testing**: Built-in 24-test evaluation suite (`npm run eval`) with 100% pass rate

## Security & Privacy
- Zero image persistence: photos processed in-memory as inline multimodal data.
- Server-side environment variable security for `GEMINI_API_KEY`.
- Prompt-injection defense: all text inside notice images treated strictly as passive data.

## Demo Video & Instructions
- Launch application at `http://localhost:3000`.
- Try preloaded sample notices (Electricity Bill, Scam Disconnect, Bank KYC Phishing, Court Summons, Property Tax, Insurance Lapse, Blurry Fallback, Lottery Phishing).
- Run automated benchmarks: `npm run eval`.
