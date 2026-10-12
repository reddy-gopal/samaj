# Project Submission Template

## Project Name
Notice Explainer

## Tagline
Understand official notices safely in Telugu, Hindi, or English.

## Team Members
- Team Notice Explainer

## GitHub Repository
https://github.com/your-username/notice-explainer

## Live Demo URL
http://localhost:3000 (Vercel-ready deployment)

## Track / Theme
MLH Hacktoberfest Hackathon 2026

## Problem Statement
Millions of senior citizens, first-generation English readers, and small business owners across India receive intimidating physical letters, bill disconnection threats, court notices, and bank KYC demands. Cybercriminals exploit this confusion with fake notices demanding immediate payments via personal UPI IDs or threatening sudden arrest.

## Solution
Notice Explainer is an accessible, privacy-first mobile web application that performs instant safety triage. Users take a photo of a notice, select Telugu, Hindi, or English, and receive:
1. What the notice is
2. What immediate action is required
3. Explicitly visible deadlines and amounts due
4. Automated scam red flag warnings

## AI Model & Stack
- **Model**: Gemma 4 through the Gemini API (`@google/genai`)
- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS, Lucide React
- **Validation**: Zod runtime schema enforcement
- **Accessibility**: Web Speech API (`SpeechSynthesis`), Noto Sans Telugu & Devanagari fonts
- **Sharing**: WhatsApp deep linking (`wa.me`)
