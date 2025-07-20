# SummaristAI

SummaristAI is a Node.js CLI tool that uses Google Gemini AI to summarize text and documents, analyze sentiment, extract keywords, and generate insight reports. It can also save summaries in multiple formats and send them via email.

## Features
- Summarize plain text or files (PDF, DOC/DOCX, TXT)
- Sentiment analysis and keyword extraction
- Save summaries as TXT, PDF, or DOC
- Email summaries as attachments
- Example prompts and help menu

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- Google Gemini API key (set in `.env`)
- Gmail account for email sending (set in `.env`)

### Installation
1. Clone or download the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password_or_app_password
   ```

### Usage
Run the CLI tool:
```
node app.js
```
Follow the menu prompts to summarize text, files, or view help.

## File Structure
- `app.js`: Main CLI application
- `utils/`: Utility modules (file handling, sentiment analysis, examples)
- `.env`: Environment variables (not tracked by git)
- `crud-practical/`: Example web server and views (not used by CLI)

## Security
- Do not share your `.env` file or sensitive credentials.
- Summaries and insights are generated using Google Gemini AI.

## License
MIT
