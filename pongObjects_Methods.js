class Pong { 
    constructor(aiDifficulty, ballSpeed){
        this._cvs = document.getElementById("Pong");
        this._ctx = this._cvs.getContext("2d");
        this._gameLoop = null;
        this._aiDifficulty = aiDifficulty
        this._ballSpeed = ballSpeed;
        //Difference between two Paddles is X position on Canvas
        this._user = new Paddle(0); 
        this._ai = new Paddle(this._cvs.width - this._user._width);
        //Speed === 5, shown in HTML pong class variable 
        this._ball = new Ball(this._ballSpeed); 
        //Difference between text display is X position on Canvas
        this._userScore = new Score((this._cvs.width/4));
        this._aiScore = new Score((2*(this._cvs.width/4) + 125));
    }

    drawCanvas(){
        this._ctx.fillStyle = "BLACK";
        this._ctx.fillRect(0,0,this._cvs.width, this._cvs.height);
    }

    drawNet(){
        this._ctx.fillStyle = "WHITE";
        this._ctx.fillRect(299, 0, 2, 400);
    }

    aiTracking() {
        this._ai._y += (this._ball._y - (this._ai._y + (this._ai._height/2))) * this._aiDifficulty;
    }

    ballPaddleCollisionLogic() {
        let person = (this._ball._x < (this._cvs.width/2)) ? this._user : this._ai; 

        if (this.checkBallHitPaddle(this._ball, person)){
            let collidePoint = this._ball._y - (person._y + (person._height/2));
            collidePoint /= (person._height/2);
            let angleRad = collidePoint * Math.PI/4;
            //checks bounce direction user === right bounce(1), ai === left bounce(-1)
            let direction = (person === this._user) ? 1 : -1;
            //changing direction based on paddle and changing angle
            this._ball._xVelocity = direction * this._ballSpeed * Math.cos(angleRad);
            this._ball._yVelocity = this._ballSpeed * Math.sin(angleRad);
            //increase ball speed everytime it hits the paddle (non static gameplay)
            this._ballSpeed += 0.5;
        }
    }

    checkBallHitPaddle(ball, person){
        var ballRadius = ball._radius;

        let bTop = ball._y - ballRadius;
        let bBottom = ball._y + ballRadius;
        let bLeft = ball._x - ballRadius;
        let bRight = ball._x + ballRadius;

        let pTop = person._y;
        let pBottom = person._y + person._height;
        let pLeft = person._x;
        let pRight = person._x + person._width;

        return bRight > pLeft && bBottom > pTop && bLeft < pRight && bTop < pBottom;
    }

    checkWhoScored(){
        if (this._ball._x - this._ball._radius < 0){
            this._aiScore._score++
            this.reset();
        }
        else if (this._ball._x + this._ball._radius > this._cvs.width){
            this._userScore._score++;
            this.reset();
        }
    }

    reset(){
        this._ball._x = this._cvs.width/2;
        this._ball._y = this._cvs.height/2;
        this._ballSpeed = 5;
        this._ball._xVelocity *= -1
    }

    render(){
        this.drawCanvas();
        this.drawNet();
        this._ai.drawPaddle()
        this._user.drawPaddle();
        this._ball.drawBall();
        this._userScore.drawTextScore();
        this._aiScore.drawTextScore();
    }

    update(){
        this._ball.updateBallPos();
        this._ball.ballCollisionOnCanvas();
        this.aiTracking();
        this.ballPaddleCollisionLogic();
        this.checkWhoScored();
    }

    runLoop(){
        this.update();
        this.render();
    }

    startGame(){
        /*
            calls from index.html using the pong class variable, starts game Loop

            :param this.gameLoop: Loops at framerate 1000/50 calls runLoop()
            :param function(self): takes in (self) param, where we will call (this) into the function
            :param return function(){self.runLoop()}: Without the return function our setInterval(this.runLoop,) will not execute correctly 
            as it is running an undefined function.
        */
        this.gameLoopId = setInterval(
            (function(self) {
                return function() {
                    self.runLoop();
                }
            })(this),(1000/50));
    }
}

class Paddle {
    constructor (x, y = 150, width = 10, height = 100, color = "WHITE"){
        this._cvs = document.getElementById("Pong");
        this._ctx = this._cvs.getContext("2d");
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._color = color;
    }

    drawPaddle(){
        this._ctx.fillStyle = this._color;
        this._ctx.fillRect(this._x,this._y,this._width,this._height)
    }
}

class Ball {
    constructor (speed, x = 300, y = 200, xVelocity = 5, yVelocity = 5, radius = 10, color = "WHITE"){
        this._cvs = document.getElementById("Pong");
        this._ctx = this._cvs.getContext("2d");
        this._x = x;
        this._y = y;
        this._speed = speed;
        this._xVelocity = xVelocity;
        this._yVelocity = yVelocity;
        this._radius = radius;
        this._color = color;
    }

    drawBall(){
        this._ctx.fillStyle = this._color;
        this._ctx.beginPath();
        this._ctx.arc(this._x, this._y, this._radius, 0, (Math.PI * 2), false);
        this._ctx.closePath();
        this._ctx.fill();
    }

    updateBallPos(){
        this._x += this._xVelocity;
        this._y += this._yVelocity;
    }

    ballCollisionOnCanvas(){
        if (this._y + this._radius > this._cvs.height || this._y - this._radius < 0){
            this._yVelocity *= -1;
        }
    }
}

class Score {
    constructor (x, y = 80, color = "WHITE", font = "45px fantasy", score = 0){
        this._cvs = document.getElementById("Pong");
        this._ctx = this._cvs.getContext("2d");
        this._x = x;
        this._y = y;
        this._color = color;
        this._font = font;
        this._score = score;
    }

    drawTextScore(){
        this._ctx.fillStyle = this._color;
        this._ctx.font = this._font;
        this._ctx.fillText(this._score, this._x, this._y);
    }
}
