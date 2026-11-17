"""Allow deleting cats and their adoption applications."""

from typing import Sequence, Union

from alembic import op

revision: str = "0003_cat_delete_cascade"
down_revision: Union[str, None] = "0002_partners"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "adoption_applications_cat_id_fkey",
        "adoption_applications",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "adoption_applications_cat_id_fkey",
        "adoption_applications",
        "cats",
        ["cat_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        "adoption_applications_cat_id_fkey",
        "adoption_applications",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "adoption_applications_cat_id_fkey",
        "adoption_applications",
        "cats",
        ["cat_id"],
        ["id"],
        ondelete="RESTRICT",
    )
