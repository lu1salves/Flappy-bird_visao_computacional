const gameHeight = 800;
const gameWidth = 900;
const groundHeight = 112;
const pipeWidth = 52;
const pipeUpperHeight = 270;
const pipeLowerHeight = 242;
const birdWidth = 34
const birdHeight = 34


const GameParamters = {
    heightLimit: gameHeight - groundHeight,  
    bird: {
        initialHeight: 200,  
        heightRange: {  
            min: 0,
            max: gameHeight - groundHeight
        },
        width: birdWidth,
        height: birdHeight
    },
    pipings: {
        timeInterval: 1600*2, 
        speed: 5000,  
        shiftRange: {  
            x: {
                min: 0,  
                max: gameWidth + pipeWidth,  
            },
            y: {  
                min: 40,  
                max: pipeLowerHeight,  
            },
        },
        gap: (gameHeight - groundHeight) - pipeLowerHeight,
        interactionX: {
            head: (gameWidth - birdWidth) / 2,  
            end: (gameWidth - birdWidth) / 2 + pipeWidth + birdWidth  
        }
    }
}
export default GameParamters