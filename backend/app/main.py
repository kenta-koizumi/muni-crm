from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.api import transactions, categories, accounts, reports, import_csv

# データベース初期化
init_db()

app = FastAPI(
    title="個人用家計簿API",
    description="マネーフォワード的な家計簿管理システムのバックエンドAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(transactions.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(import_csv.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "個人用家計簿API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
