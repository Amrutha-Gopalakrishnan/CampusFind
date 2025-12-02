import pandas as pd
import numpy as np
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors

DATA_PATH = "lost_found_300_items.csv"
MODEL_DIR = "models"

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def train_svm_model(df):
    print("Training SVM Category Model...")

    df["text"] = df["item_title"] + " " + df["description"]
    X = df["text"]
    y = df["item_category"]

    vectorizer = TfidfVectorizer(stop_words='english')
    X_vec = vectorizer.fit_transform(X)

    svm = LinearSVC()
    svm.fit(X_vec, y)

    # save
    with open(f"{MODEL_DIR}/svm_model.pkl", "wb") as f:
        pickle.dump((vectorizer, svm), f)

    print("SVM Model Trained & Saved.")
    return True


def train_minilm_location(df):
    print("Training MiniLM Location Predictor...")

    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    texts = df["description"].tolist()
    locations = df["location"].tolist()

    embeddings = model.encode(texts, convert_to_numpy=True)

    # nearest neighbors based on embeddings
    nn = NearestNeighbors(n_neighbors=1, metric="cosine")
    nn.fit(embeddings)

    data = {
        "embeddings": embeddings,
        "locations": locations,
        "nn": nn,
        "model_name": "all-MiniLM-L6-v2"
    }

    with open(f"{MODEL_DIR}/minilm_embeddings.pkl", "wb") as f:
        pickle.dump(data, f)

    print("MiniLM Embedding Model Trained & Saved.")
    return True


def train_all():
    df = pd.read_csv(DATA_PATH)

    print("Dataset Loaded. Training starting...")

    train_svm_model(df)
    train_minilm_location(df)

    print("All Models Trained Successfully.")
    return {"status": "success"}


if __name__ == "__main__":
    train_all()
