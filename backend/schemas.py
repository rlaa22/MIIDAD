from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)
    university: str = ""
    major: str = ""

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    university: str
    major: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    student: StudentOut

class ProblemCreate(BaseModel):
    title: str = Field(min_length=5, max_length=220)
    description: str = Field(min_length=10)
    category: str = "عام"
    required_skills: List[str] = []

class ProblemOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    author_name: str
    votes_count: int
    required_skills: List[str]

class SkillsUpdate(BaseModel):
    skills: List[str]

class MatchOut(BaseModel):
    student_id: int
    name: str
    major: str
    university: str
    matched_skills: List[str]
    match_score: int
