from fastapi import APIRouter, Query
from app.repositories.feedback_repo import feedback_repo
from app.services import text_analysis

router = APIRouter()


@router.get("/wordcloud")
def get_wordcloud(top_n: int = Query(default=80, ge=10, le=200)):
    """Word frequency data for word cloud rendering."""
    records = feedback_repo.get_all()
    return {"words": text_analysis.get_wordcloud_data(records, top_n=top_n)}


@router.get("/topics")
def get_topics(n_topics: int = Query(default=5, ge=2, le=10)):
    """LDA topic modeling results."""
    records = feedback_repo.get_all()
    return {"topics": text_analysis.get_topic_model(records, n_topics=n_topics)}


@router.get("/sentiment-keywords")
def get_sentiment_keywords():
    """Top keywords split by positive vs negative sentiment."""
    records = feedback_repo.get_all()
    return text_analysis.get_sentiment_keywords(records)
