import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import DATABASE_URL

logger = logging.getLogger(__name__)

_is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if _is_sqlite else {}

engine_kwargs: dict = {"connect_args": connect_args}
if not _is_sqlite:
    engine_kwargs.update(pool_pre_ping=True, pool_recycle=300)

engine = create_engine(DATABASE_URL, **engine_kwargs)

if DATABASE_URL.startswith("sqlite"):
    from sqlalchemy import event

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def bootstrap_database() -> None:
    Base.metadata.create_all(bind=engine)
    _apply_schema_patches()


def _apply_schema_patches() -> None:
    """Add columns/tables that create_all won't alter on existing databases."""
    patches = [
        'ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS mediumVoteThreshold INTEGER DEFAULT 3',
        'ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS hotVoteThreshold INTEGER DEFAULT 10',
        'ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    ]
    with engine.connect() as conn:
        for patch in patches:
            try:
                conn.execute(text(patch))
                conn.commit()
            except Exception as error:
                logger.debug("Schema patch skipped or failed: %s — %s", patch, error)
