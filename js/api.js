// Конфигурация API
const API_CONFIG = {
    animeListUrl: 'https://raw.githubusercontent.com/username/anime-list-revoice/main/anime.json',
    itemsPerPage: 12,
    defaultFilter: 'all'
};

// Кэш для хранения данных
let animeCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Функция для получения списка аниме с кэшированием
async function getAnimeList() {
    const now = Date.now();
    
    // Возвращаем данные из кэша, если они свежие
    if (animeCache && (now - lastFetchTime) < CACHE_DURATION) {
        return animeCache;
    }
    
    try {
        const response = await fetch(`${API_CONFIG.animeListUrl}?t=${now}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Проверяем структуру данных
        if (!data || !Array.isArray(data.anime)) {
            throw new Error('Некорректный формат данных');
        }
        
        // Кэшируем данные
        animeCache = data.anime;
        lastFetchTime = now;
        
        return animeCache;
    } catch (error) {
        console.error('Ошибка загрузки списка аниме:', error);
        
        // Возвращаем кэшированные данные, если есть
        if (animeCache) {
            console.log('Используем кэшированные данные');
            return animeCache;
        }
        
        // Возвращаем тестовые данные при ошибке
        return getFallbackData();
    }
}

// Тестовые данные для fallback
function getFallbackData() {
    return [
        {
            id: 'attack-on-titan',
            title: 'Атака Титанов',
            description: 'Человечество выживает в городах-крепостях, защищаясь от гигантских существ - титанов.',
            year: '2013',
            episodes: '75+',
            status: 'completed',
            type: 'series',
            genre: ['Экшен', 'Драма', 'Фэнтези'],
            poster: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            voice: 'Re:Voice',
            watch_page: 'attack-on-titan.html',
            is_new: false
        },
        {
            id: 'demon-slayer',
            title: 'Истребитель демонов',
            description: 'Тандзиро Камадо становится истребителем демонов, чтобы вернуть человеческий облик своей сестре.',
            year: '2019',
            episodes: '55+',
            status: 'ongoing',
            type: 'series',
            genre: ['Экшен', 'Фэнтези', 'Приключения'],
            poster: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            voice: 'Re:Voice',
            watch_page: 'demon-slayer.html',
            is_new: true
        }
    ];
}

// Функция для поиска аниме
async function searchAnime(query) {
    try {
        const animeList = await getAnimeList();
        
        if (!query || query.trim() === '') {
            return animeList;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return animeList.filter(anime => 
            anime.title.toLowerCase().includes(searchTerm) ||
            anime.description.toLowerCase().includes(searchTerm) ||
            (Array.isArray(anime.genre) && anime.genre.some(g => 
                g.toLowerCase().includes(searchTerm)
            ))
        );
    } catch (error) {
        console.error('Ошибка поиска:', error);
        return [];
    }
}

// Функция для фильтрации аниме
function filterAnime(animeList, filter) {
    if (!Array.isArray(animeList)) {
        return [];
    }
    
    switch(filter) {
        case 'ongoing':
            return animeList.filter(anime => anime.status === 'ongoing');
        case 'completed':
            return animeList.filter(anime => anime.status === 'completed');
        case 'movie':
            return animeList.filter(anime => anime.type === 'movie');
        case 'dub':
            return animeList.filter(anime => anime.voice === 'Re:Voice');
        case 'new':
            return animeList.filter(anime => anime.is_new);
        default:
            return animeList;
    }
}

// Функция для пагинации
function paginateAnime(animeList, page = 1, itemsPerPage = API_CONFIG.itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
        items: animeList.slice(startIndex, endIndex),
        totalPages: Math.ceil(animeList.length / itemsPerPage),
        currentPage: page,
        totalItems: animeList.length
    };
}

// Экспорт функций
window.animeAPI = {
    getAnimeList,
    searchAnime,
    filterAnime,
    paginateAnime,
    API_CONFIG
};
