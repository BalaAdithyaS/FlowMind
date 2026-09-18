from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FlowMind API",
    description="Self-Learning AI Workflow Orchestrator API",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import ai, workflows, executions, ml, ws
from app.tools.registry import init_registry

# Initialize tools
init_registry()

# Include routers
app.include_router(ai.router)
app.include_router(workflows.router)
app.include_router(executions.router)
app.include_router(ml.router)
app.include_router(ws.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "flowmind"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
