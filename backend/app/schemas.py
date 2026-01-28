from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    type: str  # income or expense
    keywords: Optional[str] = ""
    icon: Optional[str] = "📁"
    color: Optional[str] = "#6B7280"


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    keywords: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Account Schemas
class AccountBase(BaseModel):
    name: str
    type: str  # bank, credit_card, cash, etc.
    balance: Optional[float] = 0.0
    currency: Optional[str] = "JPY"


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None
    currency: Optional[str] = None


class Account(AccountBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float
    type: str  # income or expense
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    memo: Optional[str] = None
    is_recurring: Optional[int] = 0


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category_id: Optional[int] = None
    account_id: Optional[int] = None
    memo: Optional[str] = None
    is_recurring: Optional[int] = None


class Transaction(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[Category] = None
    account: Optional[Account] = None

    class Config:
        from_attributes = True


# Report Schemas
class MonthlyReport(BaseModel):
    year: int
    month: int
    total_income: float
    total_expense: float
    net: float
    by_category: list[dict]


class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    total: float
    count: int
    percentage: float
