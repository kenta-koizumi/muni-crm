from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Optional
from app import models, schemas


# Categories
def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[models.Category]:
    return db.query(models.Category).offset(skip).limit(limit).all()


def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate) -> Optional[models.Category]:
    db_category = get_category(db, category_id)
    if db_category:
        update_data = category.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int) -> bool:
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False


# Accounts
def get_accounts(db: Session, skip: int = 0, limit: int = 100) -> List[models.Account]:
    return db.query(models.Account).offset(skip).limit(limit).all()


def get_account(db: Session, account_id: int) -> Optional[models.Account]:
    return db.query(models.Account).filter(models.Account.id == account_id).first()


def create_account(db: Session, account: schemas.AccountCreate) -> models.Account:
    db_account = models.Account(**account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


def update_account(db: Session, account_id: int, account: schemas.AccountUpdate) -> Optional[models.Account]:
    db_account = get_account(db, account_id)
    if db_account:
        update_data = account.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_account, key, value)
        db.commit()
        db.refresh(db_account)
    return db_account


def delete_account(db: Session, account_id: int) -> bool:
    db_account = get_account(db, account_id)
    if db_account:
        db.delete(db_account)
        db.commit()
        return True
    return False


# Transactions
def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category_id: Optional[int] = None,
    account_id: Optional[int] = None,
    type: Optional[str] = None
) -> List[models.Transaction]:
    query = db.query(models.Transaction)

    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    if account_id:
        query = query.filter(models.Transaction.account_id == account_id)
    if type:
        query = query.filter(models.Transaction.type == type)

    return query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()


def get_transaction(db: Session, transaction_id: int) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()


def create_transaction(db: Session, transaction: schemas.TransactionCreate) -> models.Transaction:
    # 自動カテゴリ分類
    if not transaction.category_id:
        transaction.category_id = auto_categorize(db, transaction.description)

    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session,
    transaction_id: int,
    transaction: schemas.TransactionUpdate
) -> Optional[models.Transaction]:
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        update_data = transaction.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_transaction, key, value)
        db.commit()
        db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False


def auto_categorize(db: Session, description: str) -> Optional[int]:
    """取引内容から自動的にカテゴリを判定"""
    categories = db.query(models.Category).all()

    for category in categories:
        if category.keywords:
            keywords = [k.strip() for k in category.keywords.split(",")]
            for keyword in keywords:
                if keyword and keyword in description:
                    return category.id

    # マッチしない場合は「その他」カテゴリを返す
    other = db.query(models.Category).filter(
        models.Category.name.in_(["その他支出", "その他収入"])
    ).first()
    return other.id if other else None


# Reports
def get_monthly_summary(db: Session, year: int, month: int) -> dict:
    """月次サマリーを取得"""
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(seconds=1)

    # 収入・支出の合計
    transactions = get_transactions(db, start_date=start_date, end_date=end_date, limit=10000)

    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expense = sum(abs(t.amount) for t in transactions if t.type == "expense")

    # カテゴリ別集計
    category_summary = db.query(
        models.Category.id,
        models.Category.name,
        func.sum(func.abs(models.Transaction.amount)).label("total"),
        func.count(models.Transaction.id).label("count")
    ).join(
        models.Transaction
    ).filter(
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).group_by(
        models.Category.id
    ).all()

    by_category = [
        {
            "category_id": cat.id,
            "category_name": cat.name,
            "total": float(cat.total),
            "count": cat.count,
            "percentage": (float(cat.total) / total_expense * 100) if total_expense > 0 else 0
        }
        for cat in category_summary
    ]

    return {
        "year": year,
        "month": month,
        "total_income": total_income,
        "total_expense": total_expense,
        "net": total_income - total_expense,
        "by_category": by_category
    }
