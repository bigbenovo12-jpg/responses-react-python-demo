import os
from pathlib import Path

from dotenv import load_dotenv

SERVER_DIR = Path(__file__).resolve().parents[2]
load_dotenv(SERVER_DIR / ".env")

API_KEY = os.environ.get("OPENAI_API_KEY")
BASE_URL = os.environ.get(
    "OPENAI_BASE_URL",
    "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
)
MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.4")
REQUEST_TIMEOUT_SECONDS = float(os.environ.get("MODEL_REQUEST_TIMEOUT_SECONDS", "600"))
CONNECT_TIMEOUT_SECONDS = float(os.environ.get("MODEL_CONNECT_TIMEOUT_SECONDS", "30"))
