from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  确保模型注册到 Base
from .database import Base, engine
from .routers import auth, interactions, pets, posts


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="宠物星球 PetPlanet API",
    version="1.0.0",
    description="宠物展示与社区应用后端：宠物浏览、帖子发布、点赞与后台管理",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(posts.router)
app.include_router(interactions.router)


@app.get("/api/health", tags=["系统"])
def health():
    return {"status": "ok"}
