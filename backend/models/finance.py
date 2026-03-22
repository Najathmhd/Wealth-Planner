from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from models.user import PyObjectId

class IncomeSource(BaseModel):
    name: str
    amount: float

class ExpenseItem(BaseModel):
    category: str
    amount: float

class SavingsGoal(BaseModel):
    name: str
    target_amount: float
    target_date: Optional[str] = None
    current_amount: float = 0.0

class UserFinance(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    date: str # ISO format YYYY-MM-DD
    incomes: List[IncomeSource] = []
    expenses: List[ExpenseItem] = []
    savings_goals: List[SavingsGoal] = []
    total_savings: float = 0.0
    monthly_income: float = 0.0
    monthly_expenses: float = 0.0

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
