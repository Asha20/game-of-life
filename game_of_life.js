var symbolMap = {
    " ": false,
    "o": true
}

function generateEmptyMap(width, height) {
    width = width > maxSize ? maxSize : width;
    height = height > maxSize ? maxSize : height;

    var result = "";
    for (var y = 0; y < (height || width); y++) {
        var row = "";
        for (var x = 0; x < width; x++) {
            row += "x";
        }
        result += row + ",";
    }
    // Removes the last ","
    return result.slice(0, result.length - 1);
}

function makeElement(element, attributes) {
    var result = document.createElement(element);
    for (var attr in attributes)
        result.setAttribute(attr, attributes[attr]);
    return result;
}

function getElementByClass(className) {
    return document.getElementsByClassName(className)[0];
}

function Cell(alive, x, y, grid) {
    this.alive = alive;
    this.x = x;
    this.y = y;
    this.grid = grid;
}

Cell.prototype.getNeighborCount = function() {
    var neighborCount = 0;

    var positions = [
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1]
    ];

    for (var i = 0; i < positions.length; i++) {
        var newX = this.x + positions[i][0];
        var newY = this.y + positions[i][1];

        var neighbor = this.grid.cellAt(newX, newY);
        if (neighbor !== null && neighbor.alive) {
           neighborCount++;
        }
    }

    return neighborCount;
}

Cell.prototype.update = function() {
    var newState = this.alive;
    if (this.alive) {
        if (this.neighborCount < 2 || this.neighborCount > 3) {
            newState = false;
        }
    }
    else if (!this.alive && this.neighborCount == 3) {
        newState = true;
    }

    return new Cell(newState, this.x, this.y, this.grid);
}

function Grid(map) {
    this.width = map.indexOf(",");
    this.height = map.match(/,/g).length + 1;
    this.map = this.loadMap(map);
}

Grid.prototype.withinBounds = function(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
}

Grid.prototype.cellAt = function(x, y) {
    if (!this.withinBounds(x, y)) {
        return null;
    }
    return this.map[y][x];
}

Grid.prototype.validateLoadString = function(str) {
    var arr = str.split(",");

    if (/^,+$/.test(str)) {
        console.log("Has only commas");
        return false;
    }

    if (str == arr[0]) {
        console.log("No commas");
        return false;
    }

    if (!/^[ox,]+$/.test(str)) {
        console.log("Invalid characters");
        return false;
    }

    return true;
}

Grid.prototype.loadMap = function(map) {
    if (!this.validateLoadString(map)) {
        map = generateEmptyMap(this.width, this.height);
    }
    map = map.split(",");

    this.width = map[0].length;
    this.height = map.length;

    var result = [];

    for (var y = 0; y < this.height; y++) {
        var row = [];
        for (var x = 0; x < this.width; x++) {
            var type = symbolMap[map[y].charAt(x)];
            row.push(new Cell(type, x, y, this));
        }
        result.push(row);
    }
    return result;
}

Grid.prototype.draw = function() {
    var gameContainer = getElementByClass("game");
    var ctx = canvasCells.getContext("2d");

    this.cellWidth = canvasCells.width / this.width;
    this.cellHeight = canvasCells.height / this.height;

    ctx.clearRect(0, 0, canvasCells.width, canvasCells.height);

    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var color = this.map[y][x].alive ? "white" : "gray";
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.strokeStyle = "gray";
            ctx.rect(x * this.cellWidth, y * this.cellHeight,
                     this.cellWidth, this.cellHeight);
            ctx.fill();
            ctx.stroke();
        }
    }
}

Grid.prototype.update = function() {
    var newMap = [];

    for (var y = 0; y < this.height; y++) {
        var newMapRow = [];
        for (var x = 0; x < this.width; x++) {
            if (this.map[y][x].neighborCount === undefined) {
                this.map[y][x].neighborCount = this.map[y][x].getNeighborCount();
            }
            newMapRow.push(this.map[y][x].update());
        }
        newMap.push(newMapRow);
    }
    this.map = newMap;
    this.draw();
}

Grid.prototype.clear = function() {
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            this.map[y][x] = new Cell(false, x, y, this);
        }
    }
}

