# Civisense

**AI-Powered Legislative Consultation Analysis Platform**

Civisense is an AI-driven platform designed to help policymakers, government agencies, and regulatory bodies analyze large-scale public consultation feedback efficiently.

The platform ingests consultation documents, stakeholder comments, and uploaded PDFs, then automatically performs:

* Document extraction and preprocessing
* Intelligent summarization
* Sentiment analysis
* Clause-level feedback analysis
* Keyword and topic extraction
* Public consensus generation
* Interactive dashboard visualization

The goal is to transform thousands of pages of stakeholder feedback into actionable insights that support better policy and legislative decisions.

---

# Problem Statement

Government consultation portals often receive large volumes of feedback from:

* Chartered Accountants
* Corporate Lawyers
* Industry Bodies
* Professional Associations
* Citizens

Challenges include:

* High volume of submissions
* Long and complex legal documents
* References to specific clauses and sections
* Mixed sentiment within a single comment
* Manual review bottlenecks
* Risk of missing critical expert feedback

Civisense addresses these challenges through an AI-powered analysis pipeline.

---

# Project Objectives

## 1. Automated Document Processing

Extract text from uploaded PDF files and consultation documents.

## 2. Stakeholder Feedback Summarization

Generate concise summaries while preserving:

* Intent
* Suggestions
* Concerns
* Recommendations

## 3. Sentiment Analysis

Determine:

* Positive feedback
* Negative feedback
* Neutral feedback
* Mixed opinions

## 4. Clause-Level Intelligence

Identify references such as:

* Section 135(5)
* Clause 4
* Rule 7

and determine public sentiment around each clause.

## 5. Topic Discovery

Automatically discover:

* Frequently discussed issues
* Emerging concerns
* Repeated recommendations

## 6. Public Consensus Generation

Produce an overall consensus report summarizing:

* Major concerns
* Supported provisions
* Criticized provisions
* Minority expert observations

---

# Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* ShadCN UI
* Recharts
* React Dropzone
* Axios

## Backend

* FastAPI
* Python 3.12+

## AI & NLP

* LangChain
* LangChain-Groq
* Groq API
* Llama 3.3 70B

## NLP Libraries

* spaCy
* KeyBERT
* Sentence Transformers

## PDF Processing

* PyPDF
* PDFPlumber

## Data Processing

* Pandas
* NumPy

## Visualization

* WordCloud
* Matplotlib

---

# System Architecture

```text
                    ┌───────────────┐
                    │    User       │
                    └───────┬───────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Next.js Frontend  │
                 └─────────┬───────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │    FastAPI API      │
                 └─────────┬───────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │ PDF Processing Layer│
                 └─────────┬───────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │ Text Chunking Layer │
                 └─────────┬───────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│Summarization│   │ Sentiment   │   │ Clause      │
│   Engine    │   │  Analysis   │   │ Extraction  │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ▼
               ┌───────────────────┐
               │ Consensus Engine  │
               └─────────┬─────────┘
                         ▼
               ┌───────────────────┐
               │ Dashboard Results │
               └───────────────────┘
```

---

# Backend Directory Structure

```text
backend/

app/

├── main.py

├── api/
│   └── analysis.py

├── services/
│   ├── pdf_loader.py
│   ├── summarizer.py
│   ├── sentiment.py
│   ├── clause_extractor.py
│   ├── keyword_extractor.py
│   └── consensus.py

├── chains/
│   ├── summary_chain.py
│   └── consensus_chain.py

├── schemas/
│   ├── request.py
│   └── response.py

├── core/
│   ├── config.py
│   └── groq.py

├── utils/
│   ├── chunking.py
│   └── helpers.py

uploads/

requirements.txt
.env
```

---

# Frontend Directory Structure

```text
frontend/

src/

app/
├── page.tsx

components/

├── upload/
│   └── UploadZone.tsx

├── dashboard/
│   ├── SummaryCard.tsx
│   ├── SentimentChart.tsx
│   ├── ClauseTable.tsx
│   ├── TopicCard.tsx
│   └── WordCloud.tsx

lib/
└── api.ts

types/
└── analysis.ts
```

