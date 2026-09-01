"""Initial schema and threshold columns."""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text('ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS mediumVoteThreshold INTEGER DEFAULT 3')
    )
    op.execute(
        sa.text('ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS hotVoteThreshold INTEGER DEFAULT 10')
    )
    op.execute(
        sa.text(
            'ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        )
    )


def downgrade() -> None:
    op.execute(sa.text('ALTER TABLE "Room" DROP COLUMN IF EXISTS mediumVoteThreshold'))
    op.execute(sa.text('ALTER TABLE "Room" DROP COLUMN IF EXISTS hotVoteThreshold'))
    op.execute(sa.text('ALTER TABLE "Chat" DROP COLUMN IF EXISTS createdAt'))