Grid.prototype.stringify = function() {
    result = "";
    for (var y = 0; y < this.height; y++) {
        var row = "";
        for (var x = 0; x < this.width; x++) {
            var character = this.map[y][x].alive ? "o" : "x";
            row += character;
        }
        result += row + ",";
    }
    return result.slice(0, result.length - 1);
}

var gridObject = new Grid(generateEmptyMap(10));
var canvasCells = getElementByClass("canvas-cells");
var canvasAdd = getElementByClass("canvas-add");
var advanceButton = getElementByClass("button-advance");
var advanceOnceButton = getElementByClass("button-advance-once");
var clearButton = getElementByClass("button-clear");
var saveButton = getElementByClass("button-save");
var loadButton = getElementByClass("button-load");
var setSizeButton = getElementByClass("button-set-size");
var currentWidth = getElementByClass("current-width");
var currentHeight = getElementByClass("current-height");
var mode = "add";
var maxSize = 100;

function setMode(newMode) {
    if (mode == "evolve") {
        clearInterval(advanceButton.interval);
    }

    mode = newMode;
}

window.onload = function() {
    var gameContainer = getElementByClass("game");
    canvasCells.width = canvasCells.height = gameContainer.offsetWidth;
    canvasAdd.width = canvasAdd.height = canvasCells.width;
    gameContainer.style.height = gameContainer.offsetWidth + "px";
    gameContainer.style.width = canvasCells.width + "px";

    gridObject.draw();
}

function drawAddBox(event) {
    var canvasBox = canvasAdd.getBoundingClientRect();
    ctx = canvasAdd.getContext("2d");
    ctx.clearRect(0, 0, canvasAdd.width, canvasAdd.height);

    var drawX = Math.floor((event.clientX - canvasBox.left) / gridObject.cellWidth) * gridObject.cellWidth;
    var drawY = Math.floor((event.clientY - canvasBox.top) / gridObject.cellHeight) * gridObject.cellHeight;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(drawX, drawY, gridObject.cellWidth, gridObject.cellHeight);
}

advanceButton.addEventListener("click", function(event) {
    if (mode == "evolve") {
        setMode("add");
        this.innerHTML = "Play";
        return;
    }

    gridObject.update();
    this.interval = setInterval(function() {gridObject.update();}, 200);
    this.innerHTML = "Stop";
    setMode("evolve");
});

advanceOnceButton.addEventListener("click", function(event) {
    if (mode == "add") {
        gridObject.update();
    }
});

canvasAdd.addEventListener('contextmenu', function(evt) { 
  evt.preventDefault();
}, false);

canvasAdd.addEventListener("mousedown", function(event) {
    if (mode == "evolve") {
        window.alert("Press Stop to be able to place again!");
        return;
    }

    var canvasBox = canvasAdd.getBoundingClientRect();
    var gridX = Math.floor((event.clientX - canvasBox.left) / gridObject.cellWidth);
    var gridY = Math.floor((event.clientY - canvasBox.top) / gridObject.cellHeight);

    gridObject.map[gridY][gridX] = new Cell(event.which == 1, gridX, gridY, gridObject);
    gridObject.draw();

    event.preventDefault();
});

clearButton.addEventListener("click", function(event) {
    setMode("add");
    gridObject.clear();
    gridObject.draw();
});

saveButton.addEventListener("click", function(event) {
    var textSave = getElementByClass("text-save");
    textSave.innerHTML = gridObject.stringify();
})

loadButton.addEventListener("click", function(event) {
    var textLoad = getElementByClass("text-load");
    if (!textLoad.value) {
        return;
    }

    gridObject.map = gridObject.loadMap(textLoad.value);
    gridObject.draw();
});

setSizeButton.addEventListener("click", function(event) {
    var width = getElementByClass("text-width").value;
    var height = getElementByClass("text-height").value;
    if (width <= 0 || height <= 0) {
        window.alert("Invalid size!");
        return;
    }

    gridObject = new Grid(generateEmptyMap(width, height));
    gridObject.draw();
    currentWidth.innerHTML = width;
    currentHeight.innerHTML = height;
})