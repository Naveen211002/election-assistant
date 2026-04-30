# PromptWars Submission Checklist

Use this checklist before final upload.

## Mandatory Rules
- [x] Repository is public
- [x] Single branch used (`main`)
- [x] Repository tracked size is under 10 MB
- [x] Project code is complete in repository

## Challenge Expectation Mapping
- [x] Smart dynamic assistant logic implemented (`/api/chat`)
- [x] Context-aware and fallback decision making implemented
- [x] Google Services integrated (Gemini + optional BigQuery telemetry)
- [x] Practical real-world voter education use case
- [x] Clean and maintainable code with lint/test setup

## Required Submission Contents
- [x] README includes:
  - [x] Chosen vertical
  - [x] Approach and logic
  - [x] How solution works
  - [x] Assumptions
- [x] API endpoints documented
- [x] Environment variables documented via `.env.example`

## Quality Gates
- [x] `npm run lint` passes
- [x] `npm test` passes
- [x] `npm audit --omit=dev` has no production vulnerabilities
- [x] No hardcoded API secrets in tracked files

## Final Push Checklist
- [ ] Run final local smoke test (`npm start`)
- [ ] Commit all project changes
- [ ] Push latest `main` branch
- [ ] Verify GitHub README renders correctly
