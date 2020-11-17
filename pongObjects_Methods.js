// get canvas properties 
var cvs = document.getElementById("PongTable");
var ctx = cvs.getContext("2d");

//creates paddles with function as there is only one variable that is different (x)
function createPaddle(x){
    return {
        x:x,
        y:cvs.height/2 - 100/2,
        width:10,
        height:100,
        color:"WHITE",
        score: 0
    }
}
var userPad = createPaddle(0);
var aiPad = createPaddle(cvs.width - userPad.width)

//Create net 
var net = {
    x : cvs.width / 2 - 1, //drawn in middle of canvas width len, subtract 1, as each dash is a mini rectangle
    y : 0,
    width : 2,
    height : cvs.height,
    color : "WHITE"
}
//Ball start at middle of canvas relative to x and y
//Include starting speed == 5, then increase in velocity in x, y direction due to collision
//velocity = direction * speed
var ball = { 
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
function drawPaddle(x,y,w,h,color){
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

function drawTextscore(x, y, color, text){
    /*
        renders text score for game
        :param x: x coordinate of text score
        :param y: y coordinate of text score

        :return: if there is return 
    */
    ctx.fillStyle = color;
    ctx.font = "45px fantasy"; 
    ctx.fillText(text, x, y);
}
//Draws a straight line down the middle
function drawNet(){
    drawPaddle(net.x, net.y, net.width, net.height, net.color); 
};
//draw/Render all objects onto canvas
function render(){
    drawPaddle(0, 0, cvs.width, cvs.height, "BLACK");
    drawTextscore(cvs.width/4, cvs.height/5, "WHITE", userPad.score); //score for user
    drawTextscore(2*cvs.width/4 + 125, cvs.height/5, "WHITE", aiPad.score); //score for aiPad
    drawPaddle(userPad.x, userPad.y, userPad.width, userPad.height, userPad.color); //draw rectangle paddle for user
    drawPaddle(aiPad.x, aiPad.y, aiPad.width, aiPad.height, aiPad.color); //draw rectangle paddle for AI
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
    ball.velocityX *= -1
}
function updateBallPos(){
    ball.x += ball.velocityX; //Increments the ball x,y direction by 5 or by velocityX/Y; This will send the ball towards the bottom right 
    ball.y += ball.velocityY; //Think of bottom right as our +X, +Y 
}
//if bottom of ball (bally + ballrad) > heightofcanvas or if top of ball(bally - ballradius) < 0(top of canvas) 
//change of Y direction
function ballCanvascollision(){
    if(ball.y + ball.radius > cvs.height || ball.y - ball.radius < 0){ 
        ball.velocityY = -(ball.velocityY); 
    }
}
function ballPaddlecollision(){
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
}
//Without the aiDifficulty var, the aiPaddle will always be in the center of the ball, the aiPaddle will trail a little behind
//This can give the user a chance to score!
function updateAiDifficulty(){
    let aiDifficulty = 0.1;
    aiPad.y += (ball.y - (aiPad.y + aiPad.height/2)) * aiDifficulty;
}
//add 1 point to whoever scored the ball pass the other side!
function checkWhoScored(){
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
//Our game will constantly check and call the update functions to see if ...
//VelocityX,Y needs to be changed
//aiDifficulty change
//ball has collided into Canvas
//ball has collided into Paddle
//ball has passed the canvas which applies a score to either side
//once whoScored() is called, reset() will call and we startBall() again with ball facing opposite of winning side VelocityX *= -1
function update(){
    updateBallPos();
    updateAiDifficulty();
    ballCanvascollision();
    ballPaddlecollision();
    checkWhoScored();
}

function game(){
    update();
    render();
}
setInterval(game, 1000/50); // renders game 50 times every 1000 millisecond or 1 second
