document.addEventListener("DOMContentLoaded", () => {
  const draggables = document.querySelectorAll(".draggable");
  const gameZone = document.getElementById("game-zone");
  const congratsMessage = document.getElementById("congrats-message");

  let selectedElement = null;
  let offsetX, offsetY;
  let isRotating = false;

  draggables.forEach((element) => {
    // Добавляем случайное вращение при загрузке
    element.style.transform = `rotate(${Math.random() * 360}deg)`;

    element.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        isRotating = true;
        selectedElement = element;
      } else {
        selectedElement = element;
        offsetX = e.clientX - selectedElement.offsetLeft;
        offsetY = e.clientY - selectedElement.offsetTop;
        element.style.cursor = "grabbing";
      }
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (selectedElement) {
      if (isRotating) {
        const rect = selectedElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        selectedElement.style.transform = `rotate(${angle}deg)`;
      } else {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        // Ограничиваем передвижение внутри игровой зоны
        if (
          x >= 0 &&
          y >= 0 &&
          x <= gameZone.offsetWidth - selectedElement.offsetWidth &&
          y <= gameZone.offsetHeight - selectedElement.offsetHeight
        ) {
          selectedElement.style.left = `${x}px`;
          selectedElement.style.top = `${y}px`;
        }
      }
    }
  });

  document.addEventListener("mouseup", () => {
    if (selectedElement) {
      selectedElement.style.cursor = "grab";
      selectedElement = null;
      isRotating = false;

      // Проверяем условия после каждого движения
      checkWinCondition();
    }
  });

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  function checkWinCondition() {
    const TOLERANCE = 30; // Допуск для проверки перекрытия
    const HORIZONTAL_TOLERANCE = 40; // Допуск для выравнивания по центру

    const treeElements = {
      small: document.querySelector(".small-triangle"),
      medium: document.querySelector(".medium-triangle"),
      large: document.querySelector(".large-triangle"),
      trunk: document.querySelector(".tree-trunk"),
    };

    const houseElements = {
      square: document.querySelector(".house-square"),
      roof: document.querySelector(".roof"),
      window: document.querySelector(".window"),
    };

    // Проверка ёлки
    const treeValid = checkTree(treeElements, TOLERANCE, HORIZONTAL_TOLERANCE);

    // Проверка домика
    const houseValid = checkHouse(houseElements, TOLERANCE, HORIZONTAL_TOLERANCE);

    // Победа, если собраны обе фигуры
    if (treeValid && houseValid) {
      congratsMessage.style.display = "block";
    }
  }

  function checkTree(treeElements, tolerance, horizontalTolerance) {
    const { small, medium, large, trunk } = treeElements;
    if (!small || !medium || !large || !trunk) return false;

    const smallRect = small.getBoundingClientRect();
    const mediumRect = medium.getBoundingClientRect();
    const largeRect = large.getBoundingClientRect();
    const trunkRect = trunk.getBoundingClientRect();

    return (
      isOverlapping(smallRect, mediumRect, tolerance) &&
      isOverlapping(mediumRect, largeRect, tolerance) &&
      isOverlapping(largeRect, trunkRect, tolerance) &&
      isAlignedHorizontally(smallRect, mediumRect, horizontalTolerance) &&
      isAlignedHorizontally(mediumRect, largeRect, horizontalTolerance) &&
      isAlignedHorizontally(largeRect, trunkRect, horizontalTolerance)
    );
  }

  function checkHouse(houseElements, tolerance, horizontalTolerance) {
    const { square, roof, window } = houseElements;
    if (!square || !roof || !window) return false;

    const squareRect = square.getBoundingClientRect();
    const roofRect = roof.getBoundingClientRect();
    const windowRect = window.getBoundingClientRect();

    return (
      isOverlapping(roofRect, squareRect, tolerance) &&
      isContained(windowRect, squareRect, tolerance) &&
      isAlignedHorizontally(roofRect, squareRect, horizontalTolerance) &&
      isAlignedHorizontally(windowRect, squareRect, horizontalTolerance)
    );
  }

  function isOverlapping(rect1, rect2, tolerance) {
    return (
      rect1.bottom - tolerance <= rect2.top &&
      rect1.bottom + tolerance >= rect2.top
    );
  }

  function isContained(innerRect, outerRect, tolerance) {
    return (
      innerRect.top >= outerRect.top - tolerance &&
      innerRect.bottom <= outerRect.bottom + tolerance &&
      innerRect.left >= outerRect.left - tolerance &&
      innerRect.right <= outerRect.right + tolerance
    );
  }

  function isAlignedHorizontally(rect1, rect2, tolerance) {
    const center1 = rect1.left + rect1.width / 2;
    const center2 = rect2.left + rect2.width / 2;
    return Math.abs(center1 - center2) <= tolerance;
  }
});
