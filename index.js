//imports
let Jimp = require('jimp');
var robot = require('robotjs'); //mouse mpvement
const { createWorker } = require("tesseract.js"); //read text from sc
const worker = createWorker({
    slogger: m => console.log(m),
    err: e => console.error(e),
});

main();

function main(){
    console.log("Starting");
    sleep(2000)

    while (true) {
        var tree = findTree();

        if (tree == false) {
            rotateCamera();
            continue;
        }

        // chop down the tree we found
        robot.moveMouse(tree.x, tree.y);
        robot.mouseClick();
        // wait for walking and chopping to complete.
        // dropLogs() will wait for longer if needed
    }

}

function findTree() {
    // take a screenshot from just the middle of our screen.
    // I have the upper left corner of the image starting at x = 300, y = 300, and size of
    // the image at width = 1300, height = 400.
    // you should adjust this to your own screen size. you might also try reducing the size
    // if this is running slow for you.
    var x = 0, y = 0, width = 1920, height = 1080;
    var img = robot.screen.capture(x, y, width, height);
    console.log(img.width, img.height);

    // make an array that contains colors of the trees we want to click on.
    // I'm targeting the brown colors of the trunks.
    var tree_colors = ["6b4e2b", "604626", "634928", "573f22", "674429", "574328","5c4425","604627","634928","664b2a","694e2b"];

    // 
    // a tree color.
    const RADIUS_INCREMENT = 50;
    var n = 4;
    for(n =4; n < 9; n++){ 
        for (var r = 0; r < Math.min(width / 2, height / 2); r += RADIUS_INCREMENT) {
            for (var theta = 0; theta < 2 * Math.PI; theta += Math.PI / (n)) {
                x = r * Math.cos(theta);
                y = r * Math.sin(theta);
                console.log("Coords are (" + Math.floor(x) + ", " + Math.floor(y) + ") relative to the center")
                screenX = Math.floor(x + width / 2);
                screenY = Math.floor(y + height / 2);

                console.log("Absolute coords are (" + screenX + ", " + screenY + ")")
                var sample_color = img.colorAt(screenX, screenY);
                if(tree_colors.includes(sample_color)){
                    if (confirmAction(screenX, screenY)) {
                        return  {x:screenX, y:screenY};
                    }
                    else{
                        console.log("unconfermd tree at" + screenX, screenY);
                    }
                }
                if (r == 0) { break; }

            }
        }
    }
    return false;
}

function rotateCamera() {
    console.log("Rotating camera");
    robot.keyToggle('right', 'down');
    sleep(1000);
    robot.keyToggle('right', 'up');
}

function confirmAction(screen_x, screen_y) {
    // first move the mouse to the given coordinates
    robot.moveMouse(screen_x, screen_y);
    // wait a moment for the help text to appear
    sleep(300);

    //tesseract worker loded with langagua option
    // now check the action text
    var ActionIMG = robot.screen.capture(4, 4, 228, 16);
    screenCaptureToFile(ActionIMG, 'test.bmp')
    console.log("loading worker and reading text");
}

// utility functions

async function imgtotext(imgData){
    console.log("turning img to texts")
    console.log("loading img prossesor");
    await worker.load(); 
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imgData);
    console.log(text);
    await worker.terminate();
    console.log("text loaded");
    return text;
}

function screenCaptureToFile(robotScreenPic, path) {
        try {
            const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
            let pos = 0;
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++);
                image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++);
                image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++);
                image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++);
            });
            image.write(path, resolve);
        } catch (e) {
            console.error(e);
            reject(e);
        }
}

function sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}