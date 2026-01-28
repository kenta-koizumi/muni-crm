from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app import crud
from app.database import get_db

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/monthly/{year}/{month}")
def get_monthly_report(year: int, month: int, db: Session = Depends(get_db)):
    """月次レポートを取得"""
    return crud.get_monthly_summary(db, year, month)


@router.get("/current-month")
def get_current_month_report(db: Session = Depends(get_db)):
    """当月のレポートを取得"""
    now = datetime.now()
    return crud.get_monthly_summary(db, now.year, now.month)
