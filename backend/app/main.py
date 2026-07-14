from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi

from app.api.router import router

app = FastAPI(
    title="ApplyPilot AI API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


def custom_openapi():

    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation.setdefault("security", []).append(
                {
                    "BearerAuth": []
                }
            )

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi


@app.get("/")
def root():
    return {
        "message": "Welcome to ApplyPilot AI Backend 🚀"
    }