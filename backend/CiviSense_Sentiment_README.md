# CiviSense — Sentiment Analysis Phase

This README defines the complete sentiment-analysis portion of the CiviSense backend.

The sentiment-analysis phase starts after the LangChain + Groq pipeline has extracted individual consultation comments.

The sentiment layer is responsible for:

- Reading existing comments.
- Sending comment text to Hugging Face.
- Classifying sentiment.
- Normalizing model output.
- Storing sentiment in PostgreSQL.
- Storing the sentiment confidence score.
- Processing comments efficiently.
- Handling model/API failures.
- Reporting successful and failed predictions.

The sentiment layer is NOT responsible for:

- PDF upload.
- PDF storage.
- PDF extraction.
- PDF chunking.
- Comment extraction.
- Topic extraction.
- Clause extraction.
- Raw issue extraction.
- Canonical issue generation.
- Recommendation generation.
- Overall summarization.
- Stakeholder summarization.
- Consensus generation.
- Issue clustering.
- Dashboard generation.

---

# 1. Position of Sentiment Analysis in the Complete Pipeline

The complete CiviSense pipeline is:

```text
                         PDF
                          |
                          v
                  PDFService
                          |
                          v
                ExtractionService
                          |
                          v
                       Chunks
                          |
                          v
                    LLMService
                          |
                          v
                Structured Comments
                          |
                          v
                  CommentService
                          |
                          v
                     PostgreSQL
                          |
                          v
                 SentimentService
                          |
                          v
                  Hugging Face
                          |
                          v
               Sentiment + Score
                          |
                          v
                  CommentService
                          |
                          v
                     PostgreSQL
                          |
                          v
                    LLMService
                          |
              +-----------+-----------+
              |           |           |
              v           v           v
           Overall    Stakeholder   Consensus
           Summary      Summary
              |           |           |
              +-----------+-----------+
                          |
                          v
                       Analysis
```

The important separation is:

```text
LangChain + Groq
        |
        +-- Understand the consultation
        +-- Extract structured information
        +-- Generate summaries
        +-- Generate consensus

Hugging Face
        |
        +-- Perform sentiment classification

PostgreSQL
        |
        +-- Store the results

AnalysisService
        |
        +-- Orchestrate the complete process
```

---

# 2. Existing Comment Structure

The sentiment service works on the existing `Comment` model.

The logical structure is:

```text
comments
|
+-- id
+-- document_id
+-- stakeholder_type
+-- content
+-- topic
+-- raw_issue
+-- canonical_issue
+-- clause
+-- sentiment
+-- sentiment_score
+-- recommendation
+-- created_at
```

Sentiment analysis only modifies:

```text
sentiment
sentiment_score
```

Everything else remains unchanged.

For example, before sentiment analysis:

```text
content = "The proposed GST filing frequency is too high."

topic = "GST"

raw_issue = "Frequent GST filing"

canonical_issue = "GST Filing Frequency"

clause = "Section 12"

sentiment = NULL

sentiment_score = NULL

recommendation = "Reduce filing frequency"
```

After sentiment analysis:

```text
content = "The proposed GST filing frequency is too high."

topic = "GST"

raw_issue = "Frequent GST filing"

canonical_issue = "GST Filing Frequency"

clause = "Section 12"

sentiment = "negative"

sentiment_score = 0.94

recommendation = "Reduce filing frequency"
```

The sentiment service does not modify the topic, issue, clause, stakeholder type, or recommendation.

---

# 3. Database Changes

The `Comment` model should allow sentiment to be `NULL`.

This is necessary because comments can exist before sentiment analysis has been performed.

Use:

```python
sentiment: Mapped[str | None] = mapped_column(
    String(50),
    nullable=True,
)
```

Add a confidence score:

```python
sentiment_score: Mapped[float | None] = mapped_column(
    Float,
    nullable=True,
)
```

Therefore:

```text
Before sentiment analysis:

sentiment = NULL
sentiment_score = NULL


After sentiment analysis:

sentiment = "negative"
sentiment_score = 0.94
```

