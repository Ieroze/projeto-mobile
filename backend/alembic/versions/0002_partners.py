"""Add partners and social links."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_partners"
down_revision: Union[str, None] = "0001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    partner_category = postgresql.ENUM(
        "accounting", "veterinary", "photography", name="partner_category", create_type=False
    )
    partner_social_platform = postgresql.ENUM(
        "instagram", "facebook", "whatsapp", "website", name="partner_social_platform", create_type=False
    )
    partner_category.create(op.get_bind(), checkfirst=True)
    partner_social_platform.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "partners",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("category", partner_category, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("published", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_partners_public_listing", "partners", ["published", "position", "name"])
    op.create_table(
        "partner_socials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("partner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("platform", partner_social_platform, nullable=False),
        sa.Column("label", sa.String(length=80), nullable=False),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.ForeignKeyConstraint(["partner_id"], ["partners.id"], ondelete="CASCADE"),
    )
    op.create_index("idx_partner_socials_partner", "partner_socials", ["partner_id", "position"])


def downgrade() -> None:
    op.drop_index("idx_partner_socials_partner", table_name="partner_socials")
    op.drop_table("partner_socials")
    op.drop_index("idx_partners_public_listing", table_name="partners")
    op.drop_table("partners")
    postgresql.ENUM(name="partner_social_platform").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="partner_category").drop(op.get_bind(), checkfirst=True)
