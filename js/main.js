document.addEventListener('DOMContentLoaded', async () => {
    // Инициализация глобальных переменных
    let currentPage = 1;
    let currentFilter = 'all';
    let currentView = 'grid';
    let currentSearchQuery = '';
    
    // DOM элементы
    const animeContainer = document.getElementById('anime-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchToggle = document.getElementById('searchToggle');
    const searchBox = document.getElementById('searchBox');
    const newAnimeSlider = document.getElementById('newAnimeSlider');
    const paginationContainer = document.getElementById('pagination');
    
    // Инициализация
    initEventListeners();
    await loadNewAnime();
    await loadAnime();
    
    // ===== ФУНКЦИИ ИНИЦИАЛИЗАЦИИ =====
    function initEventListeners() {
        // Поиск
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        
        // Переключение поиска
        searchToggle.addEventListener('click', () => {
            searchBox.classList.toggle('active');
            if (searchBox.classList.contains('active')) {
                setTimeout(() => searchInput.focus(), 300);
            }
        });
        
        // Фильтры
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => 
                    b.classList.remove('active')
                );
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                currentPage = 1;
                loadAnime();
            });
        });
        
        // Переключение вида
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => 
                    b.classList.remove('active')
                );
                btn.classList.add('active');
                currentView = btn.dataset.view;
                animeContainer.className = `anime-container ${currentView}-view`;
                loadAnime();
            });
        });
        
        // Закрытие поиска при клике вне области
        document.addEventListener('click', (e) => {
            if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
                searchBox.classList.remove('active');
            }
        });
    }
    
    // ===== ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ =====
    async function loadNewAnime() {
        try {
            const animeList = await animeAPI.getAnimeList();
            const newAnime = animeAPI.filterAnime(animeList, 'new').slice(0, 10);
            
            if (newAnime.length === 0) {
                newAnimeSlider.innerHTML = '<p class="no-data">Новых аниме пока нет</p>';
                return;
            }
            
            newAnimeSlider.innerHTML = newAnime.map(anime => `
                <div class="new-anime-card">
                    ${anime.is_new ? '<span class="new-badge">NEW</span>' : ''}
                    <div class="anime-poster">
                        <img src="${anime.poster}" alt="${anime.title}" 
                             onerror="this.src='https://via.placeholder.com/300x400/2f3640/ffffff?text=No+Image'">
                    </div>
                    <div class="anime-info">
                        <h3 class="anime-title">${anime.title}</h3>
                        <div class="anime-meta">
                            <span>${anime.year}</span>
                            <span>${anime.episodes}</span>
                        </div>
                        <a href="pages/watch.html?id=${anime.id}" class="watch-btn">
                            <i class="fas fa-play"></i> Смотреть
                        </a>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Ошибка загрузки новых аниме:', error);
            newAnimeSlider.innerHTML = '<p class="error">Ошибка загрузки</p>';
        }
    }
    
    async function loadAnime() {
        animeContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загружаем аниме...</p>
            </div>
        `;
        
        try {
            let animeList = await animeAPI.getAnimeList();
            
            // Применяем поиск, если есть запрос
            if (currentSearchQuery) {
                animeList = await animeAPI.searchAnime(currentSearchQuery);
            }
            
            // Применяем фильтр
            animeList = animeAPI.filterAnime(animeList, currentFilter);
            
            // Пагинация
            const paginated = animeAPI.paginateAnime(animeList, currentPage);
            
            if (paginated.items.length === 0) {
                animeContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search fa-3x"></i>
                        <h3>Аниме не найдено</h3>
                        <p>Попробуйте изменить параметры поиска или фильтрации</p>
                    </div>
                `;
                paginationContainer.innerHTML = '';
                return;
            }
            
            displayAnime(paginated.items);
            displayPagination(paginated);
        } catch (error) {
            console.error('Ошибка загрузки аниме:', error);
            animeContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Попробуйте обновить страницу</p>
                </div>
            `;
        }
    }
    
    // ===== ФУНКЦИИ ОТОБРАЖЕНИЯ =====
    function displayAnime(animeArray) {
        animeContainer.innerHTML = '';
        
        animeArray.forEach(anime => {
            const animeCard = document.createElement('div');
            animeCard.className = 'anime-card';
            
            animeCard.innerHTML = `
                ${anime.status === 'ongoing' ? '<span class="anime-status">Онгоинг</span>' : ''}
                ${anime.is_new ? '<span class="anime-status" style="background: var(--success);">NEW</span>' : ''}
                
                <div class="anime-poster">
                    <img src="${anime.poster}" alt="${anime.title}" 
                         onerror="this.src='https://via.placeholder.com/280x380/2f3640/ffffff?text=No+Image'">
                </div>
                
                <div class="anime-info">
                    <h3 class="anime-title">${anime.title}</h3>
                    
                    <div class="anime-meta">
                        <span><i class="fas fa-calendar"></i> ${anime.year}</span>
                        <span><i class="fas fa-play-circle"></i> ${anime.episodes}</span>
                    </div>
                    
                    <div class="anime-genres">
                        ${(anime.genre || []).slice(0, 2).map(genre => 
                            `<span class="genre-tag">${genre}</span>`
                        ).join('')}
                    </div>
                    
                    <p class="anime-description">${anime.description}</p>
                    
                    <div class="anime-footer">
                        <a href="pages/watch.html?id=${anime.id}" class="watch-btn">
                            <i class="fas fa-play"></i> Смотреть
                            <span class="voice-badge">${anime.voice || 'Re:Voice'}</span>
                        </a>
                    </div>
                </div>
            `;
            
            animeContainer.appendChild(animeCard);
        });
    }
    
    function displayPagination(paginated) {
        if (paginated.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(paginated.totalPages, startPage + maxPages - 1);
        
        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        // Кнопка "Назад"
        if (currentPage > 1) {
            paginationHTML += `
                <button class="page-btn" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }
        
        // Первая страница
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
        }
        
        // Основные страницы
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // Последняя страница
        if (endPage < paginated.totalPages) {
            if (endPage < paginated.totalPages - 1) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
            paginationHTML += `
                <button class="page-btn" data-page="${paginated.totalPages}">
                    ${paginated.totalPages}
                </button>
            `;
        }
        
        // Кнопка "Вперёд"
        if (currentPage < paginated.totalPages) {
            paginationHTML += `
                <button class="page-btn" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        paginationContainer.innerHTML = paginationHTML;
        
        // Обработчики для кнопок пагинации
        paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                loadAnime();
                window.scrollTo({ top: animeContainer.offsetTop - 100, behavior: 'smooth' });
            });
        });
    }
    
    // ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
    async function handleSearch() {
        currentSearchQuery = searchInput.value.trim();
        currentPage = 1;
        await loadAnime();
        
        // Показываем уведомление о количестве результатов
        if (currentSearchQuery) {
            showNotification(`Найдено аниме по запросу: "${currentSearchQuery}"`);
        }
    }
    
    function showNotification(message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--dark-light);
            border-left: 4px solid var(--primary);
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            box-shadow: var(--shadow);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Закрытие по кнопке
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    // Добавляем CSS анимации для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: transparent;
            border: none;
            color: var(--gray);
            cursor: pointer;
            padding: 5px;
        }
        
        .notification-close:hover {
            color: var(--primary);
        }
        
        .no-results, .error-message {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            color: var(--gray);
        }
        
        .no-results i, .error-message i {
            margin-bottom: 20px;
            color: var(--primary);
        }
        
        .no-results h3, .error-message h3 {
            color: white;
            margin-bottom: 10px;
        }
        
        .voice-badge {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            margin-left: 8px;
        }
    `;
    document.head.appendChild(style);
});
