from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import admin_user, current_user_optional
from ..models import Pet, PetImage, User
from ..schemas import PetDetail, PetIn, PetBrief

router = APIRouter(prefix="/api/pets", tags=["宠物"])


def _sync_images(db: Session, pet: Pet, images: list[str]):
    db.execute(delete(PetImage).where(PetImage.pet_id == pet.id))
    urls = [u for u in images if u]
    if pet.cover_image and pet.cover_image not in urls:
        urls = [pet.cover_image, *urls]
    for index, url in enumerate(urls):
        db.add(PetImage(pet_id=pet.id, url=url, sort_order=index))


@router.get("")
def list_pets(
    keyword: str | None = None,
    species: str | None = None,
    city: str | None = None,
    sort: str = Query("latest", pattern="^(latest|hot)$"),
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    stmt = select(Pet)
    if keyword:
        like = f"%{keyword}%"
        stmt = stmt.where(or_(Pet.name.like(like), Pet.breed.like(like), Pet.description.like(like)))
    if species:
        stmt = stmt.where(Pet.species == species)
    if city:
        stmt = stmt.where(Pet.city == city)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    order = Pet.likes.desc() if sort == "hot" else Pet.id.desc()
    rows = db.scalars(
        stmt.order_by(order, Pet.id.desc()).offset((page - 1) * size).limit(size)
    ).all()
    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [PetBrief.model_validate(r) for r in rows],
    }


@router.get("/filters")
def filters(db: Session = Depends(get_db)):
    species = db.scalars(select(Pet.species).distinct()).all()
    cities = db.scalars(select(Pet.city).distinct()).all()
    return {
        "species": [s for s in species if s],
        "cities": [c for c in cities if c],
    }


@router.get("/{pet_id}", response_model=PetDetail)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.scalar(
        select(Pet).options(selectinload(Pet.images), selectinload(Pet.owner)).where(Pet.id == pet_id)
    )
    if not pet:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "宠物不存在")
    pet.views += 1
    db.commit()
    db.refresh(pet)
    return PetDetail.model_validate(pet)


def _apply(pet: Pet, payload: PetIn):
    pet.name = payload.name
    pet.species = payload.species
    pet.breed = payload.breed
    pet.gender = payload.gender
    pet.age = payload.age
    pet.city = payload.city
    pet.description = payload.description
    pet.cover_image = payload.cover_image or (payload.images[0] if payload.images else "")
    pet.tags = payload.tags


@router.post("", response_model=PetDetail, status_code=status.HTTP_201_CREATED)
def create_pet(
    payload: PetIn,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user),
):
    pet = Pet(owner_id=admin.id)
    _apply(pet, payload)
    db.add(pet)
    db.flush()
    _sync_images(db, pet, payload.images)
    db.commit()
    db.refresh(pet)
    return PetDetail.model_validate(pet)


@router.put("/{pet_id}", response_model=PetDetail)
def update_pet(
    pet_id: int,
    payload: PetIn,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user),
):
    pet = db.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "宠物不存在")
    _apply(pet, payload)
    _sync_images(db, pet, payload.images)
    db.commit()
    db.refresh(pet)
    return PetDetail.model_validate(pet)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet(
    pet_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user),
):
    pet = db.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "宠物不存在")
    db.delete(pet)
    db.commit()
