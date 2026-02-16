// Хранилище данных
let currentDiet = {
  meals: []
};

// Загрузка данных из localStorage при старте
window.addEventListener('DOMContentLoaded', () => {
  loadDiet();
  showSection('create');
});

// Переключение секций
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  
  if (section === 'create') {
    document.getElementById('createSection').style.display = 'block';
  } else if (section === 'import') {
    document.getElementById('importSection').style.display = 'block';
  } else if (section === 'my') {
    document.getElementById('mySection').style.display = 'block';
    displayDiet();
  }
}

// Добавить прием пищи
function addMeal() {
  const mealBuilder = document.getElementById('mealBuilder');
  const mealIndex = mealBuilder.children.length;
  
  const mealItem = document.createElement('div');
  mealItem.className = 'meal-item';
  mealItem.dataset.index = mealIndex;
  
  mealItem.innerHTML = `
    <div class="meal-header">
      <input type="text" placeholder="Название приема пищи (например, Завтрак)" class="meal-name" />
      <input type="time" value="08:00" class="meal-time" />
      <button onclick="removeMeal(${mealIndex})" class="remove-meal-btn">✕</button>
    </div>
    <div class="dishes-list" data-meal="${mealIndex}"></div>
    <button onclick="addDish(${mealIndex})" class="add-dish-btn">+ Добавить блюдо</button>
  `;
  
  mealBuilder.appendChild(mealItem);
}

// Удалить прием пищи
function removeMeal(index) {
  const mealItem = document.querySelector(`.meal-item[data-index="${index}"]`);
  if (mealItem) {
    mealItem.remove();
  }
}

// Добавить блюдо
function addDish(mealIndex) {
  const dishesList = document.querySelector(`.dishes-list[data-meal="${mealIndex}"]`);
  const dishIndex = dishesList.children.length;
  
  const dishItem = document.createElement('div');
  dishItem.className = 'dish-item';
  dishItem.dataset.dish = dishIndex;
  
  dishItem.innerHTML = `
    <input type="text" placeholder="Название блюда" class="dish-name" />
    <input type="number" placeholder="Калории" class="dish-calories" min="0" />
    <input type="number" placeholder="Белки (г)" class="dish-protein" min="0" />
    <input type="number" placeholder="Углеводы (г)" class="dish-carbs" min="0" />
    <input type="number" placeholder="Жиры (г)" class="dish-fats" min="0" />
    <button onclick="removeDish(${mealIndex}, ${dishIndex})" class="remove-dish-btn">✕</button>
  `;
  
  dishesList.appendChild(dishItem);
}

// Удалить блюдо
function removeDish(mealIndex, dishIndex) {
  const dishItem = document.querySelector(`.dishes-list[data-meal="${mealIndex}"] .dish-item[data-dish="${dishIndex}"]`);
  if (dishItem) {
    dishItem.remove();
  }
}

// Сохранить рацион
function saveDiet() {
  const meals = [];
  const mealItems = document.querySelectorAll('.meal-item');
  
  mealItems.forEach(mealItem => {
    const mealName = mealItem.querySelector('.meal-name').value.trim();
    const mealTime = mealItem.querySelector('.meal-time').value;
    
    if (!mealName) {
      notify('Заполни название приема пищи');
      return;
    }
    
    const dishes = [];
    const dishItems = mealItem.querySelectorAll('.dish-item');
    
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
    notify('Добавь хотя бы один прием пищи с блюдами');
    return;
  }
  
  currentDiet.meals = meals;
  localStorage.setItem('foodGeneratorDiet', JSON.stringify(currentDiet));
  notify('✅ Рацион сохранен!');
  
  // Очистить форму
  document.getElementById('mealBuilder').innerHTML = '';
}

// Импорт рациона
function importDiet() {
  const importData = document.getElementById('importData').value.trim();
  
  if (!importData) {
    notify('Вставь JSON данные');
    return;
  }
  
  try {
    const data = JSON.parse(importData);
    
    if (!data.meals || !Array.isArray(data.meals)) {
      notify('Неверный формат: отсутствует массив meals');
      return;
    }
    
    // Валидация структуры
    for (const meal of data.meals) {
      if (!meal.name || !meal.dishes || !Array.isArray(meal.dishes)) {
        notify('Неверный формат: проверь структуру приемов пищи');
        return;
      }
      
      for (const dish of meal.dishes) {
        if (!dish.name || typeof dish.calories !== 'number') {
          notify('Неверный формат: проверь структуру блюд');
          return;
        }
      }
    }
    
    currentDiet = data;
    localStorage.setItem('foodGeneratorDiet', JSON.stringify(currentDiet));
    notify('✅ Рацион импортирован!');
    document.getElementById('importData').value = '';
    
  } catch (e) {
    notify('Ошибка парсинга JSON: ' + e.message);
  }
}

// Загрузить рацион из localStorage
function loadDiet() {
  const saved = localStorage.getItem('foodGeneratorDiet');
  if (saved) {
    try {
      currentDiet = JSON.parse(saved);
    } catch (e) {
      console.error('Ошибка загрузки рациона:', e);
    }
  }
}

// Отобразить рацион
function displayDiet() {
  const mealsList = document.getElementById('mealsList');
  mealsList.innerHTML = '';
  
  if (!currentDiet.meals || currentDiet.meals.length === 0) {
    mealsList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">Рацион пуст. Создай или импортируй рацион.</p>';
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
        <div class="dish-list-item">
          <div class="dish-name">${dish.name}</div>
          <div class="dish-macros">
            <span>${dish.calories || 0} ккал</span>
            <span>Б: ${dish.protein || 0}г</span>
            <span>У: ${dish.carbs || 0}г</span>
            <span>Ж: ${dish.fats || 0}г</span>
          </div>
        </div>
      `;
    });
    
    mealCard.innerHTML = `
      <h3>${meal.name}</h3>
      <div class="meal-time">⏰ ${meal.time || 'Не указано'}</div>
      ${dishesHTML}
    `;
    
    mealsList.appendChild(mealCard);
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
  if (confirm('Точно хочешь удалить весь рацион?')) {
    currentDiet = { meals: [] };
    localStorage.removeItem('foodGeneratorDiet');
    displayDiet();
    notify('🗑️ Рацион очищен');
  }
}

// Уведомления
function notify(text) {
  const n = document.getElementById('notify');
  n.textContent = text;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}