After modifying the SQLAlchemy model, create an Alembic migration:

```bash
alembic revision --autogenerate -m "add sentiment score"
```

Then apply it:

```bash
alembic upgrade head
```

There should not be a separate `sentiments` table for this architecture. Sentiment belongs to an individual comment, so it is stored directly in `comments`.

---

# 4. Sentiment Labels

The application should use only three normalized sentiment labels:

```text
positive
negative
neutral
```

The Hugging Face model may return labels such as:

```text
POSITIVE
NEGATIVE
NEUTRAL
```

or model-specific labels.

The application should normalize the model output before storing it.

For example:

```text
Hugging Face result:

NEGATIVE
0.94

        |
        v

Application result:

negative
0.94
```

The rest of the application should never depend on Hugging Face-specific label names.

---

# 5. Directory Structure

The sentiment functionality should use:

```text
app/
|
+-- api/
|   |
|   +-- v1/
|       |
|       +-- analysis.py
|
+-- models/
|   |
|   +-- comment.py
|
+-- schemas/
|   |
|   +-- sentiment.py
|
+-- services/
    |
    +-- sentiment_service.py
    +-- comment_service.py
    +-- analysis_service.py
```

Responsibilities:

| File | Responsibility |
|---|---|
| `sentiment_service.py` | Communicates with Hugging Face and performs sentiment classification |
| `comment_service.py` | Handles comment database operations |
| `analysis_service.py` | Orchestrates the complete document analysis pipeline |
| `sentiment.py` | Contains Pydantic sentiment schemas |
| `comment.py` | Contains the SQLAlchemy `Comment` model |
| `analysis.py` | Contains API routes for document analysis |

---

# 6. SentimentService

The main sentiment logic belongs in:

```text
app/services/sentiment_service.py
```

The service should contain:

```text
SentimentService
|
+-- _get_client()
|
+-- analyze_sentiment()
|
+-- analyze_batch()
|
+-- analyze_comment()
|
+-- analyze_document_comments()
```

Each function has a different responsibility.

---

# 7. `_get_client()`

## Purpose

Initialize the Hugging Face client/model.

The rest of the application should not need to know how the Hugging Face client is created.

## Input

```text
None
```

## Configuration

Read configuration from environment variables.

Example:

```env
HF_API_KEY=your_api_key
HF_MODEL=your_model
```

## Returns

```text
Hugging Face client
```

Conceptually:

```python
client = SentimentService._get_client()
```

The client creation logic should remain inside this function.

---

# 8. `analyze_sentiment()`

This is the lowest-level sentiment-analysis function.

It accepts one piece of text and sends it to the Hugging Face model/API.

## Input

```python
text: str
```

Example:

```text
"The proposed GST filing frequency will significantly increase compliance costs."
```

## Processing

```text
Text
 |
 v
Hugging Face
 |
 v
Model prediction
 |
 v
Extract label + confidence
 |
 v
Normalize label
 |
 v
Return application-level result
```

## Output

```python
dict
```

Example:

```json
{
  "sentiment": "negative",
  "score": 0.94
}
```

The output contains:

```text
sentiment
    |
    +-- positive
    +-- negative
    +-- neutral

score
    |
    +-- model confidence
```

## Function Signature

```python
@staticmethod
async def analyze_sentiment(
    text: str,
) -> dict:
    ...
```

---

# 9. `analyze_sentiment()` Examples

Example 1:

Input:

```text
"The proposed GST filing frequency will significantly increase compliance costs."
```

Output:

```json
{
  "sentiment": "negative",
  "score": 0.94
}
```

Example 2:

Input:

```text
"The proposed amendment will significantly reduce the compliance burden."
```

Output:

```json
{
  "sentiment": "positive",
  "score": 0.91
}
```

Example 3:

Input:

```text
"The notification specifies the filing date as 30 September."
```

Output:

