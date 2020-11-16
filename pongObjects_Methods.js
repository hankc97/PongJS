// get canvas properties 
const cvs = document.getElementById("PongTable");
var ctx = cvs.getContext("2d");

// Create User Paddle
// x, y coordinates are used to start where the paddle will be drawn
//width, height is the size of paddle itself
const userPad = {
    x : 0, 
    y : cvs.height/2 - 100/2, //drawn starting from half of canvas height - half of paddle height == y
    width : 10, 
    height : 100, 
    color : "WHITE",
    score : 0  //User score starts at 0
}
//create aipaddle 
const aiPad = {
    x : cvs.width - userPad.width, //Drawn on the right side of board, must subtract from own width so its not drawn starting from edge of canvas
    y : cvs.height / 2 - 100 / 2, //same idea as userPad 
    width : 10,
    height : 100,
    color : "WHITE",
    score : 0
}

//Create net 
const net = {
    x : cvs.width / 2 - 1, //drawn in middle of canvas width len, subtract 1, as each dash is a mini rectangle
    y : 0,
    width : 2,
    height : 10,
    color : "WHITE"
}

//Ball start at middle of canvas relative to x and y
//Include starting speed == 5, then increase in velocity in x, y direction due to collision
//velocity = direction * speed
const ball = { 
    x : cvs.width / 2,
    y : cvs.height / 2,
    speed : 5,
    velocityX : 5, 
    velocityY: 5,
    radius : 10,
    color : "WHITE"
}
//Draw Rectangle takes in all 5 properties above
//x,y starting point of draw; w,h actual size of rect; 
function drawRectangle(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}
//Draw Circle
function drawCircle(x,y,rad,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,rad,0,Math.PI*2, false);
    ctx.closePath();
    ctx.fill()
};
//Draw TextScore
function drawTextscore(x, y, color, text){
    ctx.fillStyle = color;
    ctx.font = "45px fantasy"; 
    ctx.fillText(text, x, y);
}
//Draw the net using rectangles incremented every 15 pixels
function drawNet(){
    for (let i = 0; i <= cvs.height; i+=15){ // Instead of drawing each rectangle we can create a loop to draw at every 15th pixel for the total length of the canvas height
        drawRectangle(net.x, net.y + i, net.width, net.height, net.color); // Calls drawRect as net is just a line of smaller rectangles
    }
};
function render(){
    drawRectangle(0, 0, cvs.width, cvs.height, "BLACK");
    drawTextscore(cvs.width/4, cvs.height/5, "WHITE", userPad.score); //score for user
    drawTextscore(2*cvs.width/4 + 125, cvs.height/5, "WHITE", aiPad.score); //score for aiPad
    drawRectangle(userPad.x, userPad.y, userPad.width, userPad.height, userPad.color); //draw rectangle paddle for user
    drawRectangle(aiPad.x, aiPad.y, aiPad.width, aiPad.height, aiPad.color); //draw rectangle paddle for AI
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    drawNet();
}
//change of X direction
function collision(ball, paddle){
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius; //4 points of contact is measured at the top, bottom, left, right (there is no contact at an angle)

    paddle.top = paddle.y
    paddle.bottom = paddle.y + paddle.height;
    paddle.left = paddle.x;
    paddle.right = paddle.x + paddle.width;

    return ball.right > paddle.left && ball.bottom > paddle.top && ball.left < paddle.right && ball.top < paddle.bottom; //return true is all conditions are met
}
function reset(){
    ball.x = cvs.width/2;
    ball.y = cvs.height/2;

    ball.speed = 5;
// we only need to change the velocityX direction, i.e if user loses it means initially the ball was moving left 
// so we start the ball moving right, vice versa
    ball.velocityX = -ball.velocityX 
}
function update(){
    ball.x += ball.velocityX; //Increments the ball x,y direction by 5 or by velocityX/Y; This will send the ball towards the bottom right 
    ball.y += ball.velocityY; //Think of bottom right as our +X, +Y 

    //Without the aiDifficulty var, the aiPaddle will always be in the center of the ball, the aiPaddle will trail a little behind
    //This can give the user a chance to score!
    let aiDifficulty = 0.1;
    aiPad.y += (ball.y - (aiPad.y + aiPad.height/2)) * aiDifficulty;

    //if bottom of ball (bally + ballrad) > heightofcanvas or if top of ball(bally - ballradius) < 0(top of canvas) 
    //change of Y direction
    if(ball.y + ball.radius > cvs.height || ball.y - ball.radius < 0){ 
        ball.velocityY = -(ball.velocityY); 
    }
    //checks which paddle was hit ? userPaddle or aiPaddle
    let paddlehit = (ball.x < cvs.width/2) ? userPad : aiPad; 

    //if collision return True, its a collision on the paddle and X direction according to (speed, angle, direction and velocity)
    if(collision(ball, paddlehit)){
        let collidePoint = ball.y - (paddlehit.y + paddlehit.height/2);

        collidePoint = collidePoint/(paddlehit.height/2);

        let angleRad = collidePoint * Math.PI/4;

        let direction = (ball.x < cvs.width/2) ? 1 : -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        //increase ball speed everytime it hits the paddle 
        ball.speed += 0.5;
    }
    if (ball.x - ball.radius < 0){ //ai scores
        aiPad.score++;
        reset();

    } else if (ball.x + ball.radius > cvs.width){ //user scores
        userPad.score++;
        reset();
    }
}
//Controling User Paddle using Mouse at the center of paddle
cvs.addEventListener("mousemove", movePaddle);
function movePaddle(evt){
    let rect = cvs.getBoundingClientRect();
    userPad.y = evt.clientY - rect.top - userPad.height/2;
}
function game(){
    update();
    render();
}
setInterval(game, 1000/50); // renders game 50 times every 1000 millisecond or 1 second
