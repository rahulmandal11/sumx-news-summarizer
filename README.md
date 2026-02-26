# News Article Summarizer

Text summarization web application built with BART-large-xsum and Flask for the XSum dataset.

## Overview

This project implements an automated news article summarization system using the facebook/bart-large-xsum pre-trained model. The application provides a web interface for users to input articles and receive concise abstractive summaries.

## Requirements

- Python 3.9+
- Flask
- Transformers (HuggingFace)
- PyTorch
- Datasets

## Installation

```bash
git clone <repository-url>
cd text_summarization_project
pip install -r requirements.txt
python app.py
```

Access at http://localhost:5000

## Model Selection

Selected **facebook/bart-large-xsum** because:
- Pre-trained on XSum dataset (BBC news articles)
- Generates abstractive summaries (rewrites content)
- Handles up to 1024 tokens input
- Good balance between quality and inference speed

## Implementation

### Preprocessing Pipeline

```python
def preprocess_text(text):
    return " ".join(text.split()).strip()

def chunk_text(text, chunk_size=800):
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) 
            for i in range(0, len(words), chunk_size)]
```

### Inference Pipeline

```python
def summarize_text(text):
    text = preprocess_text(text)
    chunks = chunk_text(text)
    
    summaries = []
    for chunk in chunks:
        inputs = tokenizer(chunk, return_tensors="pt", 
                          max_length=1024, truncation=True)
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=150,
            min_length=40,
            num_beams=6,
            length_penalty=1.5,
            no_repeat_ngram_size=3
        )
        summary = tokenizer.decode(summary_ids[0], 
                                   skip_special_tokens=True)
        summaries.append(summary)
    
    return " ".join(summaries)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web interface |
| `/summarize` | POST | Generate summary from JSON input |
| `/demo` | GET | Load sample XSum article |

## Project Structure

```
text_summarization_project/
├── app.py              # Flask application
├── requirements.txt    # Dependencies
├── templates/
│   └── index.html      # UI
└── README.md
```

## Dependencies

```
flask==3.0.0
transformers==4.44.2
torch==2.2.2
datasets==2.18.0
```

## Usage

**Web Interface:**
1. Paste news article in text area
2. Click "Summarize"
3. View generated summary with compression stats

**API Request:**
```bash
curl -X POST http://localhost:5000/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Article text here..."}'
```

## Results

- Achieves 60-75% text compression
- Inference time: 5-15 seconds on CPU
- Produces 2-5 sentence summaries

## License

MIT
