from collections import Counter
import re
from typing import List


class ClusteringService:
    @staticmethod
    def cluster_and_canonicalize(comments: List[dict]) -> List[dict]:
        """
        Normalizes raw issues and topics into canonical clusters.
        e.g., "Frequent GST filing" and "quarterly GST filing timeline" -> Canonical Issue: "Filing Frequency & Deadlines"
        """
        if not comments:
            return []

        canonical_issue_rules = [
            (r"(filing|frequency|deadline|timeline|quarterly|monthly)", "Filing Frequency & Deadlines", "Compliance Timelines"),
            (r"(penalty|penal|criminal|jail|prosecution|fine|liability)", "Decriminalization & Penalties", "Penal Liability"),
            (r"(cost|expenditure|software|infrastructure|burden|msme)", "MSME Compliance & Cost Burden", "Financial Burden"),
            (r"(reporting|audit|disclosure|xbrl|format|duplicate)", "Reporting Harmonization & Simplification", "Statutory Reporting"),
            (r"(consultation|duration|translation|vernacular|time|days)", "Consultation Window & Transparency", "Public Governance"),
            (r"(csr|social responsibility|unspent|obligation)", "CSR Expenditure & Guidelines", "Corporate Governance"),
            (r"(digital|portal|website|glitch|tech)", "Digital System Readiness & Portals", "Digital Infrastructure"),
        ]

        for comment in comments:
            content = (comment.get("content") or "") + " " + (comment.get("raw_issue") or "")
            content_lower = content.lower()

            matched = False
            for pattern, canonical, topic_name in canonical_issue_rules:
                if re.search(pattern, content_lower):
                    if not comment.get("canonical_issue"):
                        comment["canonical_issue"] = canonical
                    if not comment.get("topic") or comment.get("topic") == "General":
                        comment["topic"] = topic_name
                    matched = True
                    break

            if not matched:
                clause = comment.get("clause")
                if clause:
                    comment["canonical_issue"] = f"Clarification on {clause}"
                    comment["topic"] = "Statutory Interpretation"
                else:
                    comment["canonical_issue"] = comment.get("raw_issue") or "Regulatory Standard"
                    comment["topic"] = comment.get("topic") or "General Policy"

        return comments

    @staticmethod
    def get_top_topics(comments: List[dict], top_n: int = 5) -> List[dict]:
        if not comments:
            return []

        topics = [c.get("topic", "General") for c in comments if c.get("topic")]
        total = len(topics) or 1
        counter = Counter(topics)

        return [
            {
                "topic": topic,
                "count": count,
                "percentage": round((count / total) * 100, 1),
            }
            for topic, count in counter.most_common(top_n)
        ]
