FROM python:3.12-slim

WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock ./
COPY --link --from=ghcr.io/astral-sh/uv:0.4 /uv /usr/local/bin/uv

RUN uv pip install --system .
RUN uv pip install uvicorn --system

COPY backend/ ./backend

ENV PYTHONPATH=/app

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
