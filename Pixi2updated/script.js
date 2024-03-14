window.onLoad = () => {
  // Создаем сцену Pixi.js
const app = new PIXI.Application({
  width: 800,
  height: 500,
  antialias: true,
  resolution: window.devicePixelRatio,
  autoDensity: true,
});

document.getElementById('wheel').appendChild(app.view);


// Загрузите текстуру спрайта
const texture = PIXI.Texture.from('./bcg1.png');

// Создайте спрайт с этой текстурой
const sprite = new PIXI.Sprite(texture);

sprite.position.set(0, 0); 
sprite.scale.set(1); // Установите масштаб спрайта

// Добавьте спрайт в контейнер
app.stage.addChild(sprite);



// Calculate the center
const stageCenterX = app.screen.width / 2;
const stageCenterY = app.screen.height / 2;

// Создаем контейнер для барабана
const barrelContainer = new PIXI.Container();
barrelContainer.position.set(stageCenterX, stageCenterY);
barrelContainer.rotation = -Math.PI / 2;
app.stage.addChild(barrelContainer);

// Рисуем барабан
const barrel = new PIXI.Graphics();
barrel.drawCircle(0, 0, 200);
barrelContainer.addChild(barrel);

// Создаем маску
const mask = new PIXI.Graphics();
mask.beginFill(0xFFFFFF); // Установите цвет маски (белый)
mask.drawCircle(0, 0, 200); // Установите радиус маски таким же, как радиус барабана
mask.endFill();
mask.position.set(stageCenterX, stageCenterY);

// Применяем маску к контейнеру барабана
barrelContainer.mask = mask;

// Создаем массив с призами
// Запрос числа с использованием промпта
const numberOfPrizes = parseInt(prompt("Введите число призов:"));

const prizes = [];
function generatePrizes(num) {
  const color = "#BC8F8F"; // Цвет для всех призов

  for (let i = 1; i <= num; i++) {
    const prize = {
      title: `${i}`,
      color: color,
    };
    prizes.push(prize);
  }

}

if (!isNaN(numberOfPrizes)) {
  const prizes = generatePrizes(numberOfPrizes);
} else {
  console.log("Вы ввели некорректное число призов.");
}


// Распределяем призы внутри барабана
const angle = (2 * Math.PI) / prizes.length;
const radius = 150;
const triangleHeight = 300;


const sectorGraphicsArray = [];


prizes.forEach((prize, index) => {
  const x = radius * Math.cos(angle * index);
  const y = radius * Math.sin(angle * index);

  const prizeGraphic = new PIXI.Graphics();
  prizeGraphic.beginFill(prize.color);

  const triangleBase = ((2 * Math.PI * radius) / prizes.length * 2);
  const triangleHalfBase = triangleBase / 2;

  const rotation = angle * index - Math.PI / 2;

  prizeGraphic.rotation = rotation;
  prizeGraphic.moveTo(-triangleHalfBase, triangleHeight / 2);
  prizeGraphic.lineTo(triangleHalfBase, triangleHeight / 2);
  prizeGraphic.lineTo(0, -triangleHeight / 2);
  prizeGraphic.lineTo(-triangleHalfBase, triangleHeight / 2);

  prizeGraphic.position.set(x, y);

  prizeGraphic.endFill();

  const text = new PIXI.Text(prize.title, {
    fontSize: 16,
    fill: "white",
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  text.anchor.set(0.5);
  text.position.set(x, y);
  text.angle = ((index * (360 / prizes.length)) + 90);

  sectorGraphicsArray.push(prizeGraphic);
  barrelContainer.addChild(prizeGraphic, text);
});

app.stage.addChild(mask);

// Создаем кнопку для вращения барабана
const spinButton = new PIXI.Graphics();
spinButton.beginFill(0xFFFFFF); // Устанавливаем цвет кнопки (белый)
spinButton.drawCircle(0, 0, 40); // Устанавливаем размер кнопки
spinButton.endFill();
spinButton.position.set(stageCenterX, stageCenterY); // Позиционируем кнопку в центре сцены

// Создаем текст для кнопки
const buttonText = new PIXI.Text('SPIN', {
  fontSize: 15,
  fill: 'black',
  antialias: true,
  resolution: window.devicePixelRatio,
  autoDensity: true,
});
buttonText.anchor.set(0.5); // Центрируем текст

// Устанавливаем позицию текста в центр кнопки
buttonText.position.set(stageCenterX, stageCenterY);

// Назначаем обработчик события клика на кнопку
spinButton.interactive = true;
spinButton.buttonMode = true;
spinButton.on('pointerdown', () => {
  randomClickButton()
});

app.stage.addChild(spinButton); // Добавляем кнопку на сцену
app.stage.addChild(buttonText); // Добавляем текст на кнопку

// Создаем массив с последовательными числами
const numbersArray = Array.from({ length: prizes.length }, (_, index) => index + 1);
const buttonsArray = [];
let stepCount = 0; // Переменная для хранения количества шагов

const buttonsList = document.getElementById("buttons");


// Создаем кнопки и добавляем их в массив
for (let i = 0; i < prizes.length; i++) {
  const button = document.createElement('button');
  button.textContent = `Prize ${i + 1}`;
  button.index = i + 1;
  button.addEventListener('click', () => {
    handleClick(button.index);
  });
  buttonsArray.push(button); // Добавляем кнопку в массив
}

// Добавляем кнопки на страницу
buttonsArray.forEach(button => {
  buttonsList.appendChild(button);
});

// Анимация кручения барабана с ускорением и замедлением
function rotateBarrel() {
  const degreesToRotate = 1440 - ((360 / prizes.length) * stepCount);
  const rotationInRadians = (Math.PI / 180) * degreesToRotate;
  const duration = 4000;

  const initialRotation = barrelContainer.rotation;
  const targetRotation = initialRotation + rotationInRadians;
  let startTime = null;

  function animate(currentTime) {
    if (!startTime) {
      startTime = currentTime;
    }

    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Применяем кривую интерполяции для изменения скорости
    const easedProgress = easeInOut(progress);

    barrelContainer.rotation = initialRotation + (targetRotation - initialRotation) * easedProgress;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Вызываем функцию calculateWinning для узнавания приза
      const winningPrize = calculateWinning(numbersArray, prizes);

      if (winningPrize) {
        console.log("Вы выиграли:", winningPrize.title);
      }
    }
  }

  requestAnimationFrame(animate);
}

// Функция для эффекта ускорения и замедления (ease-in-out)
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}


// Функция, которая обрабатывает клик на кнопке
function handleClick(buttonIndex) {
  // Находим индекс числа, которое соответствует кнопке
  const numberIndex = numbersArray.indexOf(buttonIndex);

  if (numberIndex !== -1) {
    // Рассчитываем количество шагов
    stepCount = numberIndex;

    // Вращаем барабан
    rotateBarrel();

    // Удаляем числа до этой кнопки из массива и сохраняем их в новом массиве
    const removedNumbers = numbersArray.splice(0, numberIndex);

    // Добавляем удаленные числа в конец массива
    numbersArray.push(...removedNumbers);

    // Выводим обновленный массив и количество шагов в консоль
    console.log("Массив:", numbersArray);
    console.log("Количество шагов:", stepCount);
  }
}

function randomClickButton() {
  // Генерируем случайный индекс из диапазона 0 до длины массива - 1
  const randomIndex = Math.floor(Math.random() * buttonsArray.length);

  // Получаем случайно выбранную кнопку
  const randomButton = buttonsArray[randomIndex];

  // Вызываем обработчик события click на выбранной кнопке
  randomButton.click();
}


// Создаем список призов . 

const list = document.getElementById('list')

// Добавляем призы в список

function createListPrizes() {
  list.innerHTML = "";
  listPrizes = prizes.map(({ title, color }) => {
    const listItem = document.createElement("div");
    listItem.className = "list-prize";
    listItem.style.height = `${90 / prizes.length}%`;
    listItem.style.backgroundColor = `${color}`;
    listItem.innerHTML = `${title}`;
    list.appendChild(listItem);
    return listItem;
  });
};

createListPrizes();

// рачитываем выйгрыш  и анимируем объекты
function calculateWinning(numbersArray, prizes) {
  if (numbersArray.length === 0) {
    return "Нет выигрыша, так как numbersArray пуст.";
  }

  const index = numbersArray[0] - 1;

  if (index >= 0 && index < prizes.length) {
    const winningPrize = prizes[index];
    const listItem = listPrizes[index];
    const sector = sectorGraphicsArray[index];

    // Добавляем класс "active" к элементу списка для мигания
    listItem.classList.add("active");

    // Устанавливаем временный тинт (красный)
    sector.tint = 0xff0000; // Красный цвет

    // Устанавливаем интервал для мигания в течение 3 секунд
    const interval = setInterval(() => {
      sector.tint = (sector.tint === 0xff0000) ? 0xffffff : 0xff0000; // Переключаем цвет между красным и исходным
    }, 500); // Переключение цвета каждые 0.5 секунды

    // Устанавливаем таймер для остановки мигания и возврата к исходному цвету через 3 секунды
    setTimeout(() => {
      listItem.classList.remove("active");
      clearInterval(interval); // Останавливаем интервал
      sector.tint = 0xffffff; // Возвращаем исходный цвет (белый)
    }, 3000); // 3000 миллисекунд = 3 секунды

    return winningPrize;
  }
}



}
