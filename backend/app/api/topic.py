from fastapi import APIRouter
import random

router = APIRouter()

TOPICS = [
    "Describe a challenge you faced at work",
    "What makes a good team?",
    "Should AI be regulated?",
    "Describe your leadership style",
]

@router.get("/topic/impromptu")
def impromptu_topic():
    return {"topic": random.choice(TOPICS)}
