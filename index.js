//imports
let Jimp = require('jimp');
var robot = require('robotjs'); //mouse mpvement
var fs = require('fs')
const sharp = require('sharp');
const { createWorker } = require("tesseract.js"); //read text from sc
const worker = createWorker({
    slogger: m => console.log(m)
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
    var x = 0, y = 155, width = 1883, height = 594;
    var img = robot.screen.capture(x, y, width, height);

    // make an array that contains colors of the trees we want to click on.
    // I'm targeting the brown colors of the trunks.
    var tree_colors = ["5a3c1b", "503619", "54381a", "705634", "634929", "574328"];

    // sample up to 500 random pixels inside our screenshot until we find one that matches
    // a tree color.
    for (var i = 0; i < 500; i++) {
        console.log
        var random_x = getRandomInt(0, width-1);
        var random_y = getRandomInt(0, height-1);
        var sample_color = img.colorAt(random_x, random_y);

        if (tree_colors.includes(sample_color)) {
            // because we took a cropped screenshot, and we want to return the pixel position
            // on the entire screen, we can account for that by adding the relative crop x and y
            // to the pixel position found in the screenshot;
            var screen_x = random_x + x;
            var screen_y = random_y + y;
            console.log(screen_x, screen_y)
            // if we don't confirm that this coordinate is a tree, the loop will continue
            if (confirmAction(screen_x, screen_y)) {
                console.log("Found a tree at: " + screen_x + ", " + screen_y + " color " + sample_color);
                return  {x: screen_x, y: screen_y};
            } else {
                // this just helps us debug the script
                console.log("Unconfirmed tree at: " + screen_x + ", " + screen_y + " color " + sample_color);
                
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
    if (imgtotext('test.bmp').conetent == "Chop Down Tree"){
        return true;
    }
}

// utility functions

function imgtotext(imgData){
    console.log("turning img to texts")
    const imgText = (async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(imgData);
        console.log(text);
        await worker.terminate();
        return text;
      })();
    return imgText;
}

function screenCaptureToFile(robotScreenPic, path) {
    return new Promise((resolve, reject) => {
        try {
            const image = new Jimp(robotScreenPic.width, robotScreenPic.height);
            let pos = 0;
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
                image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++);
                image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++);
                image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++);
                image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++);
            });
            image.resize(456,48,Jimp.RESIZE_BILINEAR)
            image.normalize();
            image.write(path, resolve);
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}

function sleep(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}