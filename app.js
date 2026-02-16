// Хранилище данных
let currentDiet = { meals: [] };
let tgUser = null;

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  
  // Получаем данные пользователя
  tgUser = tg.initDataUnsafe?.user;
  
  if (tgUser) {
    // Устанавливаем имя пользователя
    const firstName = tgUser.first_name || '';
    const lastName = tgUser.last_name || '';
    const username = tgUser.username || '';
    
    document.getElementById('profileName').textContent = `${firstName} ${lastName}`.trim() || 'Пользователь';
    document.getElementById('profileUsername').textContent = username ? `@${username}` : '';
    
    // Устанавливаем фото профиля если есть
    if (tgUser.photo_url) {
      document.getElementById('profileAvatar').src = tgUser.photo_url;
      document.getElementById('userAvatar').src = tgUser.photo_url;
    }
  }
}

// Загрузка при старте
window.addEventListener('DOMContentLoaded', () => {
  loadDiet();
  loadTheme();
  displayDiet();
});

// Переключение секций
function showSection(section) {
  // Убираем active у всех страниц и nav-item
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Активируем нужную страницу
  if (section === 'home') {
    document.getElementById('homePage').classList.add('active');
    document.querySelectorAll('.nav-item')[0].classList.add('active');
    displayDiet();
  } else if (section === 'create') {
    document.getElementById('createPage').classList.add('active');
    document.querySelectorAll('.nav-item')[1].classList.add('active');
  } else if (section === 'import') {
    document.getElementById('importPage').classList.add('active');
    document.querySelectorAll('.nav-item')[2].classList.add('active');
  } else if (section === 'profile') {
    document.getElementById('profilePage').classList.add('active');
    document.querySelectorAll('.nav-item')[3].classList.add('active');
  }
}

// Добавить прием пищи
function addMeal() {
  const mealBuilder = document.getElementById('mealBuilder');
  const mealIndex = mealBuilder.children.length;
  
  const mealDiv = document.createElement('div');
  mealDiv.className = 'builder-meal';
  mealDiv.dataset.index = mealIndex;
  
  mealDiv.innerHTML = `
    <div class="builder-meal-header">
      <input type="text" placeholder="Название (Завтрак)" class="meal-name" />
      <input type="time" value="08:00" class="meal-time" />
      <button onclick="removeMeal(${mealIndex})" class="btn-remove">✕</button>
    </div>
    <div class="dishes-builder" data-meal="${mealIndex}"></div>
    <button onclick="addDish(${mealIndex})" class="btn-add-dish">+ Добавить блюдо</button>
  `;
  
  mealBuilder.appendChild(mealDiv);
}

// Удалить прием пищи
function removeMeal(index) {
  const meal = document.querySelector(`.builder-meal[data-index="${index}"]`);
  if (meal) meal.remove();
}

// Добавить блюдо
function addDish(mealIndex) {
  const dishesBuilder = document.querySelector(`.dishes-builder[data-meal="${mealIndex}"]`);
  const dishIndex = dishesBuilder.children.length;
  
  const dishDiv = document.createElement('div');
  dishDiv.className = 'builder-dish';
  dishDiv.dataset.dish = dishIndex;
  
  dishDiv.innerHTML = `
    <input type="text" placeholder="Название блюда" class="dish-name" />
    <div class="dish-macros-inputs">
      <input type="number" placeholder="ккал" class="dish-calories" min="0" />
      <input type="number" placeholder="Б" class="dish-protein" min="0" />
      <input type="number" placeholder="У" class="dish-carbs" min="0" />
      <input type="number" placeholder="Ж" class="dish-fats" min="0" />
    </div>
  `;
  
  dishesBuilder.appendChild(dishDiv);
}

// Сохранить рацион
function saveDiet() {
  const meals = [];
  const mealItems = document.querySelectorAll('.builder-meal');
  
  mealItems.forEach(mealItem => {
    const mealName = mealItem.querySelector('.meal-name').value.trim();
    const mealTime = mealItem.querySelector('.meal-time').value;
    
    if (!mealName) return;
    
    const dishes = [];
    const dishItems = mealItem.querySelectorAll('.builder-dish');
    
    dishItems.forEach(dishItem => {
      const dishName = dishItem.querySelector('.dish-name').value.trim();
      const calories = parseInt(dishItem.querySelector('.dish-calories').value) || 0;
      const protein = parseInt(dishItem.querySelector('.dish-protein').value) || 0;
      const carbs = parseInt(dishItem.querySelector('.dish-carbs').value) || 0;
      const fats = parseInt(dishItem.querySelector('.dish-fats').value) || 0;
      
      if (dishName) {
        dishes.push({ name: dishName, calories, protein, carbs, fats });
      }
    });
    
    if (dishes.length > 0) {
      meals.push({ name: mealName, time: mealTime, dishes });
    }
  });
  
  if (meals.length === 0) {
    toast('Добавь хотя бы один прием пищи');
    return;
  }
  
  currentDiet.meals = meals;
  localStorage.setItem('dietGeneratorData', JSON.stringify(currentDiet));
  toast('✅ Рацион сохранен!');
  
  // Очистить форму
  document.getElementById('mealBuilder').innerHTML = '';
  
  // Переключиться на главную
  setTimeout(() => showSection('home'), 500);
}

