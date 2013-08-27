/* My Breakout clone */



//////////////////////////////////////////////////////
/*                                                  */
/*                    VARIABLES                     */
/*                                                  */
//////////////////////////////////////////////////////

var GAMEBOARD = document.getElementById("gameboard");
var ctx = GAMEBOARD.getContext("2d");

var touchable = 'createTouch' in document;
var touchX = GAMEBOARD.width/2; //tracks where touch is on the x axis. The initial value is for intializing the paddle.

var gameState = "game";  //determines game state to switch between menus etc.

//defines ball speed
var SPEEDX = 2;
var SPEEDY = 4;

//defines paddle movement speed
var PADDLERATE = 20;



//////////////////////////////////////////////////////
/*                                                  */
/*                FUNCTION LIBRARY                  */
/*                                                  */
//////////////////////////////////////////////////////

//shim for requesting animation frames from the browser
window.requestAnimFrame = (function(){
  return   window.requestAnimationFrame   ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();

//function that checks if two rectangles overlap, for use in collision detection
function collision(r1, r2) {
    return !(r2.left > r1.right
        || r2.right < r1.left
        || r2.top > r1.bottom
        || r2.bottom < r1.top);
}

//Paddle object
function paddle() {
    
    //initializes paddle
    this.init = function() {
        //defines initial paddle coordinates
        this.x = GAMEBOARD.width/2;
        this.y = 285;
        
        //defines width and height of paddle
        this.width = 75;
        this.height = 15;
        
        //defines bounding box of paddle, for collision detection
        this.left = this.x;  
        this.top = this.y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
    };
    
    //draws paddle
    this.draw = function() {
        
        //Clear current image of paddle
        ctx.clearRect(this.x-2,this.y-2,this.width+4,this.height+4);
        
        if (touchable) {  //determines location of paddle, for touch devices
            this.x = touchX;
        }
        
        //Sets bounding box of paddle, for collision detection
        this.left = this.x;  
        this.top = this.y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        
        //Draw paddle
        ctx.fillStyle = "red";  //draw ball
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        
        ctx.fill();
        ctx.stroke();
    };
    
    this.moveLeft = function() {
        ctx.clearRect(this.x-2,this.y-2,this.width+4,this.height+4);
        this.x -= PADDLERATE;
        if (this.left < 0) { this.x += PADDLERATE }
    };
    
    this.moveRight = function() {
        ctx.clearRect(this.x-2,this.y-2,this.width+4,this.height+4);
        this.x += PADDLERATE;
        if (this.right > GAMEBOARD.width) { this.x -= PADDLERATE }
    };
    
}

//Ball object
function ball() {
    
    //initializes ball at coordinates x,y
    this.init = function init(x,y) {
        //defines ball coordinates
        this.x = x;
        this.y = y;
        
        //defines which direction the ball is moving
        this.dX = true;      //if true, it's going right
        this.dY = false;     //if true, it's going down
        
        //defines bounding box of ball, for collision detection
        this.left = this.x - 7; 
        this.top = this.y - 7;
        this.right = this.left +14;
        this.bottom = this.top + 14;    
    };
    
    
    this.draw = function() {
        //Sets bounding box of ball, for collision detection
        this.left = this.x - 7;  
        this.top = this.y - 7;
        this.right = this.left +14;
        this.bottom = this.top +14;
        
        //Clear current image of ball
        ctx.clearRect(this.left,this.top,14,14); 
        
        //Checks if you lost
        if (this.y > GAMEBOARD.height) {
            this.dY = !this.dY;
            this.x = 150;
            this.y = 50;
        }
        
        //If ball hits something, reverse direction
        if (this.checkHitX() === true) {  
            this.dX = !this.dX;
        }
        if (this.checkHitY() === true) {  
            this.dY = !this.dY;
        }
        
        //Moves ball
        if (this.dX === true) {  //remember: if true it's going right
            this.x += SPEEDX;    
        }
        else if (this.dX === false) {
            this.x -= SPEEDX;
        }
        if (this.dY === false) {  //remember: if true it's going down
            this.y -= SPEEDY;    
        }
        else if (this.dY === true) {
            this.y += SPEEDY;
        }
    
        //Draws ball
        ctx.fillStyle = "silver";  //draw ball
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
    };
    
    //checks if ball hit anything on y axis
    this.checkHitY = function() {
        if (this.dY === false && this.y <= 0 ) {
            return true;
        }
        else if (collision(this, paddle)) {
            return true;
        }
        else {
            return false;
        }    
    };
    
    //checks if the ball hit anything on X axis
    this.checkHitX = function() {
        if (this.dX === true && this.x >= GAMEBOARD.width ) {
            return true;
        }
        else if (this.dX === false && this.x <= 0 ) {
            return true;
        }
        else if (collision(this, paddle)) {
            this.y = paddle.top - 5; //to try counteract the glitch where the ball gets stuck inside the paddle
            if (this.dX === false) {
                if (this.x > (paddle.right - (paddle.width/2))) {
                    return true;   
                }
                else {
                    return false;
                }
            }
            else if (this.dX === true) {
                if (this.x < (paddle.right - (paddle.width/2))) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        else {
            return false;
        }
    };
}



//////////////////////////////////////////////////////
/*                                                  */
/*                 INPUT LISTENERS                  */
/*                                                  */
//////////////////////////////////////////////////////

//Keyboard listener
document.addEventListener('keydown', function(event) {
    
    if (gameState === "game") {
        if (event.keyCode == 37) {
            // Left
            paddle.moveLeft();
        }
    
        else if (event.keyCode == 39) {
            // Right
            paddle.moveRight();
        }
    
        else if (event.keyCode == 40) {
            // Down
        }
    
        else if (event.keyCode == 38) {
            // Up
        }
            
        if (event.keyCode == 32) {
            // Spacebar
        }
            
        if (event.keyCode == 90) {
            // 'Z' key
        }
    }
        
}, false);


//Mouse listener
GAMEBOARD.addEventListener( 'mousemove', onMouseMove, false );

var mouseX, mouseY;

function onMouseMove(event) {
	mouseX = event.offsetX;
	mouseY = event.offsetY;
	
	ctx.clearRect(paddle.x-2,paddle.y-2,paddle.width+4,paddle.height+4);

    paddle.x = mouseX-(paddle.width/2);

}

//Touch listener
if(touchable) {
    document.addEventListener( 'touchstart', onTouchStart, false );
	document.addEventListener( 'touchmove', onTouchMove, false );
	document.addEventListener( 'touchend', onTouchEnd, false );
}

function onTouchStart(event) {
    event.preventDefault();
    
    var touch = event.touches[0]; 
    
    //ctx.clearRect(paddle.x-2,paddle.y-2,paddle.width+4,paddle.height+4);    
    //paddle.x = touch.pageX;
    
}

function onTouchMove(event) {
     // Prevent the browser from doing its default thing (scroll, zoom)
	event.preventDefault(); 
    
    var touch = event.touches[0]; 
    
    touchX = touch.pageX;
    
} 

function onTouchEnd(event) { 
    
}



//////////////////////////////////////////////////////
/*                                                  */
/*                 MAIN GAME LOOP                   */
/*                                                  */
//////////////////////////////////////////////////////

//Main game loop
function main() {

    switch (gameState) {
        case "game": 
            ball.draw();
            paddle.draw();
            break;
    }
    
    requestAnimFrame(function() {  //request new frame of animation
        main();
    });
}

//Starts game
var paddle = new paddle();
paddle.init();

var ball = new ball();
ball.init(150,50);

main();







