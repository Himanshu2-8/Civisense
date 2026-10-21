import re
from typing import Any, Optional


class SentimentService:
    MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    _classifier = None
    _hf_failed = False

    @classmethod
    def _get_client(cls):
        """Lazy loader for the Hugging Face transformer pipeline, with fallback protection."""
        if cls._hf_failed:
            return None

        if cls._classifier is None:
            try:
                import torch
                from transformers import pipeline

                device = 0 if torch.cuda.is_available() else -1
                cls._classifier = pipeline(
                    "sentiment-analysis",
                    model=cls.MODEL_NAME,
                    tokenizer=cls.MODEL_NAME,
                    device=device,
                )
            except Exception:
                # If torch or transformers isn't available or fails to download, switch to fallback
                cls._hf_failed = True
                cls._classifier = None

        return cls._classifier

    @staticmethod
    def _normalize_label(label: str) -> str:
        label = label.strip().lower()
        if label in {"negative", "neg", "label_0"}:
            return "negative"
        if label in {"neutral", "neu", "label_1"}:
            return "neutral"
        if label in {"positive", "pos", "label_2"}:
            return "positive"
        return "neutral"

    @classmethod
    def _heuristic_sentiment(cls, text: str) -> dict[str, Any]:
        """Fast, robust sentiment classification calibrated for legal and policy feedback."""
        text_lower = text.lower()

        negative_words = [
            "concern", "excessive", "burden", "unrealistic", "harsh", "disproportionate",
            "fail", "risk", "adversely", "penalty", "severe", "hardship", "ambiguous",
            "arbitrary", "unclear", "difficult", "unjustified", "impractical", "detrimental",
            "punitive", "vague", "disagree", "oppose", "objection", "drawback", "restrictive",
            "flawed", "stifling", "draconian", "red tape", "cumbersome", "inflexible"
        ]

        positive_words = [
            "welcome", "support", "appreciate", "beneficial", "commendable", "progressive",
            "streamlined", "clarity", "positive", "helpful", "fosters", "promotes",
            "effective", "balanced", "reasonable", "advantage", "encouraging", "efficient",
            "practical", "transparent", "constructive", "improved", "good", "vital"
        ]

        neg_score = sum(1 for w in negative_words if re.search(r'\b' + re.escape(w) + r'\b', text_lower))
        pos_score = sum(1 for w in positive_words if re.search(r'\b' + re.escape(w) + r'\b', text_lower))

        if neg_score > pos_score:
            confidence = min(0.96, 0.65 + (neg_score * 0.08))
            return {"sentiment": "negative", "score": round(confidence, 2)}
        elif pos_score > neg_score:
            confidence = min(0.96, 0.65 + (pos_score * 0.08))
            return {"sentiment": "positive", "score": round(confidence, 2)}
        else:
            return {"sentiment": "neutral", "score": 0.72}

    @classmethod
    async def analyze_sentiment(cls, text: str) -> dict[str, Any]:
        if not text or not text.strip():
            return {"sentiment": "neutral", "score": 0.50}

        classifier = cls._get_client()
        if classifier is not None:
            try:
                result = classifier(text.strip()[:512])[0]
                sentiment = cls._normalize_label(result["label"])
                score = float(result["score"])
                return {"sentiment": sentiment, "score": round(score, 4)}
            except Exception:
                pass

        return cls._heuristic_sentiment(text)

    @classmethod
    async def analyze_batch(cls, texts: list[str]) -> list[dict[str, Any]]:
        results = []
        valid_indices = []
        valid_texts = []

        for i, text in enumerate(texts):
            if text and text.strip():
                valid_indices.append(i)
                valid_texts.append(text.strip()[:512])

        classifier = cls._get_client()
        hf_results = None

        if classifier is not None and valid_texts:
            try:
                hf_results = classifier(valid_texts, batch_size=16)
            except Exception:
                hf_results = None

        # Build output aligned with input list
        hf_idx = 0
        for i, text in enumerate(texts):
            if not text or not text.strip():
                results.append({"sentiment": "neutral", "score": 0.50})
            elif hf_results is not None:
                try:
                    res = hf_results[hf_idx]
                    sentiment = cls._normalize_label(res["label"])
                    score = float(res["score"])
                    results.append({"sentiment": sentiment, "score": round(score, 4)})
                except Exception:
                    results.append(cls._heuristic_sentiment(text))
                hf_idx += 1
            else:
                results.append(cls._heuristic_sentiment(text))

        return results

    @classmethod
    async def analyze_comment(cls, comment: Any) -> Any:
        result = await cls.analyze_sentiment(comment.content or "")
        comment.sentiment = result["sentiment"]
        comment.sentiment_score = result["score"]
        return comment

    @classmethod
    async def analyze_document_comments(cls, comments: list) -> list:
        if not comments:
            return []

        texts = [c.content or "" for c in comments]
        results = await cls.analyze_batch(texts)

        for comment, result in zip(comments, results):
            comment.sentiment = result["sentiment"]
            comment.sentiment_score = result["score"]

        return comments
