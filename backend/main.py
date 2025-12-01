from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from analysis import get_past_analysis

app = FastAPI(title="CampusFind Analytics API")

# Enable CORS so your React frontend can fetch
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "CampusFind API is running"}

@app.get("/past-analysis")
def past_analysis():
    """Return analysis JSON for dashboard"""
    data = get_past_analysis()
    return data
