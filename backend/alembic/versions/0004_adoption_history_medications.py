"""Add adoption status history and medication requests."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0004_adoption_history_medications"
down_revision: Union[str, None] = "0003_cat_delete_cascade"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    application_status = postgresql.ENUM(name="application_status", create_type=False)
    op.create_table(
        "adoption_application_status_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("adoption_applications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("previous_status", application_status, nullable=True),
        sa.Column("new_status", application_status, nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.execute("CREATE TYPE medication_urgency AS ENUM ('low', 'medium', 'high')")
    op.execute("CREATE TYPE medication_status AS ENUM ('submitted', 'under_review', 'needs_information', 'approved', 'rejected', 'completed', 'cancelled')")
    urgency = postgresql.ENUM(name="medication_urgency", create_type=False)
    medication_status = postgresql.ENUM(name="medication_status", create_type=False)
    op.create_table(
        "medication_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("protocol", sa.String(40), nullable=False, unique=True),
        sa.Column("person_name", sa.String(160)),
        sa.Column("person_email", sa.String(255)),
        sa.Column("person_phone_whatsapp", sa.String(40)),
        sa.Column("cat_name", sa.String(120)),
        sa.Column("cat_age", sa.String(80)),
        sa.Column("request_reason", sa.String(500)),
        sa.Column("diagnosis", sa.String(500)),
        sa.Column("dosage", sa.String(160)),
        sa.Column("urgency", urgency),
        sa.Column("pickup_availability", sa.String(160)),
        sa.Column("consent_privacy", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", medication_status, nullable=False, server_default=sa.text("'submitted'")),
        sa.Column("internal_notes", sa.Text()),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("idx_medication_requests_status_submitted", "medication_requests", ["status", "submitted_at"])


def downgrade() -> None:
    op.drop_index("idx_medication_requests_status_submitted", table_name="medication_requests")
    op.drop_table("medication_requests")
    op.execute("DROP TYPE medication_status")
    op.execute("DROP TYPE medication_urgency")
    op.drop_table("adoption_application_status_history")