// Импорт рациона
function importDiet() {
  const importData = document.getElementById('importData').value.trim();
  
  if (!importData) {
    toast('Вставь JSON данные');
    return;
  }
  
  try {
    const data = JSON.parse(importData);
    
    if (!data.meals || !Array.isArray(data.meals)) {
      toast('Неверный формат: нет массива meals');
      return;
    }
    
    // Валидация
    for (const meal of data.meals) {
      if (!meal.name || !meal.dishes || !Array.isArray(meal.dishes)) {
        toast('Неверный формат приемов пищи');
        return;
      }
    }
    
    currentDiet = data;
    localStorage.setItem('dietGeneratorData', JSON.stringify(currentDiet));
    toast('✅ Рацион импортирован!');
    document.getElementById('importData').value = '';
    
    setTimeout(() => showSection('home'), 500);
    
  } catch (e) {
    toast('Ошибка: ' + e.message);
  }
}

// Загрузить рацион
function loadDiet() {
  const saved = localStorage.getItem('dietGeneratorData');
  if (saved) {
    try {
      currentDiet = JSON.parse(saved);
    } catch (e) {
      console.error('Ошибка загрузки:', e);
    }
  }
}

// Отобразить рацион
function displayDiet() {
  const container = document.getElementById('mealsContainer');
  container.innerHTML = '';
  
  if (!currentDiet.meals || currentDiet.meals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🍽️</div>
        <div class="empty-state-text">Рацион пуст<br>Создай или импортируй рацион</div>
      </div>
    `;
    updateStats(0, 0, 0, 0);
    return;
  }
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  
  currentDiet.meals.forEach(meal => {
    const mealCard = document.createElement('div');
    mealCard.className = 'meal-card';
    
    let dishesHTML = '';
    meal.dishes.forEach(dish => {
      totalCalories += dish.calories || 0;
      totalProtein += dish.protein || 0;
      totalCarbs += dish.carbs || 0;
      totalFats += dish.fats || 0;
      
      dishesHTML += `
        <div class="dish-item">
          <div class="dish-name">${dish.name}</div>
          <div class="dish-macros">
            <span class="macro-badge">${dish.calories || 0} ккал</span>
            <span class="macro-badge">Б: ${dish.protein || 0}г</span>
            <span class="macro-badge">У: ${dish.carbs || 0}г</span>
            <span class="macro-badge">Ж: ${dish.fats || 0}г</span>
          </div>
        </div>
      `;
    });
    
    mealCard.innerHTML = `
      <div class="meal-card-header">
        <div class="meal-name">${meal.name}</div>
        <div class="meal-time">⏰ ${meal.time || '--:--'}</div>
      </div>
      ${dishesHTML}
    `;
    
    container.appendChild(mealCard);
  });
  
  updateStats(totalCalories, totalProtein, totalCarbs, totalFats);
}

// Обновить статистику
function updateStats(calories, protein, carbs, fats) {
  document.getElementById('totalCalories').textContent = calories;
  document.getElementById('totalProtein').textContent = protein;
  document.getElementById('totalCarbs').textContent = carbs;
  document.getElementById('totalFats').textContent = fats;
}

// Очистить рацион
function clearDiet() {
  if (confirm('Удалить весь рацион?')) {
    currentDiet = { meals: [] };
    localStorage.removeItem('dietGeneratorData');
    displayDiet();
    toast('🗑️ Рацион очищен');
    showSection('home');
  }
}

// Toast уведомления
function toast(text) {
  const t = document.getElementById('toast');
  t.textContent = text;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Переключение темы
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.contains('dark-theme');
  
  if (isDark) {
    body.classList.remove('dark-theme');
    document.getElementById('themeLabel').innerHTML = '☀️ Светлая тема';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-theme');
    document.getElementById('themeLabel').innerHTML = '🌙 Темная тема';
    localStorage.setItem('theme', 'dark');
  }
}

// Загрузка темы
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  
  if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    document.getElementById('themeLabel').innerHTML = '☀️ Светлая тема';
  } else {
    body.classList.add('dark-theme');
    document.getElementById('themeLabel').innerHTML = '🌙 Темная тема';
  }
}
