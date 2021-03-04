//imports
var robot = require('robotjs'); //mouse mpvement
var fs = require('fs')
const { createWorker } = require("tesseract.js"); //read text from sc
const worker = createWorker({
    slogger: m => console.log(m)
});

main();

function main(){
    console.log("Starting");
    ScreenCapture();
    console.log("Cofirming Action")
    confirmAction();

}

//screen_x, screen_y
function confirmAction() {
    // first move the mouse to the given coordinates
    //robot.moveMouse(screen_x, screen_y);
    // wait a moment for the help text to appear
    //sleep(300);

    //tesseract worker loded with langagua option
    // now check the action text
    var ActionIMG = ScreenCapture(0, 0, 232, 21);
    var img = ActionIMG.image;
    console.log("Buffering img");
    var ImgBuffer = Buffer.from(ActionIMG.image, 'base64');
    fs.writeFile("test.jpg", ImgBuffer, function(err) { });
    console.log("loading worker and reading text" + ImgBuffer);
      (async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize();
        console.log(text);
        await worker.terminate();
      })();
}

// utility functions

function sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// testing functions

function ScreenCapture(x, y, Width, Hight) {
    // taking a screenshot
    var img = robot.screen.capture(x, y, Width, Hight);

    return img;
}