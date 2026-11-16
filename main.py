from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import select, func
import os
from sqlalchemy.exc import IntegrityError
from .database import Base, engine, get_db
from . import models, schemas
from .security import hash_password, verify_password, create_access_token, decode_access_token

Base.metadata.create_all(bind=engine)
app = FastAPI(title="MIDAD API", version="1.0.0", description="University Innovation Platform API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if x.strip()],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
bearer = HTTPBearer(auto_error=False)

def current_student(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db)
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    student_id = decode_access_token(credentials.credentials)
    student = db.get(models.Student, student_id) if student_id else None
    if not student:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return student

@app.get("/")
def root():
    return {"name": "MIDAD API", "status": "running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/auth/register", response_model=schemas.TokenOut, status_code=201)
def register(data: schemas.RegisterIn, db: Session = Depends(get_db)):
    if db.scalar(select(models.Student).where(models.Student.email == data.email)):
        raise HTTPException(status_code=409, detail="Email already registered")
    student = models.Student(
        name=data.name, email=data.email, password_hash=hash_password(data.password),
        university=data.university, major=data.major
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return {"access_token": create_access_token(student.id), "student": student}

@app.post("/auth/login", response_model=schemas.TokenOut)
def login(data: schemas.LoginIn, db: Session = Depends(get_db)):
    student = db.scalar(select(models.Student).where(models.Student.email == data.email))
    if not student or not verify_password(data.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(student.id), "student": student}

@app.get("/auth/me", response_model=schemas.StudentOut)
def me(student=Depends(current_student)):
    return student

@app.put("/students/me/skills")
def update_skills(data: schemas.SkillsUpdate, student=Depends(current_student), db: Session = Depends(get_db)):
    cleaned = list(dict.fromkeys(s.strip() for s in data.skills if s.strip()))
    skills = []
    for name in cleaned:
        skill = db.scalar(select(models.Skill).where(models.Skill.name == name))
        if not skill:
            skill = models.Skill(name=name)
            db.add(skill)
            db.flush()
        skills.append(skill)
    student.skills = skills
    db.commit()
    return {"skills": [s.name for s in student.skills]}

@app.get("/students/me/skills")
def get_skills(student=Depends(current_student)):
    return {"skills": [s.name for s in student.skills]}

@app.post("/problems", response_model=schemas.ProblemOut, status_code=201)
def create_problem(data: schemas.ProblemCreate, student=Depends(current_student), db: Session = Depends(get_db)):
    problem = models.Problem(title=data.title, description=data.description, category=data.category, author=student)
    problem.required_skills = [models.ProblemSkill(skill_name=s.strip()) for s in data.required_skills if s.strip()]
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return serialize_problem(problem)

@app.get("/problems", response_model=list[schemas.ProblemOut])
def list_problems(q: str = "", db: Session = Depends(get_db)):
    stmt = select(models.Problem).order_by(models.Problem.created_at.desc())
    rows = db.scalars(stmt).all()
    if q:
        needle = q.casefold()
        rows = [p for p in rows if needle in p.title.casefold() or needle in p.description.casefold() or needle in p.category.casefold()]
    return [serialize_problem(p) for p in rows]

@app.post("/problems/{problem_id}/vote")
def vote_problem(problem_id: int, student=Depends(current_student), db: Session = Depends(get_db)):
    problem = db.get(models.Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    vote = models.ProblemVote(problem_id=problem_id, student_id=student.id)
    db.add(vote)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already voted")
    count = db.scalar(select(func.count(models.ProblemVote.id)).where(models.ProblemVote.problem_id == problem_id))
    return {"message": "Vote recorded", "votes_count": count}

@app.get("/problems/{problem_id}/matches", response_model=list[schemas.MatchOut])
def match_students(problem_id: int, student=Depends(current_student), db: Session = Depends(get_db)):
    problem = db.get(models.Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    required = {x.skill_name.casefold() for x in problem.required_skills}
    candidates = db.scalars(select(models.Student).where(models.Student.id != student.id)).all()
    results = []
    for candidate in candidates:
        owned = {x.name for x in candidate.skills}
        matched = [x for x in owned if x.casefold() in required] if required else []
        score = round((len(matched) / len(required)) * 100) if required else 0
        if matched:
            results.append({
                "student_id": candidate.id, "name": candidate.name, "major": candidate.major,
                "university": candidate.university, "matched_skills": matched, "match_score": score
            })
    return sorted(results, key=lambda x: x["match_score"], reverse=True)

def serialize_problem(problem):
    return {
        "id": problem.id, "title": problem.title, "description": problem.description,
        "category": problem.category, "status": problem.status,
        "author_name": problem.author.name,
        "votes_count": len(problem.votes),
        "required_skills": [s.skill_name for s in problem.required_skills]
    }
