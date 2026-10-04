from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import admin_user, current_user, current_user_optional
from ..models import Comment, Favorite, Like, Pet, Post, User
from ..schemas import (
    CommentIn,
    CommentOut,
    FavoriteIn,
    FavoriteOut,
    LikeIn,
    LikeOut,
    PetBrief,
    PostBrief,
)

router = APIRouter(prefix="/api", tags=["互动与管理"])


def _target(target_type: str):
    return Pet if target_type == "pet" else Post


@router.post("/likes/toggle", response_model=LikeOut)
def toggle_like(
    payload: LikeIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    model = Pet if payload.target_type == "pet" else Post
    target = db.get(model, payload.target_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "内容不存在")

    existing = db.scalar(
        select(Like).where(
            Like.user_id == user.id,
            Like.target_type == payload.target_type,
            Like.target_id == payload.target_id,
        )
    )
    if existing:
        db.delete(existing)
        target.likes = max(0, target.likes - 1)
        liked = False
    else:
        db.add(Like(user_id=user.id, target_type=payload.target_type, target_id=payload.target_id))
        target.likes += 1
        liked = True
    db.commit()
    return LikeOut(liked=liked, likes=target.likes)


@router.get("/likes/mine")
def my_likes(
    target_type: str,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    ids = db.scalars(
        select(Like.target_id).where(Like.user_id == user.id, Like.target_type == target_type)
    ).all()
    return {"ids": list(ids)}


@router.post("/favorites/toggle", response_model=FavoriteOut)
def toggle_favorite(
    payload: FavoriteIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    target = db.get(_target(payload.target_type), payload.target_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "内容不存在")

    existing = db.scalar(
        select(Favorite).where(
            Favorite.user_id == user.id,
            Favorite.target_type == payload.target_type,
            Favorite.target_id == payload.target_id,
        )
    )
    if existing:
        db.delete(existing)
        target.favorites_count = max(0, target.favorites_count - 1)
        favorited = False
    else:
        db.add(
            Favorite(
                user_id=user.id,
                target_type=payload.target_type,
                target_id=payload.target_id,
            )
        )
        target.favorites_count += 1
        favorited = True
    db.commit()
    return FavoriteOut(favorited=favorited, favorites_count=target.favorites_count)


@router.get("/favorites/mine")
def my_favorites(
    target_type: str,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    ids = db.scalars(
        select(Favorite.target_id).where(
            Favorite.user_id == user.id, Favorite.target_type == target_type
        )
    ).all()
    return {"ids": list(ids)}


@router.get("/me/favorites")
def my_favorite_items(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    rows = db.scalars(
        select(Favorite).where(Favorite.user_id == user.id).order_by(Favorite.id.desc())
    ).all()
    pet_ids = [r.target_id for r in rows if r.target_type == "pet"]
    post_ids = [r.target_id for r in rows if r.target_type == "post"]
    pets = (
        db.scalars(select(Pet).where(Pet.id.in_(pet_ids))).all() if pet_ids else []
    )
    posts = (
        db.scalars(
            select(Post).options(selectinload(Post.author)).where(Post.id.in_(post_ids))
        ).all()
        if post_ids
        else []
    )
    items = [PetBrief.model_validate(p).model_dump() for p in pets]
    items += [PostBrief.model_validate(p).model_dump() for p in posts]
    return {"items": items}


@router.get("/comments")
def list_comments(
    target_type: str = Query(pattern="^(pet|post)$"),
    target_id: int = Query(ge=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    base = select(Comment).where(
        Comment.target_type == target_type,
        Comment.target_id == target_id,
        Comment.parent_id.is_(None),
    )
    roots = db.scalars(
        base.options(selectinload(Comment.author))
        .order_by(Comment.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()

    root_ids = [c.id for c in roots]
    replies = (
        db.scalars(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(Comment.parent_id.in_(root_ids))
            .order_by(Comment.id.asc())
        ).all()
        if root_ids
        else []
    )
    reply_map: dict[int, list] = defaultdict(list)
    for reply in replies:
        reply_map[reply.parent_id].append(CommentOut.model_validate(reply).model_dump())

    items = []
    for root in roots:
        data = CommentOut.model_validate(root).model_dump()
        data["replies"] = reply_map[root.id]
        items.append(data)

    total_all = (
        db.scalar(
            select(func.count())
            .select_from(Comment)
            .where(Comment.target_type == target_type, Comment.target_id == target_id)
        )
        or 0
    )
    return {"total": total_all, "page": page, "size": size, "items": items}


@router.post("/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    payload: CommentIn,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    target = db.get(_target(payload.target_type), payload.target_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "内容不存在")

    if payload.parent_id:
        parent = db.get(Comment, payload.parent_id)
        if not parent or parent.target_type != payload.target_type or parent.target_id != payload.target_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "回复的评论不存在")
        if parent.parent_id:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "仅支持回复一级评论")

    comment = Comment(
        user_id=user.id,
        target_type=payload.target_type,
        target_id=payload.target_id,
        parent_id=payload.parent_id,
        content=payload.content.strip(),
    )
    db.add(comment)
    target.comments_count += 1
    db.commit()
    db.refresh(comment)
    return CommentOut.model_validate(comment)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "评论不存在")
    if comment.user_id != user.id and not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "只能删除自己的评论")

    removed = 1
    if comment.parent_id is None:
        replies = db.scalars(select(Comment).where(Comment.parent_id == comment.id)).all()
        removed += len(replies)
        for reply in replies:
            db.delete(reply)
    db.delete(comment)

    target = db.get(_target(comment.target_type), comment.target_id)
    if target:
        target.comments_count = max(0, target.comments_count - removed)
    db.commit()


@router.get("/me/posts")
def my_posts(
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    rows = db.scalars(
        select(Post)
        .options(selectinload(Post.author))
        .where(Post.author_id == user.id)
        .order_by(Post.id.desc())
    ).all()
    return {"items": [PostBrief.model_validate(p) for p in rows]}


@router.get("/admin/stats")
def admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user),
):
    return {
        "users": db.scalar(select(func.count()).select_from(User)) or 0,
        "pets": db.scalar(select(func.count()).select_from(Pet)) or 0,
        "posts": db.scalar(select(func.count()).select_from(Post)) or 0,
        "likes": db.scalar(select(func.count()).select_from(Like)) or 0,
    }
