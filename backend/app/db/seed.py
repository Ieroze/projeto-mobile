"""Idempotent demo data seeder. Run after ``alembic upgrade head``."""

from uuid import UUID, uuid5

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.entities import Cat, Partner, PartnerSocial
from app.models.enums import AdoptionStatus, CareStatus, PartnerCategory, PartnerSocialPlatform

SEED_NAMESPACE = UUID("88b29a58-21fb-44c8-96de-b7c0b48dc46c")


def stable_id(key: str) -> UUID:
    return uuid5(SEED_NAMESPACE, key)


def seed_cats(db: Session) -> int:
    samples = [
        {
            "key": "cat-demo-luna",
            "name": "Luna (demonstração)",
            "sex": "female",
            "approximate_age_months": 24,
            "short_description": "Perfil de exemplo para validar o CRUD.",
            "description": "Registro fictício criado pelo seeder de desenvolvimento.",
            "adoption_status": AdoptionStatus.AVAILABLE,
            "care_status": CareStatus.HEALTHY,
            "castrated": True,
            "vaccinated": True,
            "fiv_felv_negative": None,
            "traits": ["Exemplo", "Demonstração"],
            "published": False,
        },
        {
            "key": "cat-demo-thor",
            "name": "Thor (demonstração)",
            "sex": "male",
            "approximate_age_months": 12,
            "short_description": "Perfil de exemplo não publicado.",
            "description": "Registro fictício criado pelo seeder de desenvolvimento.",
            "adoption_status": AdoptionStatus.NOT_AVAILABLE,
            "care_status": CareStatus.TREATMENT,
            "castrated": False,
            "vaccinated": False,
            "fiv_felv_negative": None,
            "traits": ["Exemplo"],
            "published": False,
        },
    ]

    for sample in samples:
        cat_id = stable_id(sample.pop("key"))
        cat = db.get(Cat, cat_id)
        if cat is None:
            cat = Cat(id=cat_id, **sample)
            db.add(cat)
        else:
            for field, value in sample.items():
                setattr(cat, field, value)
    return len(samples)


def seed_partners(db: Session) -> int:
    samples = [
        {
            "key": "partner-demo-veterinary",
            "name": "Parceiro veterinário (demonstração)",
            "category": PartnerCategory.VETERINARY,
            "description": "Registro fictício para validar o CRUD administrativo.",
            "position": 0,
            "published": False,
            "socials": [(PartnerSocialPlatform.WEBSITE, "Site de demonstração")],
        },
        {
            "key": "partner-demo-photography",
            "name": "Parceiro de fotografia (demonstração)",
            "category": PartnerCategory.PHOTOGRAPHY,
            "description": "Registro fictício para validar os links sociais.",
            "position": 1,
            "published": False,
            "socials": [(PartnerSocialPlatform.INSTAGRAM, "Instagram de demonstração")],
        },
    ]

    for sample in samples:
        key = sample.pop("key")
        social_samples = sample.pop("socials")
        partner_id = stable_id(key)
        partner = db.get(Partner, partner_id)
        if partner is None:
            partner = Partner(id=partner_id, **sample)
            db.add(partner)
        else:
            for field, value in sample.items():
                setattr(partner, field, value)

        seeded_socials = []
        for position, (platform, label) in enumerate(social_samples):
            social_id = stable_id(f"{key}:social:{position}")
            social = db.get(PartnerSocial, social_id)
            if social is None:
                social = PartnerSocial(id=social_id, partner_id=partner_id)
                db.add(social)
            social.platform = platform
            social.label = label
            social.url = None
            social.position = position
            seeded_socials.append(social)
        partner.socials = seeded_socials
    return len(samples)


def seed_demo_data(db: Session) -> tuple[int, int]:
    return seed_cats(db), seed_partners(db)


def main() -> None:
    with SessionLocal.begin() as db:
        cat_count, partner_count = seed_demo_data(db)
    print(f"Seed concluído: {cat_count} gatos e {partner_count} parceiros fictícios.")


if __name__ == "__main__":
    main()
