"""add_feedback_and_catalogue_metadata

Revision ID: 00c7305de53c
Revises: ff083ab9cd50
Create Date: 2026-11-02 10:41:04.089734

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '00c7305de53c'
down_revision: Union[str, Sequence[str], None] = 'ff083ab9cd50'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create feedbacks table
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "feedbacks" not in tables:
        op.create_table(
            'feedbacks',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('customer_name', sa.String(length=255), nullable=False),
            sa.Column('customer_contact', sa.String(length=100), nullable=True),
            sa.Column('rating', sa.Integer(), nullable=False, server_default='5'),
            sa.Column('category', sa.String(length=100), nullable=False, server_default='Showroom Purchase'),
            sa.Column('comment', sa.Text(), nullable=False),
            sa.Column('bicycle_model', sa.String(length=255), nullable=True),
            sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='0'),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('idx_feedback_approved_featured', 'feedbacks', ['is_approved', 'is_featured'])
        op.create_index('idx_feedback_rating', 'feedbacks', ['rating'])

    # 2. Add columns to catalogue_imports
    if "catalogue_imports" in tables:
        columns = [c['name'] for c in inspector.get_columns("catalogue_imports")]
        with op.batch_alter_table('catalogue_imports') as batch_op:
            if 'title' not in columns:
                batch_op.add_column(sa.Column('title', sa.String(length=255), nullable=True))
            if 'category_tag' not in columns:
                batch_op.add_column(sa.Column('category_tag', sa.String(length=100), nullable=True))
            if 'file_url' not in columns:
                batch_op.add_column(sa.Column('file_url', sa.String(length=500), nullable=True))
            if 'file_size_bytes' not in columns:
                batch_op.add_column(sa.Column('file_size_bytes', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    with op.batch_alter_table('catalogue_imports') as batch_op:
        batch_op.drop_column('file_size_bytes')
        batch_op.drop_column('file_url')
        batch_op.drop_column('category_tag')
        batch_op.drop_column('title')
    op.drop_table('feedbacks')
