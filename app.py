from flask import Flask, render_template, request, jsonify
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from datasets import load_dataset
import torch

app = Flask(__name__)

# ── MODEL CONFIGURATION ───────────────────────────────────────────────────────
MODEL_NAME = "facebook/bart-large-xsum"  # Fine-tuned on XSum dataset
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Loading {MODEL_NAME} on: {device}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)
print("✓ Model loaded successfully!")

def preprocess_text(text: str) -> str:
    """Clean and normalize text input."""
    return " ".join(text.split()).strip()

def chunk_text(text: str, chunk_size: int = 800) -> list:
    """Split long articles into model-compatible chunks."""
    words = text.split()
    return [" ".join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]

def summarize_text(text: str) -> str:
    """Complete inference pipeline."""
    text = preprocess_text(text)
    if not text:
        return "No text provided."

    word_count = len(text.split())
    max_len = min(int(word_count * 0.55), 250)
    min_len = min(int(word_count * 0.25), 80)
    if min_len >= max_len:
        min_len = max(15, max_len - 20)

    chunks = chunk_text(text)
    summaries = []

    for chunk in chunks:
        inputs = tokenizer(
            chunk,
            return_tensors="pt",
            max_length=1024,
            truncation=True,
            padding="longest"
        ).to(device)

        summary_ids = model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=max_len,
            min_length=min_len,
            num_beams=6,
            length_penalty=1.5,
            no_repeat_ngram_size=3,
            early_stopping=True
        )
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        summaries.append(summary)

    return " ".join(summaries)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "Please provide some text to summarize."}), 400
    try:
        summary = summarize_text(text)
        word_count = len(text.split())
        summary_word_count = len(summary.split())
        compression = round((1 - summary_word_count / word_count) * 100, 1)
        return jsonify({
            "summary": summary,
            "stats": {
                "input_words": word_count,
                "summary_words": summary_word_count,
                "compression_rate": f"{compression}%"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/demo")
def demo():
    try:
        dataset = load_dataset("xsum", split="test[:1]", trust_remote_code=True)
        sample = dataset[0]
        return jsonify({
            "document": sample["document"],
            "reference_summary": sample["summary"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
