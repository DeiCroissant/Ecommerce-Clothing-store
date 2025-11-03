from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    username: str
    email: str
    password: str  # Hashed password
    name: str
    dateOfBirth: str
    createdAt: datetime = datetime.now()
    role: str = 'user'  # Thêm trường role
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "$2b$10$...",  # Hashed password
                "name": "John Doe",
                "dateOfBirth": "1990-01-01",
                "createdAt": "2024-01-01T00:00:00"
            }
        }