```json
{
  "sentiment": "neutral",
  "score": 0.78
}
```

These are examples of the expected application-level output structure. The actual sentiment and score are determined by the selected Hugging Face model.

---

# 10. Empty Text Handling

Empty text should not be sent to Hugging Face.

For example:

```python
text = ""
```

should not result in an API request.

Preferred behavior:

```text
Empty text
    |
    v
Skip
```

Invalid or empty comments should ideally have already been filtered during the LangChain comment-extraction stage.

However, `SentimentService` should still validate its input.

---

# 11. `analyze_batch()`

`analyze_batch()` processes multiple texts.

Batch processing is preferable to making a separate API request for every comment when the Hugging Face integration supports batching.

Instead of:

```text
500 comments
    |
    +-- API request
    +-- API request
    +-- API request
    +-- ...
    +-- API request

500 API calls
```

the preferred approach is:

```text
500 comments
    |
    v
Create batches
    |
    +-- Batch 1
    +-- Batch 2
    +-- Batch 3
    +-- ...
    |
    v
Hugging Face
```

## Input

```python
texts: list[str]
```

Example:

```python
[
    "The filing requirements are too complicated.",
    "The proposed system will reduce compliance burden.",
    "The amendment is unclear."
]
```

## Output

```python
list[dict]
```

Example:

```json
[
  {
    "sentiment": "negative",
    "score": 0.94
  },
  {
    "sentiment": "positive",
    "score": 0.91
  },
  {
    "sentiment": "negative",
    "score": 0.86
  }
]
```

The ordering must be preserved:

```text
texts[0] -> results[0]
texts[1] -> results[1]
texts[2] -> results[2]
```

This is important because the results must later be mapped back to the correct `Comment` objects.

## Function Signature

```python
@staticmethod
async def analyze_batch(
    texts: list[str],
) -> list[dict]:
    ...
```

---

# 12. `analyze_comment()`

This function connects the sentiment model with a SQLAlchemy `Comment` object.

## Input

```python
comment: Comment
```

The function extracts:

```python
comment.content
```

and sends it to:

```python
analyze_sentiment()
```

## Processing

```text
Comment
   |
   v
comment.content
   |
   v
analyze_sentiment()
   |
   v
sentiment + score
   |
   v
Update Comment object
```

## Before

```python
comment.sentiment = None
comment.sentiment_score = None
```

## After

```python
comment.sentiment = "negative"
comment.sentiment_score = 0.94
```

## Output

```text
Comment
```

## Function Signature

```python
@staticmethod
async def analyze_comment(
    comment: Comment,
) -> Comment:
    ...
```

---

# 13. Database Commit Responsibility

`SentimentService` should not commit the database transaction inside `analyze_comment()`.

Do not do:

```text
Comment 1
    |
    v
Analyze
    |
    v
Commit

Comment 2
    |
    v
Analyze
    |
    v
Commit

Comment 3
    |
    v
Analyze
    |
    v
Commit
```

For a document containing hundreds of comments, this creates unnecessary database transactions.

Instead:

```text
Analyze all comments
        |
        v
Update all SQLAlchemy objects
        |
        v
One database commit
```

Database persistence should therefore be handled by `CommentService` or by the higher-level `AnalysisService`.

---

# 14. `analyze_document_comments()`

This function performs sentiment analysis for all comments belonging to a document.

## Input

```python
comments: list[Comment]
```

Example:

```python
[
    Comment(...),
    Comment(...),
    Comment(...)
]
```

## Processing

```text
Comments
   |
   v
Extract comment.content
   |
   v
Create list of texts
   |
   v
analyze_batch()
   |
   v
Sentiment results
   |
   v
Map results back to Comments
   |
   v
Update sentiment + score
   |
   v
Return Comments
```

## Output

```python
list[Comment]
```

Each successfully processed comment should contain:

```text
sentiment
sentiment_score
```

## Function Signature

```python
@staticmethod
async def analyze_document_comments(
    comments: list[Comment],
) -> list[Comment]:
    ...
```

