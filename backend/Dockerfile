FROM python:3.13-slim

# Set environment variables
# 1. Force stdout/stderr to be unbuffered
# 2. Don't write .pyc files
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

# copy uv from ghcr.io/astral-sh/uv:latest
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set the working directory
WORKDIR /app

# Copy only the files needed for dependency installation to cache this layer
COPY pyproject.toml .
COPY uv.lock .

# install dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Default command to run the application
# Note: In production, you might want to use a WSGI server like gunicorn
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
