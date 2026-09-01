import os
import sys

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
PORT = int(os.getenv("PORT", "8080"))
SESSION_TOKEN_TTL_HOURS = int(os.getenv("SESSION_TOKEN_TTL_HOURS", "24"))
MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", "500"))
CHAT_HISTORY_PAGE_SIZE = int(os.getenv("CHAT_HISTORY_PAGE_SIZE", "50"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
WS_RATE_LIMIT_PER_MINUTE = int(os.getenv("WS_RATE_LIMIT_PER_MINUTE", "60"))
DEFAULT_MEDIUM_VOTE_THRESHOLD = int(os.getenv("DEFAULT_MEDIUM_VOTE_THRESHOLD", "3"))
DEFAULT_HOT_VOTE_THRESHOLD = int(os.getenv("DEFAULT_HOT_VOTE_THRESHOLD", "10"))
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,https://chatboard-upvotes.vercel.app",
    ).split(",")
    if origin.strip()
]

if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable is required.", file=sys.stderr)