---

# 15. `analyze_document_comments()` Example

Suppose the database contains three comments:

```text
Comment 1:
"The GST filing frequency is too high."

Comment 2:
"The new system will simplify compliance."

Comment 3:
"The notification specifies the deadline clearly."
```

The service creates:

```python
texts = [
    "The GST filing frequency is too high.",
    "The new system will simplify compliance.",
    "The notification specifies the deadline clearly.",
]
```

Hugging Face returns:

```json
[
  {
    "sentiment": "negative",
    "score": 0.95
  },
  {
    "sentiment": "positive",
    "score": 0.91
  },
  {
    "sentiment": "neutral",
    "score": 0.82
  }
]
```

The service maps them back:

```text
Comment 1
    sentiment = negative
    sentiment_score = 0.95

Comment 2
    sentiment = positive
    sentiment_score = 0.91

Comment 3
    sentiment = neutral
    sentiment_score = 0.82
```

---

# 16. CommentService

The comment-related database operations belong in:

```text
app/services/comment_service.py
```

`CommentService` should not communicate directly with Hugging Face.

Its responsibility is database persistence and retrieval.

The service should contain:

```text
CommentService
|
+-- create_comment()
|
+-- create_comments()
|
+-- get_comments()
|
+-- update_sentiment()
|
+-- update_sentiments()
```

---

# 17. `get_comments()`

Fetch all comments belonging to a document.

## Input

```python
document_id: UUID
db: Session
```

## Processing

```text
document_id
    |
    v
Query comments
    |
    v
Return comments
```

## Output

```python
list[Comment]
```

## Function Signature

```python
@staticmethod
def get_comments(
    document_id: UUID,
    db: Session,
) -> list[Comment]:
    ...
```

---

# 18. `update_sentiment()`

Updates sentiment for a single comment.

## Input

```python
comment_id: UUID
sentiment: str
score: float
db: Session
```

Example:

```python
comment_id = UUID(...)
sentiment = "negative"
score = 0.94
```

## Processing

```text
Find Comment
    |
    v
Update sentiment
    |
    v
Update sentiment_score
    |
    v
Return Comment
```

## Output

```text
Comment
```

Example:

```python
Comment(
    sentiment="negative",
    sentiment_score=0.94
)
```

## Function Signature

```python
@staticmethod
def update_sentiment(
    comment_id: UUID,
    sentiment: str,
    score: float,
    db: Session,
) -> Comment:
    ...
```

---

# 19. `update_sentiments()`

Updates sentiment for multiple comments.

This should be the preferred method during document-level analysis.

## Input

```python
results: list[dict]
db: Session
```

Example:

```json
[
  {
    "comment_id": "uuid-1",
    "sentiment": "negative",
    "score": 0.94
  },
  {
    "comment_id": "uuid-2",
    "sentiment": "positive",
    "score": 0.89
  },
  {
    "comment_id": "uuid-3",
    "sentiment": "neutral",
    "score": 0.76
  }
]
```

## Processing

```text
Results
   |
   v
Find corresponding comments
   |
   v
Update sentiment
   |
   v
Update sentiment_score
   |
   v
Commit once
```

## Output

```python
list[Comment]
```

## Function Signature

```python
@staticmethod
def update_sentiments(
    results: list[dict],
    db: Session,
) -> list[Comment]:
    ...
```

---

# 20. AnalysisService

The existing:

```text
app/services/analysis_service.py
```

should remain the main orchestrator.

`SentimentService` performs sentiment analysis.

`CommentService` handles database persistence.

`AnalysisService` determines the order in which all processing stages run.

The sentiment service should not be responsible for deciding when the complete document analysis begins or ends.

---

# 21. Complete Analysis Pipeline

After adding sentiment, the complete pipeline is:

