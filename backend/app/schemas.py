from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    nickname: str
    avatar: str
    is_admin: bool


class UserOut(UserBrief):
    bio: str = ""


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=6, max_length=64)
    nickname: str = Field(default="", max_length=32)


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    token: str
    user: UserOut


class PetImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    sort_order: int


class PetBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    species: str
    breed: str
    gender: str
    age: str
    city: str
    cover_image: str
    tags: list = []
    likes: int
    favorites_count: int = 0
    comments_count: int = 0
    kind: str = "pet"
    created_at: datetime


class PetDetail(PetBrief):
    description: str = ""
    views: int = 0
    owner: UserBrief | None = None
    images: list[PetImageOut] = []


class PetIn(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    species: str = "猫"
    breed: str = ""
    gender: str = "未知"
    age: str = ""
    city: str = ""
    description: str = ""
    cover_image: str = ""
    tags: list[str] = []
    images: list[str] = []


class PostBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    cover_image: str
    tags: list = []
    likes: int
    favorites_count: int = 0
    comments_count: int = 0
    views: int
    pet_id: int | None = None
    author: UserBrief | None = None
    created_at: datetime
    kind: str = "post"


class PostDetail(PostBrief):
    images: list[str] = []


class PostIn(BaseModel):
    title: str = Field(min_length=1, max_length=128)
    content: str = ""
    cover_image: str = ""
    images: list[str] = []
    tags: list[str] = []
    pet_id: int | None = None


class PageOut(BaseModel):
    total: int
    page: int
    size: int
    items: list


class LikeIn(BaseModel):
    target_type: str = Field(pattern="^(pet|post)$")
    target_id: int


class LikeOut(BaseModel):
    liked: bool
    likes: int


class FavoriteIn(BaseModel):
    target_type: str = Field(pattern="^(pet|post)$")
    target_id: int


class FavoriteOut(BaseModel):
    favorited: bool
    favorites_count: int


class CommentIn(BaseModel):
    target_type: str = Field(pattern="^(pet|post)$")
    target_id: int
    content: str = Field(min_length=1, max_length=500)
    parent_id: int | None = None


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    target_type: str
    target_id: int
    parent_id: int | None = None
    content: str
    likes: int = 0
    created_at: datetime
    author: UserBrief | None = None
