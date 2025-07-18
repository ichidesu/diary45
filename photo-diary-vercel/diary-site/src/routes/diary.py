import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from src.models.diary import DiaryEntry, db
from datetime import datetime

diary_bp = Blueprint('diary', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = 'uploads'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    upload_path = os.path.join(current_app.static_folder, UPLOAD_FOLDER)
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)
    return upload_path

@diary_bp.route('/entries', methods=['GET'])
def get_entries():
    """全ての日記エントリーを取得（新しい順）"""
    try:
        entries = DiaryEntry.query.order_by(DiaryEntry.created_at.desc()).all()
        return jsonify([entry.to_dict() for entry in entries])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@diary_bp.route('/entries', methods=['POST'])
def create_entry():
    """新しい日記エントリーを作成"""
    try:
        title = request.form.get('title')
        content = request.form.get('content')
        author_name = request.form.get('author_name', '匿名')
        
        if not title or not content:
            return jsonify({'error': 'タイトルと内容は必須です'}), 400
        
        image_filename = None
        
        # 画像ファイルの処理
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                upload_path = ensure_upload_folder()
                # ユニークなファイル名を生成
                filename = secure_filename(file.filename)
                name, ext = os.path.splitext(filename)
                unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
                file_path = os.path.join(upload_path, unique_filename)
                file.save(file_path)
                image_filename = unique_filename
        
        # 新しい日記エントリーを作成
        entry = DiaryEntry(
            title=title,
            content=content,
            author_name=author_name,
            image_filename=image_filename
        )
        
        db.session.add(entry)
        db.session.commit()
        
        return jsonify(entry.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@diary_bp.route('/entries/<int:entry_id>', methods=['GET'])
def get_entry(entry_id):
    """特定の日記エントリーを取得"""
    try:
        entry = DiaryEntry.query.get_or_404(entry_id)
        return jsonify(entry.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@diary_bp.route('/entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    """日記エントリーを削除"""
    try:
        entry = DiaryEntry.query.get_or_404(entry_id)
        
        # 関連する画像ファイルも削除
        if entry.image_filename:
            image_path = os.path.join(current_app.static_folder, UPLOAD_FOLDER, entry.image_filename)
            if os.path.exists(image_path):
                os.remove(image_path)
        
        db.session.delete(entry)
        db.session.commit()
        
        return jsonify({'message': '日記エントリーが削除されました'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