```text
PDF
 |
 v
PDFService
 |
 v
ExtractionService
 |
 v
Text Chunks
 |
 v
LLMService
 |
 v
Individual Comments
 |
 v
CommentService
 |
 v
PostgreSQL
 |
 v
SentimentService
 |
 v
Hugging Face
 |
 v
Sentiment + Confidence
 |
 v
CommentService
 |
 v
PostgreSQL
 |
 v
LLMService
 |
 +-- Overall Summary
 |
 +-- Stakeholder Summary
 |
 +-- Consensus
 |
 v
Analysis
```

---

# 22. Updated `AnalysisService.analyze_document()`

The document-analysis function should eventually perform these steps.

## Input

```python
document_id: UUID
db: Session
```

## Processing Steps

```text
1. Find Document
        |
        v
2. Extract PDF text
        |
        v
3. Split text into chunks
        |
        v
4. Send chunks to Groq
        |
        v
5. Extract individual comments
        |
        v
6. Save comments
        |
        v
7. Fetch comments
        |
        v
8. Send comment text to Hugging Face
        |
        v
9. Update sentiment + confidence
        |
        v
10. Generate overall summary
        |
        v
11. Generate stakeholder summaries
        |
        v
12. Generate consensus
        |
        v
13. Save Analysis
```

## Output

```json
{
  "document_id": "uuid",
  "status": "analysis_completed"
}
```

---

# 23. Why Sentiment Runs After Comment Extraction

Sentiment should operate on individual consultation comments.

The correct flow is:

```text
PDF
 |
 v
Extract text
 |
 v
Identify individual comments
 |
 v
Comment objects
 |
 v
Sentiment analysis
```

Do not run sentiment directly on the entire PDF:

```text
Entire PDF
    |
    v
Sentiment model
```

This would mix different stakeholders and unrelated issues.

Instead:

```text
PDF
 |
 v
Individual Comments
 |
 +-- Chartered Accountant comment
 |
 +-- Corporate Lawyer comment
 |
 +-- Industry Body comment
 |
 +-- Professional Association comment
 |
 +-- Citizen comment
 |
 v
Sentiment analysis per comment
```

This keeps sentiment associated with the correct:

- stakeholder
- topic
- issue
- clause
- recommendation

---

# 24. Sentiment and Stakeholder Categories

The sentiment layer should not modify stakeholder classification.

Example:

```json
{
  "stakeholder_type": "Chartered Accountants",
  "content": "The GST filing requirements are too complex.",
  "sentiment": "negative",
  "sentiment_score": 0.94
}
```

Another comment:

```json
{
  "stakeholder_type": "Corporate Lawyers",
  "content": "The proposed amendment provides useful clarification.",
  "sentiment": "positive",
  "sentiment_score": 0.88
}
```

The sentiment service only adds:

```text
sentiment
sentiment_score
```

The stakeholder type remains unchanged.

---

# 25. Sentiment and Topics

Sentiment should also remain independent of topic extraction.

Example:

```json
{
  "topic": "GST",
  "canonical_issue": "GST Filing Frequency",
  "sentiment": "negative",
  "sentiment_score": 0.95
}
```

Another comment:

```json
{
  "topic": "CSR",
  "canonical_issue": "CSR Reporting Complexity",
  "sentiment": "negative",
  "sentiment_score": 0.89
}
```

Both comments can be negative while referring to completely different issues.

Therefore sentiment must never replace:

```text
topic
raw_issue
canonical_issue
```

---

# 26. No Separate Sentiment Table

A separate table such as:

```text
sentiments
```

is unnecessary for the current architecture.

Sentiment is a property of an individual comment.

Therefore sentiment should be stored directly in:

```text
comments
```

The table should contain:

```text
comments
|
+-- id
+-- document_id
+-- stakeholder_type
+-- content
+-- topic
+-- raw_issue
+-- canonical_issue
+-- clause
+-- sentiment
+-- sentiment_score
+-- recommendation
+-- created_at
```

This keeps the database simple.

---

# 27. Sentiment Schema

Create:

```text
app/schemas/sentiment.py
```

A basic sentiment result schema can be:

