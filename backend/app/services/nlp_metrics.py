import spacy
from collections import Counter
from gramformer import Gramformer

# Load SpaCy English model
nlp = spacy.load("en_core_web_sm")

# Initialize Gramformer for grammar correction (1 = corrector)
gf = Gramformer(models=1, use_gpu=False)  # set use_gpu=True if you have GPU

def analyze_text(text: str):
    doc = nlp(text)
    
    # Grammar correction suggestions
    corrected_sentences = gf.correct(text)  # returns list of possible corrections
    grammar_errors = max(len(corrected_sentences) - 1, 0)  # number of suggested fixes

    # Vocabulary richness
    words = [t.text.lower() for t in doc if t.is_alpha]
    vocab_richness = len(set(words)) / max(len(words), 1)

    return {
        "grammar_errors": grammar_errors,
        "vocab_score": vocab_richness,
        "sentence_count": len(list(doc.sents)),
        "words": words
    }

# Example usage
if __name__ == "__main__":
    text = "This is a example. She go to school everyday."
    result = analyze_text(text)
    print(result)