---

# Request Flow

## Step 1

User uploads PDF(s).

```text
Upload PDF
```

## Step 2

Frontend sends file to backend.

```http
POST /api/analyze
```

## Step 3

Backend extracts document text.

```text
PDF
 ↓
Text Extraction
```

## Step 4

Text is chunked.

```text
Raw Text
 ↓
Chunking
```

## Step 5

Chunks are processed.

```text
Chunk
 ↓
Summary
 ↓
Sentiment
 ↓
Keywords
 ↓
Clause References
```

## Step 6

Results are aggregated.

```text
Individual Results
 ↓
Consensus Generation
```

## Step 7

Response returned.

```json
{
  "summary": "...",
  "sentiment": {},
  "keywords": [],
  "clauses": {},
  "consensus": {}
}
```

## Step 8

Frontend dashboard renders visualizations.

---

# API Routes

## Health Check

### GET /

Returns server status.

Response:

```json
{
  "status": "running"
}
```

---

## Analyze Consultation Document

### POST /api/analyze

Uploads and analyzes PDF.

Request:

```multipart
file: consultation.pdf
```

Response:

```json
{
  "summary": "Summary text",
  "sentiment": {
    "positive": 45,
    "negative": 30,
    "neutral": 25
  },
  "keywords": [
    "CSR",
    "Compliance",
    "Penalty"
  ],
  "clauses": {
    "Section 135(5)": 14,
    "Clause 4": 9
  },
  "consensus": {
    "supported": [],
    "criticized": [],
    "recommendations": []
  }
}
```

---

# Core AI Components

## PDF Loader

Responsible for:

* Reading PDFs
* Extracting text
* Handling multi-page documents

Libraries:

* PyPDF
* PDFPlumber

---

## Chunking Engine

Breaks long documents into manageable chunks for LLM processing.

Library:

* LangChain RecursiveCharacterTextSplitter

---

## Summarization Engine

Uses:

* Groq
* Llama 3.3 70B

Extracts:

* Main concerns
* Recommendations
* Referenced clauses
* Actionable feedback

---

## Sentiment Engine

Determines:

* Positive
* Negative
* Neutral
* Mixed

for each stakeholder comment.

---

## Clause Extraction Engine

Identifies legal references.

Examples:

* Section 135
* Section 135(5)
* Clause 4
* Rule 7

Tracks:

* Mention count
* Associated sentiment

---

## Topic Extraction Engine

Uses:

* KeyBERT
* Sentence Transformers

Extracts:

* Important themes
* Recurring issues
* Frequently discussed concepts

---

## Consensus Engine

Generates:

* Public consensus summary
* Top concerns
* Supported provisions
* Criticized provisions
* Minority expert observations

---

# Future Enhancements

## Phase 2

* CSV uploads
* Excel uploads
* Multiple PDF uploads
* Batch processing

## Phase 3

* Authentication
* User dashboards
* Historical reports
* Report downloads

## Phase 4

* RAG-powered consultation Q&A
* Vector database integration
* Clause comparison across versions
* Legislative impact forecasting

---

# Running Locally

## Option 1: Unified Quickstart (Recommended)

Run both the backend and frontend simultaneously with a single command:

```bash
./start.sh
```

* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:8000](http://localhost:8000)
* **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Option 2: Running Independently

### Backend

```bash
cd backend
uv venv .venv && source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

Backend API: `http://localhost:8000`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

---

# Environment Variables

Backend `.env` (optional for local demo testing, required for Groq Llama 3.3):

```env
DATABASE_URL=sqlite:///./civisense.db
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.2
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

# Vision

Civisense aims to become an intelligent policy-analysis platform that helps governments and institutions transform large-scale public consultation feedback into clear, evidence-based legislative insights, reducing manual review effort while ensuring critical stakeholder voices are never overlooked.