```python
from pydantic import BaseModel


class SentimentResult(BaseModel):
    sentiment: str
    score: float
```

For document-level processing:

```python
from pydantic import BaseModel


class SentimentProcessingResult(BaseModel):
    total: int
    processed: int
    failed: int
```

---

# 28. Sentiment API Route

Sentiment does not need to be exposed as a separate public API route.

The frontend should not need to call:

```text
POST /sentiment
```

Instead, sentiment is an internal processing stage of:

```text
POST /api/v1/analysis/{document_id}
```

The frontend requests document analysis:

```text
POST /api/v1/analysis/{document_id}
```

The backend internally performs:

```text
PDF
 |
 v
Extraction
 |
 v
Groq
 |
 v
Comments
 |
 v
Hugging Face
 |
 v
Sentiment
 |
 v
Summary
 |
 v
Consensus
 |
 v
Analysis
```

---

# 29. Optional Development Route

During development, it can be useful to have:

```text
POST /api/v1/analysis/{document_id}/sentiment
```

This route is useful for testing the Hugging Face integration independently.

It does not need to rerun PDF extraction or Groq.

## Processing Steps

```text
document_id
     |
     v
Fetch existing comments
     |
     v
SentimentService
     |
     v
Hugging Face
     |
     v
Update comments
     |
     v
Return processing result
```

## Example Response

```json
{
  "document_id": "uuid",
  "total_comments": 100,
  "processed": 98,
  "failed": 2
}
```

This route is primarily for development/testing and can be removed or protected later.

---

# 30. Error Handling

The sentiment layer should explicitly handle the following cases.

## 30.1 Empty Comment

```text
Empty comment
    |
    v
Skip
```

## 30.2 Hugging Face API Failure

If the Hugging Face API fails:

```text
API failure
    |
    +-- Retry if appropriate
    |
    +-- Otherwise mark prediction as failed
```

## 30.3 Rate Limit

If the API returns a rate-limit response:

```text
Rate limit
    |
    v
Retry after appropriate delay
```

The exact retry strategy depends on the Hugging Face API/client being used.

## 30.4 Invalid Model Response

If the model returns an unexpected response:

```text
Invalid model response
    |
    v
Mark prediction as failed
```

Do not blindly convert an invalid response into `neutral`.

## 30.5 Model Unavailable

If the model cannot be reached:

```text
Model unavailable
    |
    v
Controlled service error
```

---

# 31. Important Rule: Do Not Convert API Failures to Neutral

This is extremely important.

Suppose there are:

```text
500 comments
```

and Hugging Face is temporarily unavailable.

Do not store:

```text
500 comments
    |
    v
neutral
```

That would create incorrect analytics.

Instead:

```text
500 comments
    |
    +-- sentiment = NULL
    +-- sentiment_score = NULL
```

and the processing should report the failure.

If the failure occurs partway through processing, already successful predictions should be preserved.

---

# 32. Partial Failures

Suppose a document contains:

```text
500 comments
```

Hugging Face successfully processes:

```text
480 comments
```

and 20 comments fail.

The database can contain:

```text
480 comments
    |
    +-- sentiment = available
    +-- sentiment_score = available


20 comments
    |
    +-- sentiment = NULL
    +-- sentiment_score = NULL
```

The processing result can report:

```json
{
  "total": 500,
  "processed": 480,
  "failed": 20
}
```

This is preferable to failing the entire document analysis.

---

# 33. Sentiment Confidence Score

The confidence score should be stored separately from the sentiment label.

Example:

```text
sentiment = "negative"
sentiment_score = 0.94
```

The score can later be useful for:

- Displaying confidence in the dashboard.
- Identifying uncertain predictions.
- Debugging model behavior.
- Filtering low-confidence predictions.
- Evaluating the model.
- Comparing different sentiment models in the future.

The frontend does not need to display the confidence score initially, but the backend should preserve it.

---

# 34. Complete Example of One Comment

Before sentiment analysis:

