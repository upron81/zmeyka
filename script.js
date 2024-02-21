let appleCount = 0;
let isLose = false;

function configurationCanvas() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return context
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; // Округление до ближайшего целого числа
}


async function main() {
  const dialog = document.getElementById("dialog");
  const button = document.getElementById("button")
  const title = document.getElementById("title")
  const text = document.getElementById("text")
  const input = document.getElementById("input")

  function waitEndPrelude() {
    return new Promise(resolve => {
      if (localStorage.getItem('user_name') === null) {
        dialog.style.display = "flex"
        button.addEventListener('click', () => {
          button.removeEventListener('click', this)
          title.textContent = "Как вас зовут";
          text.style.display = "none"
          input.style.display = "block"
          localStorage.setItem("user_name", input.value)
          button.addEventListener('click', () => {
            button.removeEventListener('click', this)
            input.style.display = "none"
            title.textContent = "Правила игры"
            text.style.display = "block"
            text.textContent = "Привет, " + localStorage.getItem("user_name") + ". Вы должны управлять змеей на клавиши WASD. Врезание в стену или в самого себя защитывается за поражение. Удачи"
            button.addEventListener('click', () => {
              button.removeEventListener('click', this)
              dialog.style.display = "none"
              localStorage.setItem("apple", "0")
              resolve()
            })
          })
        });
      } else {
        resolve();
      }
    });
  }
  waitEndPrelude().then(game);
}

function lose() {
  if (isLose === false) {
    isLose = true;
    const dialog = document.getElementById("dialog");
    const button = document.getElementById("button")
    const title = document.getElementById("title")
    const text = document.getElementById("text")
    const input = document.getElementById("input")
    if (appleCount > parseInt(localStorage.getItem('apple'))) {
      localStorage.setItem('apple', appleCount.toString())
    }
    dialog.style.display = "flex"
    title.textContent = "Вы проиграли"
    text.textContent = "Счёт: " + appleCount.toString() + ". Лучший счёт у " + localStorage.getItem("user_name") + ": " + localStorage.getItem('apple')
    button.textContent = "Начать заново"
    button.addEventListener('click', () => {
      button.removeEventListener('click', this)
      dialog.style.display = "none"
      location.reload()
    })
  }
}

function game() {
  const ctx = configurationCanvas();
  const blockSize = 70;
  const height = (window.innerHeight - (window.innerHeight % blockSize)) / blockSize;
  const width = (window.innerWidth - (window.innerWidth % blockSize)) / blockSize;
  
  const dashBoard = [];
  for (let i=0; i<height; i++) {
    dashBoard.push([]);
    for (let j=0; j<width; j++) {
      dashBoard[i].push({
        color: "white",
      });
    }
  }

  dashBoard[1][1].color = "green"
  dashBoard[3][5].color = "green"

  function updateDashBoard() {
    for (let line in dashBoard) {
      for (let block in dashBoard[line]) {
        dashBoard[line][block].color = "white"
      }
    }
    for (let block of snake.body) {
      dashBoard[block[0]][block[1]].color = "green"
    }
    dashBoard[apple.position[0]][apple.position[1]].color = "red"
  }

  function drawDashBoard() {
    for (let line in dashBoard) {
      for (let block in dashBoard[line]) {
        if (dashBoard[line][block].color == "white") {
          ctx.clearRect(block*blockSize, line*blockSize, blockSize, blockSize);
        } else if (dashBoard[line][block].color == "green") {
          ctx.fillStyle = "green";
          ctx.fillRect(block*blockSize, line*blockSize, blockSize, blockSize);
        } else if (dashBoard[line][block].color == "red") {
          ctx.fillStyle = "red";
          ctx.fillRect(block*blockSize, line*blockSize, blockSize, blockSize);
        }
      }
    }
  }

  const snake = {
    head: [1,1],
    body: [[1,1],],
    length: 1,
    direction: 1, // 1 = right, 2 = bottom, 3 = left, 4 = top
  };

  const apple = {
    position: [3,5]
  }

  function randomApple() {
    let randomX = getRandomInt(0, width);
    let randomY = getRandomInt(0, height);

    let is_on_snake = false
    for (let block of snake.body) {
      if (block[0] == randomY && block[1] == randomX) {
        is_on_snake = true
      }
    }
    if (is_on_snake) {
      randomApple()
    } else {
      apple.position = [randomY, randomX]
    }
  }


  function nextBlockForDiration() {
    switch(snake.direction) {
      case 1:
        return [snake.head[0], snake.head[1]+1]
      case 2:
        return [snake.head[0]+1, snake.head[1]]
      case 3:
        return [snake.head[0], snake.head[1]-1]
      case 4:
        return [snake.head[0]-1, snake.head[1]]
    }
  }

  function step() {
    const nextBlock = nextBlockForDiration();

    if ((nextBlock[0]<0) || (nextBlock[0]>=height)
      || (nextBlock[1]<0) || (nextBlock[1]>=width)) {
      return lose();
    }
    for (let block of snake.body) {
      if (nextBlock.toString() == block.toString()) {
        return lose();
      }
    }

    snake.body.push(Array.from(nextBlock));
    snake.head = Array.from(nextBlock);

    if (nextBlock.toString() == apple.position.toString()) {
      randomApple();
      appleCount++;
      snake.length++;
      timeInterval *= 0.97
      clearInterval(stepController)
      stepController = setInterval(step, timeInterval)
    } else {
      snake.body.shift();
    }

    updateDashBoard();
    drawDashBoard();
  }

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case 'w':
        if (!((snake.body.length > 1) && (snake.body.at(-1)[0]-snake.body.at(-2)[0] === 1)))
          snake.direction = 4
        break;
      case 'd':
        if (!((snake.body.length > 1) && (snake.body.at(-1)[1]-snake.body.at(-2)[1] === -1)))
          snake.direction = 1
        break;
      case 's':
        if (!((snake.body.length > 1) && (snake.body.at(-1)[0]-snake.body.at(-2)[0] === -1)))
        snake.direction = 2
        break;
      case 'a':
        if (!((snake.body.length > 1) && (snake.body.at(-1)[1]-snake.body.at(-2)[1] === 1)))
        snake.direction = 3
        break;
    }
  })

  let timeInterval = 120
  let stepController = setInterval(step, timeInterval);
}


main();