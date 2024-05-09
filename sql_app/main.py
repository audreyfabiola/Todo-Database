from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine
from typing import List

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create User
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

# Read all users
@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

# Read user
@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Read all todos
@app.get("/todos/", response_model=List[schemas.Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db, skip=skip, limit=limit)
    return todos

# Create todo for user
@app.post("/users/{user_id}/todos/", response_model=schemas.Todo)
def create_todo_for_user(user_id: int, todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo_for_user(db=db, user_id=user_id, todo=todo)

# Get todos for user
@app.get("/users/{user_id}/todos/", response_model=List[schemas.Todo])
def get_todos_for_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_todos_for_user(db=db, user_id=user_id)

# Get todo for user
@app.get("/users/{user_id}/todos/{todo_id}", response_model=schemas.Todo)
def get_todo_for_user(user_id: int, todo_id: int, db: Session = Depends(get_db)):
    return crud.get_todo_for_user(db=db, user_id=user_id, todo_id=todo_id)

# Update todo for user
@app.put("/users/{user_id}/todos/{todo_id}", response_model=schemas.Todo)
def update_todo_for_user(user_id: int, todo_id: int, todo: schemas.TodoBase, db: Session = Depends(get_db)):
    return crud.update_todo_for_user(db=db, user_id=user_id, todo_id=todo_id, todo=todo)

# Delete todo for user
@app.delete("/users/{user_id}/todos/{todo_id}")
def delete_todo_for_user(user_id: int, todo_id: int, db: Session = Depends(get_db)):
    return crud.delete_todo_for_user(db=db, user_id=user_id, todo_id=todo_id)
