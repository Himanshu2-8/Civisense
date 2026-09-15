from typing import Any

import torch
from transformers import pipeline


class SentimentService:

    MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"

    _classifier = None

    @classmethod
    def _get_client(cls):
        """
        Load the Hugging Face sentiment-analysis model.

        The model is loaded only once and reused for subsequent
        predictions.
        """

        if cls._classifier is None:

            device = 0 if torch.cuda.is_available() else -1

            cls._classifier = pipeline(
                "sentiment-analysis",
                model=cls.MODEL_NAME,
                tokenizer=cls.MODEL_NAME,
                device=device,
            )

        return cls._classifier

    @staticmethod
    def _normalize_label(label: str) -> str:
        """
        Normalize Hugging Face labels into the application's
        standard sentiment labels.
        """

        label = label.strip().lower()

        if label in {"negative", "neg"}:
            return "negative"

        if label in {"neutral", "neu"}:
            return "neutral"

        if label in {"positive", "pos"}:
            return "positive"

        raise ValueError(
            f"Unexpected sentiment label returned by model: {label}"
        )

    @classmethod
    async def analyze_sentiment(
        cls,
        text: str,
    ) -> dict[str, Any]:

        # Validate input
        if not text or not text.strip():
            raise ValueError("Cannot perform sentiment analysis on empty text.")

        classifier = cls._get_client()

        # Run Hugging Face model
        result = classifier(text.strip())[0]

        # Normalize model output
        sentiment = cls._normalize_label(result["label"])

        score = float(result["score"])

        return {
            "sentiment": sentiment,
            "score": score,
        }

    @classmethod
    async def analyze_batch(
        cls,
        texts: list[str],
    ) -> list[dict[str, Any]]:

        # Keep ordering aligned with input
        results = []

        # Remove/handle empty text without sending it to HF
        valid_texts = []

        for text in texts:
            if text and text.strip():
                valid_texts.append(text.strip())
            else:
                valid_texts.append(None)

        classifier = cls._get_client()

        # Process valid texts
        model_inputs = [
            text
            for text in valid_texts
            if text is not None
        ]

        model_results = []

        if model_inputs:
            model_results = classifier(
                model_inputs,
                batch_size=16,
            )

        result_index = 0

        for text in valid_texts:

            if text is None:
                results.append(
                    {
                        "sentiment": None,
                        "score": None,
                    }
                )

            else:
                result = model_results[result_index]

                sentiment = cls._normalize_label(
                    result["label"]
                )

                score = float(
                    result["score"]
                )

                results.append(
                    {
                        "sentiment": sentiment,
                        "score": score,
                    }
                )

                result_index += 1

        return results

    @classmethod
    async def analyze_comment(
        cls,
        comment,
    ):
        """
        Analyze a single CiviSense Comment object.
        """

        result = await cls.analyze_sentiment(
            comment.content
        )

        comment.sentiment = result["sentiment"]
        comment.sentiment_score = result["score"]

        return comment

    @classmethod
    async def analyze_document_comments(
        cls,
        comments: list,
    ) -> list:

        """
        Analyze all comments belonging to a document.
        """

        if not comments:
            return []

        texts = [
            comment.content
            for comment in comments
        ]

        results = await cls.analyze_batch(texts)

        for comment, result in zip(comments, results):

            comment.sentiment = result["sentiment"]
            comment.sentiment_score = result["score"]

        return comments
