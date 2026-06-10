import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from apps.server.api import inventory, costs, policies, recommendations, auth, alerts, gateway, contracts, discovery, connectors, vendors, subscriptions
from apps.server.core.auth import get_current_user

app = FastAPI(title="AetherOps API", version="2.0.0")

# Enable CORS for frontend
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public endpoints
app.include_router(auth.router, prefix="/api/v1")

# Protected endpoints
app.include_router(inventory.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(costs.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(policies.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(recommendations.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(alerts.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(gateway.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])

# V2 New Endpoints
app.include_router(contracts.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(discovery.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(connectors.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(vendors.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])
app.include_router(subscriptions.router, prefix="/api/v1", dependencies=[Depends(get_current_user)])

@app.get("/")
def read_root():
    return {"message": "Welcome to AetherOps API v2", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
