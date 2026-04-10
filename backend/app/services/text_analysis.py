import re
from collections import Counter
from typing import List, Dict

# Download NLTK stopwords on first use
_STOPWORDS: set = set()

def _load_stopwords() -> set:
    global _STOPWORDS
    if _STOPWORDS:
        return _STOPWORDS
    try:
        from nltk.corpus import stopwords as nltk_sw
        _STOPWORDS = set(nltk_sw.words("english"))
    except LookupError:
        import nltk
        nltk.download("stopwords", quiet=True)
        from nltk.corpus import stopwords as nltk_sw
        _STOPWORDS = set(nltk_sw.words("english"))
    # Domain-specific stops
    _STOPWORDS |= {
        "nike", "product", "got", "get", "one", "would", "also", "even", "still",
        "really", "much", "many", "every", "just", "like", "time", "bought",
        "item", "purchase", "order", "ordered", "use", "used", "using", "want",
        "need", "could", "make", "made", "way", "week", "day", "back",
        "never", "always", "know", "think", "said", "went", "come", "came",
        "brand", "customer", "experience", "store", "online", "shoes", "pair",
        "first", "last", "well", "going", "they", "their", "there", "very",
        "good", "great", "love",  # kept separately for sentiment word cloud
    }
    return _STOPWORDS


# Sentiment word lists for coloring the word cloud
_POSITIVE_WORDS = {
    "love", "great", "good", "amazing", "excellent", "best", "perfect",
    "fantastic", "awesome", "happy", "satisfied", "quality", "comfortable",
    "stylish", "recommend", "worth", "smooth", "fast", "easy", "helpful",
    "responsive", "beautiful", "durable", "premium", "impressed",
}
_NEGATIVE_WORDS = {
    "bad", "terrible", "awful", "poor", "waste", "broken", "fail", "failed",
    "disappointed", "disappointing", "worse", "worst", "horrible", "useless",
    "delayed", "crashed", "crash", "error", "fake", "counterfeit", "rude",
    "expensive", "overpriced", "stuck", "slow", "refused", "ignored",
    "lost", "missing", "damaged", "refund", "stolen", "scam", "bots",
}


def _tokenize(text: str) -> List[str]:
    stops = _load_stopwords()
    text = re.sub(r"[^a-zA-Z\s]", " ", text.lower())
    return [w for w in text.split() if len(w) > 3 and w not in stops]


def get_wordcloud_data(records, top_n: int = 80) -> List[Dict]:
    """Return word frequency list for word cloud rendering."""
    all_words: List[str] = []
    for r in records:
        all_words.extend(_tokenize(r.text))

    counter = Counter(all_words)
    result = []
    for word, count in counter.most_common(top_n):
        if word in _POSITIVE_WORDS:
            sentiment = "positive"
        elif word in _NEGATIVE_WORDS:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        result.append({"text": word, "value": count, "sentiment": sentiment})
    return result


def _auto_label(keywords: List[str]) -> str:
    kw = set(keywords)
    if kw & {"app", "crash", "login", "payment", "checkout", "website", "snkrs", "launch", "glitch"}:
        return "App & Digital Experience"
    if kw & {"quality", "material", "stitching", "durability", "sizing", "size", "fit", "comfort", "sole"}:
        return "Product Quality & Fit"
    if kw & {"delivery", "shipping", "arrived", "package", "courier", "delayed", "late", "dispatch"}:
        return "Delivery & Shipping"
    if kw & {"price", "expensive", "worth", "value", "money", "cost", "cheap", "pricing", "overpriced"}:
        return "Pricing & Value"
    if kw & {"staff", "service", "rude", "helpful", "manager", "exchange", "return", "refund", "support"}:
        return "Customer Service"
    if kw & {"stock", "sold", "available", "restock", "limited", "bots", "queue", "inventory"}:
        return "Stock & Availability"
    return "General Feedback"


def get_topic_model(records, n_topics: int = 5, n_top_words: int = 8) -> List[Dict]:
    """LDA topic modeling on feedback text."""
    try:
        from sklearn.feature_extraction.text import CountVectorizer
        from sklearn.decomposition import LatentDirichletAllocation
    except ImportError:
        return []

    texts = [" ".join(_tokenize(r.text)) for r in records if r.text]
    texts = [t for t in texts if len(t.split()) >= 3]

    if len(texts) < max(n_topics * 2, 10):
        return []

    try:
        vectorizer = CountVectorizer(max_df=0.90, min_df=2, max_features=600)
        dtm = vectorizer.fit_transform(texts)

        lda = LatentDirichletAllocation(
            n_components=n_topics, random_state=42, max_iter=25, learning_method="batch"
        )
        lda.fit(dtm)

        feature_names = vectorizer.get_feature_names_out()
        topics = []
        for i, component in enumerate(lda.components_):
            top_idx = component.argsort()[-n_top_words:][::-1]
            keywords = [feature_names[idx] for idx in top_idx]
            # Relevance score: proportion of this topic's total weight
            total_weight = lda.components_.sum()
            relevance = float(component.sum() / total_weight) if total_weight > 0 else 0.0
            topics.append({
                "topic_id": i,
                "label": _auto_label(keywords),
                "keywords": keywords,
                "relevance": round(relevance * 100, 1),
            })

        # Sort by relevance descending
        return sorted(topics, key=lambda t: t["relevance"], reverse=True)

    except Exception as e:
        print(f"[Signal360] Topic modeling error: {e}")
        return []


def get_sentiment_keywords(records) -> Dict:
    """Top words split by positive vs negative feedback records."""
    pos_words: List[str] = []
    neg_words: List[str] = []
    for r in records:
        tokens = _tokenize(r.text)
        if r.sentiment_label == "positive":
            pos_words.extend(tokens)
        elif r.sentiment_label == "negative":
            neg_words.extend(tokens)

    pos_top = [{"text": w, "count": c} for w, c in Counter(pos_words).most_common(20)]
    neg_top = [{"text": w, "count": c} for w, c in Counter(neg_words).most_common(20)]
    return {"positive": pos_top, "negative": neg_top}
