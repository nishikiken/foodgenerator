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
  loadRecipes();
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
  } else if (section === 'recipes') {
    document.getElementById('recipesPage').classList.add('active');
    document.querySelectorAll('.nav-item')[2].classList.add('active');
    displayRecipes();
  } else if (section === 'import') {
    document.getElementById('importPage').classList.add('active');
    document.querySelectorAll('.nav-item')[3].classList.add('active');
  } else if (section === 'profile') {
    document.getElementById('profilePage').classList.add('active');
    document.querySelectorAll('.nav-item')[4].classList.add('active');
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

// Копирование промпта
function copyPrompt() {
  const prompt = document.getElementById('aiPrompt').textContent;
  navigator.clipboard.writeText(prompt).then(() => {
    toast('✅ Промпт скопирован!');
  }).catch(() => {
    toast('❌ Ошибка копирования');
  });
}

// О приложении
function showAbout() {
  toast('Diet Generator v1.0 - Управление рационом питания');
}

// ===== РЕЦЕПТЫ =====
let currentRecipes = [];

function loadRecipes() {
  const saved = localStorage.getItem('dietGeneratorRecipes');
  if (saved) {
    try {
      currentRecipes = JSON.parse(saved);
    } catch (e) {
      console.error('Ошибка загрузки рецептов:', e);
    }
  }
}

function showCreateRecipe() {
  document.getElementById('recipeForm').style.display = 'block';
  document.getElementById('ingredientsList').innerHTML = '';
  document.getElementById('recipeName').value = '';
  document.getElementById('recipeDescription').value = '';
  updateRecipeTotals();
}

function hideCreateRecipe() {
  document.getElementById('recipeForm').style.display = 'none';
}

function addIngredient() {
  const list = document.getElementById('ingredientsList');
  const index = list.children.length;
  
  const item = document.createElement('div');
  item.className = 'ingredient-item';
  item.dataset.index = index;
  
  item.innerHTML = `
    <div class="ingredient-row">
      <input type="text" placeholder="Ингредиент" class="ing-name" oninput="updateRecipeTotals()" />
      <input type="number" placeholder="г" class="ing-weight" oninput="updateRecipeTotals()" min="0" />
    </div>
    <div class="ingredient-macros">
      <input type="number" placeholder="ккал" class="ing-calories" oninput="updateRecipeTotals()" min="0" />
      <input type="number" placeholder="Б" class="ing-protein" oninput="updateRecipeTotals()" min="0" />
      <input type="number" placeholder="У" class="ing-carbs" oninput="updateRecipeTotals()" min="0" />
      <input type="number" placeholder="Ж" class="ing-fats" oninput="updateRecipeTotals()" min="0" />
    </div>
  `;
  
  list.appendChild(item);
}

function updateRecipeTotals() {
  const items = document.querySelectorAll('.ingredient-item');
  let totalWeight = 0;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  
  items.forEach(item => {
    const weight = parseFloat(item.querySelector('.ing-weight').value) || 0;
    const calories = parseFloat(item.querySelector('.ing-calories').value) || 0;
    const protein = parseFloat(item.querySelector('.ing-protein').value) || 0;
    const carbs = parseFloat(item.querySelector('.ing-carbs').value) || 0;
    const fats = parseFloat(item.querySelector('.ing-fats').value) || 0;
    
    totalWeight += weight;
    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFats += fats;
  });
  
  // Пересчет на 100г
  if (totalWeight > 0) {
    const factor = 100 / totalWeight;
    document.getElementById('recipeTotalCalories').textContent = Math.round(totalCalories * factor);
    document.getElementById('recipeTotalProtein').textContent = Math.round(totalProtein * factor);
    document.getElementById('recipeTotalCarbs').textContent = Math.round(totalCarbs * factor);
    document.getElementById('recipeTotalFats').textContent = Math.round(totalFats * factor);
  } else {
    document.getElementById('recipeTotalCalories').textContent = 0;
    document.getElementById('recipeTotalProtein').textContent = 0;
    document.getElementById('recipeTotalCarbs').textContent = 0;
    document.getElementById('recipeTotalFats').textContent = 0;
  }
}

function saveRecipe() {
  const name = document.getElementById('recipeName').value.trim();
  const description = document.getElementById('recipeDescription').value.trim();
  
  if (!name) {
    toast('Введи название рецепта');
    return;
  }
  
  const ingredients = [];
  const items = document.querySelectorAll('.ingredient-item');
  
  items.forEach(item => {
    const ingName = item.querySelector('.ing-name').value.trim();
    const weight = parseFloat(item.querySelector('.ing-weight').value) || 0;
    const calories = parseFloat(item.querySelector('.ing-calories').value) || 0;
    const protein = parseFloat(item.querySelector('.ing-protein').value) || 0;
    const carbs = parseFloat(item.querySelector('.ing-carbs').value) || 0;
    const fats = parseFloat(item.querySelector('.ing-fats').value) || 0;
    
    if (ingName && weight > 0) {
      ingredients.push({ name: ingName, weight, calories, protein, carbs, fats });
    }
  });
  
  if (ingredients.length === 0) {
    toast('Добавь хотя бы один ингредиент');
    return;
  }
  
  const recipe = {
    id: Date.now(),
    name,
    description,
    ingredients,
    calories: parseInt(document.getElementById('recipeTotalCalories').textContent),
    protein: parseInt(document.getElementById('recipeTotalProtein').textContent),
    carbs: parseInt(document.getElementById('recipeTotalCarbs').textContent),
    fats: parseInt(document.getElementById('recipeTotalFats').textContent)
  };
  
  currentRecipes.push(recipe);
  localStorage.setItem('dietGeneratorRecipes', JSON.stringify(currentRecipes));
  
  toast('✅ Рецепт сохранен!');
  hideCreateRecipe();
  displayRecipes();
}

function displayRecipes() {
  const list = document.getElementById('recipesList');
  list.innerHTML = '';
  
  if (currentRecipes.length === 0) {
    list.innerHTML = '<div class="empty-recipes">Нет рецептов<br>Создай свой первый рецепт</div>';
    return;
  }
  
  currentRecipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    card.innerHTML = `
      <div class="recipe-card-header">
        <div class="recipe-card-title">${recipe.name}</div>
        <button onclick="deleteRecipe(${recipe.id})" class="btn-delete-recipe">🗑️</button>
      </div>
      ${recipe.description ? `<div class="recipe-card-desc">${recipe.description}</div>` : ''}
      <div class="recipe-card-macros">
        <span class="macro-badge">${recipe.calories} ккал</span>
        <span class="macro-badge">Б: ${recipe.protein}г</span>
        <span class="macro-badge">У: ${recipe.carbs}г</span>
        <span class="macro-badge">Ж: ${recipe.fats}г</span>
      </div>
    `;
    
    list.appendChild(card);
  });
}

function deleteRecipe(id) {
  if (confirm('Удалить рецепт?')) {
    currentRecipes = currentRecipes.filter(r => r.id !== id);
    localStorage.setItem('dietGeneratorRecipes', JSON.stringify(currentRecipes));
    displayRecipes();
    toast('🗑️ Рецепт удален');
  }
}
