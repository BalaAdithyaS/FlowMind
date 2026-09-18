from sklearn.feature_extraction.text import TfidfVectorizer

def get_vectorizer() -> TfidfVectorizer:
    """Returns a configured TF-IDF Vectorizer for text feature extraction."""
    return TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),
        max_features=1000
    )
