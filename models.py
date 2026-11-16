from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Table, Column, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .database import Base

student_skills = Table(
    "student_skills", Base.metadata,
    Column("student_id", ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)

class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    university: Mapped[str] = mapped_column(String(160), default="")
    major: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    skills = relationship("Skill", secondary=student_skills, back_populates="students")
    problems = relationship("Problem", back_populates="author")

class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    students = relationship("Student", secondary=student_skills, back_populates="skills")

class Problem(Base):
    __tablename__ = "problems"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(220))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), default="عام")
    status: Mapped[str] = mapped_column(String(40), default="مفتوحة")
    author_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    author = relationship("Student", back_populates="problems")
    required_skills = relationship("ProblemSkill", cascade="all, delete-orphan")
    votes = relationship("ProblemVote", cascade="all, delete-orphan")

class ProblemSkill(Base):
    __tablename__ = "problem_skills"
    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id", ondelete="CASCADE"))
    skill_name: Mapped[str] = mapped_column(String(80))

class ProblemVote(Base):
    __tablename__ = "problem_votes"
    __table_args__ = (UniqueConstraint("problem_id", "student_id", name="uq_problem_student_vote"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    problem_id: Mapped[int] = mapped_column(ForeignKey("problems.id", ondelete="CASCADE"))
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
