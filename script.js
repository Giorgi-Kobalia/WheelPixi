import * as PIXI from "pixi.js";

window.onload = async () => {
  const CONFIG = {
    designWidth: 1100,
    designHeight: 650,
    minPrizes: 6,
    maxPrizes: 16,
    defaultPrizes: 6,
    sectorColor: "#BC8F8F",
    wheelCenter: { x: 700, y: 325 },
    wheelRadius: 200,
    spinButtonRadius: 40,
    spinDuration: 4000,
    winFlashDuration: 3000,
    buttonsPanel: { x: 40, y: 90, width: 220, height: 480, gapX: 14, gapY: 12 },
  };

  const app = new PIXI.Application({
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    backgroundColor: 0x111111,
  });

  document.getElementById("wheel").appendChild(app.view);

  const root = new PIXI.Container();
  app.stage.addChild(root);

  const bgTexture = await PIXI.Assets.load("./bcg1.png");
  const bgSprite = new PIXI.Sprite(bgTexture);
  bgSprite.anchor.set(0.5);
  app.stage.addChildAt(bgSprite, 0);

  function layoutBackground() {
    const screenW = app.screen.width;
    const screenH = app.screen.height;
    const scale = Math.max(
      screenW / bgTexture.width,
      screenH / bgTexture.height
    );
    bgSprite.scale.set(scale);
    bgSprite.position.set(screenW / 2, screenH / 2);
  }

  function layoutRoot() {
    const scale = Math.min(
      app.screen.width / CONFIG.designWidth,
      app.screen.height / CONFIG.designHeight
    );
    root.scale.set(scale);
    root.position.set(
      (app.screen.width - CONFIG.designWidth * scale) / 2,
      (app.screen.height - CONFIG.designHeight * scale) / 2
    );
  }

  function resizeApp() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    layoutBackground();
    layoutRoot();
  }

  window.addEventListener("resize", resizeApp);
  resizeApp();

  function createButton({
    x,
    y,
    width,
    height,
    label,
    fontSize = 18,
    fill = 0xffffff,
    textColor = "black",
    radius = 10,
    shape = "rect",
    borderColor = 0x333333,
    borderWidth = 2,
    onClick,
  }) {
    const container = new PIXI.Container();
    container.position.set(x, y);

    const bg = new PIXI.Graphics();
    bg.lineStyle(borderWidth, borderColor, 1);
    bg.beginFill(fill);
    if (shape === "circle") {
      bg.drawCircle(0, 0, width / 2);
    } else {
      bg.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
    bg.endFill();

    const text = new PIXI.Text(label, {
      fontSize,
      fill: textColor,
      fontFamily: "Arial",
    });
    text.anchor.set(0.5);

    container.addChild(bg, text);
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointerdown", onClick);
    container.on("pointerover", () => (container.alpha = 0.8));
    container.on("pointerout", () => (container.alpha = 1));

    return container;
  }

  let numberOfPrizes = CONFIG.defaultPrizes;

  function showMenu() {
    const menu = new PIXI.Container();
    root.addChild(menu);

    const centerX = CONFIG.designWidth / 2;
    const centerY = CONFIG.designHeight / 2 - 25;

    const panel = new PIXI.Graphics();
    panel.lineStyle(2, 0xffffff, 0.15);
    panel.beginFill(0x000000, 0.55);
    panel.drawRoundedRect(-240, -180, 480, 360, 24);
    panel.endFill();
    panel.position.set(centerX, centerY);
    menu.addChild(panel);

    const title = new PIXI.Text("Wheel of Fortune", {
      fontSize: 38,
      fill: "white",
      fontFamily: "Arial",
      fontWeight: "bold",
    });
    title.anchor.set(0.5);
    title.position.set(centerX, centerY - 105);
    menu.addChild(title);

    const subtitle = new PIXI.Text("Number of sectors", {
      fontSize: 18,
      fill: 0xcccccc,
      fontFamily: "Arial",
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(centerX, centerY - 50);
    menu.addChild(subtitle);

    const valueText = new PIXI.Text(String(numberOfPrizes), {
      fontSize: 42,
      fill: "white",
      fontFamily: "Arial",
      fontWeight: "bold",
    });
    valueText.anchor.set(0.5);
    valueText.position.set(centerX, centerY + 5);
    menu.addChild(valueText);

    const minusBtn = createButton({
      x: centerX - 110,
      y: centerY + 5,
      width: 56,
      height: 56,
      label: "-",
      fontSize: 26,
      onClick: () => {
        numberOfPrizes = Math.max(CONFIG.minPrizes, numberOfPrizes - 1);
        valueText.text = String(numberOfPrizes);
      },
    });
    menu.addChild(minusBtn);

    const plusBtn = createButton({
      x: centerX + 110,
      y: centerY + 5,
      width: 56,
      height: 56,
      label: "+",
      fontSize: 26,
      onClick: () => {
        numberOfPrizes = Math.min(CONFIG.maxPrizes, numberOfPrizes + 1);
        valueText.text = String(numberOfPrizes);
      },
    });
    menu.addChild(plusBtn);

    const startBtn = createButton({
      x: centerX,
      y: centerY + 100,
      width: 200,
      height: 60,
      label: "Start",
      fontSize: 24,
      fill: 0x4caf50,
      textColor: "white",
      borderColor: 0x2e7d32,
      onClick: () => {
        root.removeChild(menu);
        menu.destroy({ children: true });
        buildWheelScreen(numberOfPrizes);
      },
    });
    menu.addChild(startBtn);
  }

  function buildWheelScreen(prizeCount) {
    const screen = new PIXI.Container();
    root.addChild(screen);

    let isPlaying = false;

    const prizes = Array.from({ length: prizeCount }, (_, i) => ({
      title: `${i + 1}`,
      color: CONFIG.sectorColor,
    }));

    const barrelContainer = new PIXI.Container();
    barrelContainer.position.set(CONFIG.wheelCenter.x, CONFIG.wheelCenter.y);
    barrelContainer.rotation = -Math.PI / 2;
    screen.addChild(barrelContainer);

    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.drawCircle(0, 0, CONFIG.wheelRadius);
    mask.endFill();
    mask.position.set(CONFIG.wheelCenter.x, CONFIG.wheelCenter.y);
    screen.addChild(mask);
    barrelContainer.mask = mask;

    const angle = (2 * Math.PI) / prizes.length;
    const radius = CONFIG.wheelRadius;
    const sectorGraphicsArray = [];

    prizes.forEach((prize, index) => {
      const midAngle = angle * index;
      const startAngle = midAngle - angle / 2;
      const endAngle = midAngle + angle / 2;

      const prizeGraphic = new PIXI.Graphics();
      prizeGraphic.lineStyle(2, 0x000000, 0.3);
      prizeGraphic.beginFill(prize.color);
      prizeGraphic.moveTo(0, 0);
      prizeGraphic.arc(0, 0, radius, startAngle, endAngle);
      prizeGraphic.lineTo(0, 0);
      prizeGraphic.closePath();
      prizeGraphic.endFill();

      const textRadius = radius * 0.65;
      const textX = textRadius * Math.cos(midAngle);
      const textY = textRadius * Math.sin(midAngle);

      const text = new PIXI.Text(prize.title, {
        fontSize: 16,
        fill: "white",
        fontFamily: "Arial",
      });
      text.anchor.set(0.5);
      text.position.set(textX, textY);
      text.angle = index * (360 / prizes.length) + 90;

      sectorGraphicsArray.push(prizeGraphic);
      barrelContainer.addChild(prizeGraphic, text);
    });

    const spinButton = createButton({
      x: CONFIG.wheelCenter.x,
      y: CONFIG.wheelCenter.y,
      width: CONFIG.spinButtonRadius * 2,
      height: CONFIG.spinButtonRadius * 2,
      shape: "circle",
      label: "RANDOM",
      fontSize: 13,
      onClick: () => randomClickButton(),
    });
    screen.addChild(spinButton);

    const numbersArray = Array.from(
      { length: prizes.length },
      (_, i) => i + 1
    );
    const buttonsArray = [];
    let stepCount = 0;

    const panel = CONFIG.buttonsPanel;
    const columns = prizes.length > 8 ? 2 : 1;
    const rows = Math.ceil(prizes.length / columns);
    const cellWidth = (panel.width - (columns - 1) * panel.gapX) / columns;
    const cellHeight = Math.min(
      54,
      (panel.height - (rows - 1) * panel.gapY) / rows
    );

    for (let i = 0; i < prizes.length; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = panel.x + cellWidth / 2 + col * (cellWidth + panel.gapX);
      const y = panel.y + cellHeight / 2 + row * (cellHeight + panel.gapY);

      const button = createButton({
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        label: `Sector ${i + 1}`,
        fontSize: cellHeight < 40 ? 13 : 16,
        onClick: () => handleClick(i + 1),
      });
      button.prizeIndex = i + 1;
      buttonsArray.push(button);
      screen.addChild(button);
    }

    function easeInOut(t) {
      return t < 0.5
        ? 4 * t * t * t
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function rotateBarrel() {
      const degreesToRotate = 1440 - (360 / prizes.length) * stepCount;
      const rotationInRadians = (Math.PI / 180) * degreesToRotate;
      const duration = CONFIG.spinDuration;

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
          initialRotation +
          (targetRotation - initialRotation) * easedProgress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          calculateWinning(numbersArray, prizes);
        }
      }

      requestAnimationFrame(animate);
    }

    function handleClick(buttonIndex) {
      if (isPlaying) return;

      isPlaying = true;

      const numberIndex = numbersArray.indexOf(buttonIndex);

      if (numberIndex !== -1) {
        stepCount = numberIndex;

        rotateBarrel();

        const removedNumbers = numbersArray.splice(0, numberIndex);
        numbersArray.push(...removedNumbers);
      }
    }

    function randomClickButton() {
      if (isPlaying) return;

      const randomIndex = Math.floor(Math.random() * buttonsArray.length);
      handleClick(buttonsArray[randomIndex].prizeIndex);
    }

    function calculateWinning(numbersArray, prizes) {
      const index = numbersArray[0] - 1;

      if (index < 0 || index >= prizes.length) return;

      const sector = sectorGraphicsArray[index];
      sector.tint = 0xff0000;

      const interval = setInterval(() => {
        sector.tint = sector.tint === 0xff0000 ? 0xffffff : 0xff0000;
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        sector.tint = 0xffffff;
        isPlaying = false;
      }, CONFIG.winFlashDuration);
    }
  }

  showMenu();
};
