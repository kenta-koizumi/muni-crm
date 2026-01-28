from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/", response_model=List[schemas.Account])
def list_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """口座一覧を取得"""
    return crud.get_accounts(db, skip=skip, limit=limit)


@router.get("/{account_id}", response_model=schemas.Account)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """特定の口座を取得"""
    account = crud.get_account(db, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("/", response_model=schemas.Account, status_code=201)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    """新規口座を作成"""
    return crud.create_account(db=db, account=account)


@router.put("/{account_id}", response_model=schemas.Account)
def update_account(
    account_id: int,
    account: schemas.AccountUpdate,
    db: Session = Depends(get_db)
):
    """口座を更新"""
    updated = crud.update_account(db, account_id, account)
    if not updated:
        raise HTTPException(status_code=404, detail="Account not found")
    return updated


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    """口座を削除"""
    success = crud.delete_account(db, account_id)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
