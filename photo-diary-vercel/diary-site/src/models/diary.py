from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class DiaryEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_filename = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    author_name = db.Column(db.String(100), nullable=False, default='匿名')

    def __repr__(self):
        return f'<DiaryEntry {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'image_filename': self.image_filename,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'author_name': self.author_name
        }