```json
{
  "id": "comment-123",
  "document_id": "document-456",
  "stakeholder_type": "Chartered Accountants",
  "content": "The proposed GST filing frequency will significantly increase compliance costs.",
  "topic": "GST",
  "raw_issue": "Frequent GST filing",
  "canonical_issue": "GST Filing Frequency",
  "clause": "Section 12",
  "sentiment": null,
  "sentiment_score": null,
  "recommendation": "Reduce filing frequency"
}
```

Hugging Face returns something conceptually similar to:

```json
{
  "label": "NEGATIVE",
  "score": 0.94
}
```

The application normalizes it:

```json
{
  "sentiment": "negative",
  "score": 0.94
}
```

After updating PostgreSQL:

```json
{
  "id": "comment-123",
  "document_id": "document-456",
  "stakeholder_type": "Chartered Accountants",
  "content": "The proposed GST filing frequency will significantly increase compliance costs.",
  "topic": "GST",
  "raw_issue": "Frequent GST filing",
  "canonical_issue": "GST Filing Frequency",
  "clause": "Section 12",
  "sentiment": "negative",
  "sentiment_score": 0.94,
  "recommendation": "Reduce filing frequency"
}
```

---

# 35. Complete Service Responsibilities

| Service | Function | Input | Output | Responsibility |
|---|---|---|---|---|
| `SentimentService` | `_get_client()` | None | Hugging Face client | Initialize Hugging Face |
| `SentimentService` | `analyze_sentiment()` | `str` | `dict` | Analyze one text |
| `SentimentService` | `analyze_batch()` | `list[str]` | `list[dict]` | Analyze multiple texts |
| `SentimentService` | `analyze_comment()` | `Comment` | `Comment` | Analyze one comment |
| `SentimentService` | `analyze_document_comments()` | `list[Comment]` | `list[Comment]` | Analyze all comments |
| `CommentService` | `get_comments()` | `document_id`, `db` | `list[Comment]` | Retrieve comments |
| `CommentService` | `update_sentiment()` | `comment_id`, sentiment, score, `db` | `Comment` | Update one comment |
| `CommentService` | `update_sentiments()` | results, `db` | `list[Comment]` | Update multiple comments |
| `AnalysisService` | `analyze_document()` | `document_id`, `db` | analysis result | Orchestrate complete analysis |

---

# 36. Complete Function Contracts

## SentimentService

### `_get_client()`

```python
_get_client()

Input:
    None

Output:
    Hugging Face client
```

### `analyze_sentiment()`

```python
analyze_sentiment(
    text: str
)

Input:
    text: str

Output:
    {
        "sentiment": str,
        "score": float
    }
```

### `analyze_batch()`

```python
analyze_batch(
    texts: list[str]
)

Input:
    list[str]

Output:
    list[dict]

Example:

[
    {
        "sentiment": "negative",
        "score": 0.94
    },
    {
        "sentiment": "positive",
        "score": 0.91
    }
]
```

### `analyze_comment()`

```python
analyze_comment(
    comment: Comment
)

Input:
    Comment

Output:
    Comment
```

### `analyze_document_comments()`

```python
analyze_document_comments(
    comments: list[Comment]
)

Input:
    list[Comment]

Output:
    list[Comment]
```

---

# 37. CommentService Function Contracts

### `get_comments()`

```python
get_comments(
    document_id: UUID,
    db: Session
)

Input:
    document_id
    database session

Output:
    list[Comment]
```

### `update_sentiment()`

```python
update_sentiment(
    comment_id: UUID,
    sentiment: str,
    score: float,
    db: Session
)

Input:
    comment_id
    sentiment
    confidence score
    database session

Output:
    Comment
```

### `update_sentiments()`

```python
update_sentiments(
    results: list[dict],
    db: Session
)

Input:
    list of sentiment results
    database session

Output:
    list[Comment]
```

---

# 38. Final Architecture

