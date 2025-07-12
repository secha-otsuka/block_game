const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ball properties
const ballRadius = 10;
let balls = []; // Array to hold all ball objects

// Paddle properties
const paddleHeight = 10;
let paddleWidth = 75; // Can be changed by items
let paddleX = (canvas.width - paddleWidth) / 2;

// Control properties
let rightPressed = false;
let leftPressed = false;

// Brick properties
let brickRowCount = 3;
let brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Game state
let score = 0;
let lives = 3;
let level = 1;

// Item properties
const itemRadius = 8;
let items = []; // Array to hold all item objects
const itemTypes = {
    PADDLE_LONG: { color: '#f4e842', effect: 'paddle_long', symbol: 'L' },
    BALL_SLOW: { color: '#42f4a1', effect: 'ball_slow', symbol: 'S' },
    EXTRA_BALL: { color: '#f44242', effect: 'extra_ball', symbol: '+' }
};

let bricks = [];

function initLevel() {
    // Increase bricks with levels, but cap it
    brickRowCount = Math.min(3 + level - 1, 8);
    brickColumnCount = Math.min(5 + level - 1, 10);
    
    // Clear existing bricks and items
    bricks = [];
    items = [];

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    resetBallAndPaddle();
}

function resetBallAndPaddle() {
    // Create the first ball
    balls = [{
        x: canvas.width / 2,
        y: canvas.height - 50, // Start a bit higher
        dx: 2 + (level * 0.2), // Increase speed with level
        dy: -(2 + (level * 0.2)),
        status: 1
    }];
    paddleX = (canvas.width - paddleWidth) / 2;
}

// Event Listeners
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key == 'Right' || e.key == 'ArrowRight') rightPressed = true;
    else if (e.key == 'Left' || e.key == 'ArrowLeft') leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key == 'Right' || e.key == 'ArrowRight') rightPressed = false;
    else if (e.key == 'Left' || e.key == 'ArrowLeft') leftPressed = false;
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > paddleWidth / 2 && relativeX < canvas.width - paddleWidth / 2) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// --- Collision Detection ---
function brickCollision() {
    let bricksLeft = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                let hit = false;
                balls.forEach(ball => {
                    if (ball.status === 1 && ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        hit = true;
                    }
                });

                if (hit) {
                    b.status = 0;
                    score++;
                    // Chance to drop an item
                    if (Math.random() < 0.25) { // 25% chance
                        spawnItem(b.x + brickWidth / 2, b.y + brickHeight / 2);
                    }
                } else {
                    bricksLeft++;
                }
            }
        }
    }
    // Check for level up
    if (bricksLeft === 0) {
        level++;
        lives++; // Bonus life
        alert(`LEVEL CLEARED! Starting Level ${level}`);
        initLevel();
    }
}

function itemCollision() {
    items.forEach((item) => {
        if (item.status === 1) {
            // Check paddle collision
            if (item.x > paddleX && item.x < paddleX + paddleWidth && item.y + itemRadius > canvas.height - paddleHeight && item.y < canvas.height) {
                applyItemEffect(item.type);
                item.status = 0; // Deactivate item
            }
            // Check if item is off-screen
            if (item.y > canvas.height) {
                item.status = 0;
            }
        }
    });
    // Clean up inactive items
    items = items.filter(item => item.status === 1);
}

// --- Item Logic ---
function spawnItem(x, y) {
    const itemKeys = Object.keys(itemTypes);
    const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
    const type = itemTypes[randomKey];
    items.push({ x: x, y: y, dy: 2, status: 1, type: type });
}

function applyItemEffect(type) {
    switch (type.effect) {
        case 'paddle_long':
            if (paddleWidth < 150) { // Max width
                paddleWidth += 35;
                setTimeout(() => { paddleWidth -= 35; }, 10000); // Effect lasts 10 seconds
            }
            break;
        case 'ball_slow':
            balls.forEach(ball => {
                ball.dx *= 0.6;
                ball.dy *= 0.6;
            });
            setTimeout(() => {
                balls.forEach(ball => {
                    ball.dx /= 0.6;
                    ball.dy /= 0.6;
                });
            }, 8000); // Effect lasts 8 seconds
            break;
        case 'extra_ball':
            if (balls.length < 5) { // Max 5 balls
                const newBallDx = (Math.random() - 0.5) * 4; // Random horizontal direction
                balls.push({
                    x: paddleX + paddleWidth / 2,
                    y: canvas.height - paddleHeight - ballRadius,
                    dx: newBallDx,
                    dy: -(2 + (level * 0.2)),
                    status: 1
                });
            }
            break;
    }
}

// --- Drawing Functions ---
function drawBalls() {
    balls.forEach(ball => {
        if (ball.status === 1) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.closePath();
        }
    });
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = `hsl(${(c * 360 / brickColumnCount) + (r * 20)}, 80%, 50%)`;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawItems() {
    items.forEach(item => {
        if (item.status === 1) {
            ctx.beginPath();
            ctx.arc(item.x, item.y, itemRadius, 0, Math.PI * 2);
            ctx.fillStyle = item.type.color;
            ctx.fill();
            ctx.closePath();
            // Draw symbol
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.type.symbol, item.x, item.y);
        }
    });
}

function drawUI() {
    ctx.font = '16px "Monaco", "Consolas", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Score: ' + score, 8, 10);
    ctx.textAlign = 'right';
    ctx.fillText('Lives: ' + lives, canvas.width - 8, 10);
    ctx.textAlign = 'center';
    ctx.fillText('Level: ' + level, canvas.width / 2, 10);
}

// --- Main Game Loop ---
function update() {
    // Move Paddle
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // Move Items
    items.forEach(item => {
        if (item.status === 1) {
            item.y += item.dy;
        }
    });

    // Move Balls
    balls.forEach(ball => {
        if (ball.status !== 1) return;

        // Wall collision (left/right)
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        // Wall collision (top)
        if (ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        }
        // Wall collision (bottom)
        else if (ball.y + ball.dy > canvas.height - ballRadius) {
            // Paddle collision
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
                // Add slight angle based on where it hits the paddle
                let collidePoint = ball.x - (paddleX + paddleWidth / 2);
                ball.dx = collidePoint * 0.1;
            } else {
                ball.status = 0; // Deactivate ball
            }
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    });

    // Check if any balls are left
    const activeBalls = balls.filter(ball => ball.status === 1);
    if (activeBalls.length === 0) {
        lives--;
        if (!lives) {
            alert('GAME OVER\nFinal Score: ' + score);
            document.location.reload();
        } else {
            resetBallAndPaddle();
        }
    }
    // Re-assign the balls array to only include active ones
    balls = balls.filter(ball => ball.status === 1);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawItems();
    drawBalls();
    drawUI();
    
    brickCollision();
    itemCollision();
    update();

    requestAnimationFrame(draw);
}

// --- Start Game ---
initLevel();
draw();