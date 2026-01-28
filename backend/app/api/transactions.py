from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=List[schemas.Transaction])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category_id: Optional[int] = None,
    account_id: Optional[int] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """取引一覧を取得"""
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    return crud.get_transactions(
        db=db,
        skip=skip,
        limit=limit,
        start_date=start,
        end_date=end,
        category_id=category_id,
        account_id=account_id,
        type=type
    )


@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """特定の取引を取得"""
    transaction = crud.get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.post("/", response_model=schemas.Transaction, status_code=201)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    """新規取引を作成"""
    return crud.create_transaction(db=db, transaction=transaction)


@router.put("/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(
    transaction_id: int,
    transaction: schemas.TransactionUpdate,
    db: Session = Depends(get_db)
):
    """取引を更新"""
    updated = crud.update_transaction(db, transaction_id, transaction)
    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return updated


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """取引を削除"""
    success = crud.delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