```text
                              PDF
                               |
                               v
                      ExtractionService
                               |
                               v
                            Chunks
                               |
                               v
                         LLMService
                               |
                               v
                    Structured Comments
                               |
                               v
                      CommentService
                               |
                               v
                         PostgreSQL
                               |
                               v
                     SentimentService
                               |
                               v
                      Hugging Face
                               |
                               v
                    Sentiment + Score
                               |
                               v
                      CommentService
                               |
                               v
                         PostgreSQL
                               |
                               v
                         LLMService
                               |
                +--------------+--------------+
                |              |              |
                v              v              v
          Overall         Stakeholder      Consensus
          Summary           Summary
                |              |              |
                +--------------+--------------+
                               |
                               v
                           Analysis
```

---

# 39. Implementation Steps

Implement the sentiment phase in exactly this order:

```text
1. Modify Comment model
       |
       v
2. Make sentiment nullable
       |
       v
3. Add sentiment_score
       |
       v
4. Create Alembic migration
       |
       v
5. Create app/schemas/sentiment.py
       |
       v
6. Create app/services/sentiment_service.py
       |
       v
7. Configure Hugging Face API/model
       |
       v
8. Implement _get_client()
       |
       v
9. Implement analyze_sentiment()
       |
       v
10. Test one comment
       |
       v
11. Implement analyze_batch()
       |
       v
12. Test multiple comments
       |
       v
13. Implement analyze_comment()
       |
       v
14. Implement analyze_document_comments()
       |
       v
15. Implement CommentService.update_sentiment()
       |
       v
16. Implement CommentService.update_sentiments()
       |
       v
17. Integrate SentimentService into AnalysisService
       |
       v
18. Add optional development sentiment route
       |
       v
19. Test complete document analysis
```

---

# 40. Final Responsibility Split

The final architecture should follow this separation.

```text
                    CiviSense
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
   LangChain +      Hugging Face   PostgreSQL
       Groq
        |              |              |
        v              v              v
   Understand       Sentiment      Store data
   consultation    classification
        |              |
        |              |
        +------+-------+
               |
               v
        AnalysisService
               |
               v
       Complete Analysis
```

## LangChain + Groq

Responsible for:

- Extracting individual consultation comments.
- Identifying stakeholder type.
- Identifying topics.
- Identifying raw issues.
- Identifying canonical issues.
- Identifying clauses.
- Generating recommendations.
- Generating overall summaries.
- Generating stakeholder summaries.
- Generating consensus.

## Hugging Face

Responsible for:

- Sentiment classification.
- Returning confidence scores.
- Normalizing sentiment results.

## SQLAlchemy + PostgreSQL

Responsible for:

- Persisting documents.
- Persisting comments.
- Persisting sentiment.
- Persisting sentiment confidence.
- Persisting analysis results.

## AnalysisService

Responsible for:

- Orchestrating the complete pipeline.
- Calling the correct services in the correct order.
- Coordinating database operations.
- Returning the final analysis status.

---

# 41. Final Sentiment Flow

The final sentiment-analysis flow is:

```text
PDF
 |
 v
Extract PDF text
 |
 v
Split into chunks
 |
 v
Groq extracts individual comments
 |
 v
Store comments in PostgreSQL
 |
 v
Fetch comments
 |
 v
Send comment content to Hugging Face
 |
 v
Receive sentiment + confidence
 |
 v
Normalize sentiment
 |
 v
Update Comment objects
 |
 v
Commit sentiment results
 |
 v
Continue with summary / consensus generation
 |
 v
Save final Analysis
```

The key principle is that sentiment analysis operates at the **individual comment level**.

Every sentiment prediction remains associated with the original:

```text
Comment
|
+-- stakeholder_type
+-- content
+-- topic
+-- raw_issue
+-- canonical_issue
+-- clause
+-- sentiment
+-- sentiment_score
+-- recommendation
```

This allows CiviSense to later calculate sentiment independently for different:

- stakeholders
- topics
- canonical issues
- clauses
- categories
