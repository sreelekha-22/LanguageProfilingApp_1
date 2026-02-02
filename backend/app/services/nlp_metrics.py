import spacy

nlp = spacy.load("en_core_web_sm")

def analyze_text(text: str):
    doc = nlp(text)

    sentences = list(doc.sents)
    words = [t.text.lower() for t in doc if t.is_alpha]

    grammar_errors = 0
    for sent in sentences:
        has_verb = any(t.pos_ == "VERB" for t in sent)
        if not has_verb:
            grammar_errors += 1

    vocab_richness = len(set(words)) / max(len(words), 1)

    return {
        "grammar_errors_estimate": grammar_errors,
        "vocab_score": round(vocab_richness, 3),
        "sentence_count": len(sentences),
        "word_count": len(words),
    }
