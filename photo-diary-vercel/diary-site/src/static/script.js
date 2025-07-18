// グローバル変数
let entries = [];
let refreshInterval;

// DOM要素
const diaryForm = document.getElementById('diaryForm');
const entriesContainer = document.getElementById('entriesContainer');
const refreshBtn = document.getElementById('refreshBtn');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const fileInputDisplay = document.querySelector('.file-input-display span');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeModal = document.querySelector('.close');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadEntries();
    setupEventListeners();
    startAutoRefresh();
});

// イベントリスナーの設定
function setupEventListeners() {
    // フォーム送信
    diaryForm.addEventListener('submit', handleFormSubmit);
    
    // 更新ボタン
    refreshBtn.addEventListener('click', handleRefresh);
    
    // 画像選択
    imageInput.addEventListener('change', handleImageSelect);
    
    // モーダル関連
    closeModal.addEventListener('click', closeImageModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
}

// フォーム送信処理
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // ボタンを無効化
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 投稿中...';
    
    try {
        const formData = new FormData(diaryForm);
        
        const response = await fetch('/api/entries', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const newEntry = await response.json();
            
            // フォームをリセット
            diaryForm.reset();
            imagePreview.innerHTML = '';
            fileInputDisplay.textContent = '写真を選択してください';
            
            // エントリーリストを更新
            await loadEntries();
            
            // 成功メッセージ
            showNotification('日記が投稿されました！', 'success');
        } else {
            const error = await response.json();
            showNotification(error.error || '投稿に失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('ネットワークエラーが発生しました', 'error');
    } finally {
        // ボタンを有効化
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// 画像選択処理
function handleImageSelect(e) {
    const file = e.target.files[0];
    
    if (file) {
        // ファイル名を表示
        fileInputDisplay.textContent = file.name;
        
        // プレビュー表示
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
        };
        reader.readAsDataURL(file);
    } else {
        fileInputDisplay.textContent = '写真を選択してください';
        imagePreview.innerHTML = '';
    }
}

// エントリー読み込み
async function loadEntries() {
    try {
        const response = await fetch('/api/entries');
        
        if (response.ok) {
            entries = await response.json();
            renderEntries();
        } else {
            showNotification('日記の読み込みに失敗しました', 'error');
        }
    } catch (error) {
        console.error('Error loading entries:', error);
        showNotification('ネットワークエラーが発生しました', 'error');
    }
}

// エントリー表示
function renderEntries() {
    if (entries.length === 0) {
        entriesContainer.innerHTML = `
            <div class="no-entries">
                <i class="fas fa-book-open"></i>
                <p>まだ日記が投稿されていません。<br>最初の日記を投稿してみませんか？</p>
            </div>
        `;
        return;
    }
    
    entriesContainer.innerHTML = entries.map((entry, index) => `
        <div class="entry-card" style="animation-delay: ${index * 0.1}s">
            <div class="entry-header">
                <div>
                    <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
                    <div class="entry-meta">
                        <span><i class="fas fa-user"></i> ${escapeHtml(entry.author_name)}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(entry.created_at)}</span>
                    </div>
                </div>
            </div>
            
            ${entry.image_filename ? `
                <div class="entry-image">
                    <img src="/uploads/${entry.image_filename}" 
                         alt="${escapeHtml(entry.title)}"
                         onclick="openImageModal('/uploads/${entry.image_filename}')">
                </div>
            ` : ''}
            
            <div class="entry-content">
                ${escapeHtml(entry.content).replace(/\n/g, '<br>')}
            </div>
        </div>
    `).join('');
}

// 更新処理
async function handleRefresh() {
    const icon = refreshBtn.querySelector('i');
    icon.classList.add('fa-spin');
    
    await loadEntries();
    
    setTimeout(() => {
        icon.classList.remove('fa-spin');
    }, 500);
}

// 自動更新開始
function startAutoRefresh() {
    // 30秒ごとに自動更新
    refreshInterval = setInterval(loadEntries, 30000);
}

// 自動更新停止
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

// 画像モーダル表示
function openImageModal(imageSrc) {
    modalImage.src = imageSrc;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 画像モーダル閉じる
function closeImageModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 通知表示
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // スタイルを追加
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自動削除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// HTML エスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 1分未満
    if (diff < 60000) {
        return 'たった今';
    }
    
    // 1時間未満
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分前`;
    }
    
    // 24時間未満
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}時間前`;
    }
    
    // それ以外
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('ja-JP', options);
}

// ページ離脱時に自動更新を停止
window.addEventListener('beforeunload', stopAutoRefresh);

// ページがアクティブになったときに自動更新を再開
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        loadEntries(); // すぐに更新
    }
});



// ウォーターマークを削除する関数（最適化版）
function removeWatermarks() {
    try {
        // 特定のセレクタでウォーターマークを削除
        const watermarkSelectors = [
            'a[href*="manus"]',
            'a[href*="Create my website"]',
            '[class*="watermark"]',
            '[id*="watermark"]'
        ];
        
        watermarkSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.parentNode) {
                    element.style.display = 'none';
                    element.style.visibility = 'hidden';
                    element.style.opacity = '0';
                }
            });
        });
        
        // Manusという文字を含むリンクを非表示
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (link.textContent && link.textContent.includes('Manus')) {
                link.style.display = 'none';
            }
        });
    } catch (error) {
        console.log('Watermark removal error:', error);
    }
}

// ページ読み込み完了後にウォーターマークを削除
window.addEventListener('load', function() {
    setTimeout(removeWatermarks, 1000);
    setTimeout(removeWatermarks, 3000);
});

// DOMContentLoaded時にも実行
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(removeWatermarks, 500);
});

