window.onload = () => {
  const app = new PIXI.Application({
    width: 800,
    height: 500,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  let isPlaying = false;

  document.getElementById("wheel").appendChild(app.view);

  const texture = PIXI.Texture.from("./bcg1.png");
  const sprite = new PIXI.Sprite(texture);

  sprite.position.set(0, 0);
  sprite.scale.set(1);
  app.stage.addChild(sprite);

  const stageCenterX = app.screen.width / 2;
  const stageCenterY = app.screen.height / 2;

  const barrelContainer = new PIXI.Container();
  barrelContainer.position.set(stageCenterX, stageCenterY);
  barrelContainer.rotation = -Math.PI / 2;
  app.stage.addChild(barrelContainer);

  const barrel = new PIXI.Graphics();
  barrel.drawCircle(0, 0, 200);
  barrelContainer.addChild(barrel);

  const mask = new PIXI.Graphics();
  mask.beginFill(0xffffff);
  mask.drawCircle(0, 0, 200);
  mask.endFill();
  mask.position.set(stageCenterX, stageCenterY);

  barrelContainer.mask = mask;

  const numberOfPrizes = parseInt(prompt("Enter Prizes amount from 5 to 10"));

  const prizes = [];

  function generatePrizes(num) {
    const color = "#BC8F8F";

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
  }

  const angle = (2 * Math.PI) / prizes.length;
  const radius = 150;
  const triangleHeight = 300;

  const sectorGraphicsArray = [];

  prizes.forEach((prize, index) => {
    const x = radius * Math.cos(angle * index);
    const y = radius * Math.sin(angle * index);

    const prizeGraphic = new PIXI.Graphics();
    prizeGraphic.beginFill(prize.color);

    const triangleBase = ((2 * Math.PI * radius) / prizes.length) * 2;
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
    text.angle = index * (360 / prizes.length) + 90;

    sectorGraphicsArray.push(prizeGraphic);
    barrelContainer.addChild(prizeGraphic, text);
  });

  app.stage.addChild(mask);

  const spinButton = new PIXI.Graphics();
  spinButton.beginFill(0xffffff);
  spinButton.drawCircle(0, 0, 40);
  spinButton.endFill();
  spinButton.position.set(stageCenterX, stageCenterY);

  const buttonText = new PIXI.Text("SPIN", {
    fontSize: 15,
    fill: "black",
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });
  buttonText.anchor.set(0.5);

  buttonText.position.set(stageCenterX, stageCenterY);

  spinButton.eventMode = "dynamic";
  spinButton.buttonMode = true;
  spinButton.on("pointerdown", () => {
    randomClickButton();
  });

  app.stage.addChild(spinButton);
  app.stage.addChild(buttonText);

  const numbersArray = Array.from(
    { length: prizes.length },
    (_, index) => index + 1
  );

  const buttonsArray = [];
  let stepCount = 0;

  const buttonsList = document.getElementById("buttons");

  for (let i = 0; i < prizes.length; i++) {
    const button = document.createElement("button");
    button.textContent = `Prize ${i + 1}`;
    button.index = i + 1;
    button.addEventListener("click", () => {
      handleClick(button.index);
    });
    buttonsArray.push(button);
  }

  buttonsArray.forEach((button) => {
    buttonsList.appendChild(button);
  });

  function rotateBarrel() {
    const degreesToRotate = 1440 - (360 / prizes.length) * stepCount;
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

      const easedProgress = easeInOut(progress);

      barrelContainer.rotation =
        initialRotation + (targetRotation - initialRotation) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const winningPrize = calculateWinning(numbersArray, prizes);
      }
    }
    7;

    requestAnimationFrame(animate);
  }

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  function handleClick(buttonIndex) {
    if (isPlaying) return;

    isPlaying = !isPlaying;

    const numberIndex = numbersArray.indexOf(buttonIndex);

    if (numberIndex !== -1) {
      stepCount = numberIndex;

      rotateBarrel();

      const removedNumbers = numbersArray.splice(0, numberIndex);

      numbersArray.push(...removedNumbers);
    }
  }

  function randomClickButton() {
    const randomIndex = Math.floor(Math.random() * buttonsArray.length);

    const randomButton = buttonsArray[randomIndex];

    randomButton.click();
  }

  const list = document.getElementById("list");

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
  }

  createListPrizes();

  function calculateWinning(numbersArray, prizes) {
    const index = numbersArray[0] - 1;

    if (index >= 0 && index < prizes.length) {
      const winningPrize = prizes[index];
      const listItem = listPrizes[index];
      const sector = sectorGraphicsArray[index];

      listItem.classList.add("active");

      sector.tint = 0xff0000;

      const interval = setInterval(() => {
        sector.tint = sector.tint === 0xff0000 ? 0xffffff : 0xff0000;
      }, 500);

      setTimeout(() => {
        listItem.classList.remove("active");
        clearInterval(interval);
        sector.tint = 0xffffff;
        isPlaying = !isPlaying;
      }, 3000);

      return winningPrize;
    }
  }
};
