"""Add Upvote.userId foreign key to User

Revision ID: 002
Revises: 001
Create Date: 2026-03-01

"""

from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite cannot add FK via ALTER; create_all on fresh DB includes FK.
    # For PostgreSQL, add constraint if missing.
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'Upvote_userId_fkey'
                ) THEN
                    ALTER TABLE "Upvote"
                    ADD CONSTRAINT "Upvote_userId_fkey"
                    FOREIGN KEY ("userId") REFERENCES "User"("userId");
                END IF;
            END $$;
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute('ALTER TABLE "Upvote" DROP CONSTRAINT IF EXISTS "Upvote_userId_fkey"')
