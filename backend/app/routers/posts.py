from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import current_user
from ..models import Pet, Post, User
from ..schemas import PostDetail, PostIn, PostBrief

router = APIRouter(prefix="/api/posts", tags=["帖子"])


@router.get("")
def list_posts(
    keyword: str | None = None,
    author_id: int | None = None,
    pet_id: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    stmt = select(Post).options(selectinload(Post.author))
    if keyword:
        like = f"%{keyword}%"
        stmt = stmt.where(or_(Post.title.like(like), Post.content.like(like)))
    if author_id:
        stmt = stmt.where(Post.author_id == author_id)
    if pet_id:
        stmt = stmt.where(Post.pet_id == pet_id)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(stmt.order_by(Post.id.desc()).offset((page - 1) * size).limit(size)).all()
    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [PostBrief.model_validate(r) for r in rows],
    }


@router.get("/{post_id}", response_model=PostDetail)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.scalar(select(Post).options(selectinload(Post.author)).where(Post.id == post_id))
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "帖子不存在")
    post.views += 1
    db.commit()
    db.refresh(post)
    return PostDetail.model_validate(post)


@router.post("", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    if payload.pet_id and not db.get(Pet, payload.pet_id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "关联的宠物不存在")
    post = Post(
        title=payload.title,
        content=payload.content,
        images=payload.images,
        cover_image=payload.cover_image or (payload.images[0] if payload.images else ""),
        tags=payload.tags,
        author_id=user.id,
        pet_id=payload.pet_id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return PostDetail.model_validate(post)


@router.put("/{post_id}", response_model=PostDetail)
def update_post(
    post_id: int,
    payload: PostIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "帖子不存在")
    if post.author_id != user.id and not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "只能编辑自己的帖子")
    post.title = payload.title
    post.content = payload.content
    post.images = payload.images
    post.cover_image = payload.cover_image or (payload.images[0] if payload.images else "")
    post.tags = payload.tags
    post.pet_id = payload.pet_id
    db.commit()
    db.refresh(post)
    return PostDetail.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "帖子不存在")
    if post.author_id != user.id and not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "只能删除自己的帖子")
    db.delete(post)
    db.commit()
