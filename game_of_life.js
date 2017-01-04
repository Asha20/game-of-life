var emptyMap = [
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
]

var testMap = [
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", "o", "o", "o"],
    [" ", " ", " ", " ", " ", " ", " ", "o", " ", " "],
    [" ", " ", " ", " ", " ", " ", " ", " ", "o", " "]
]

var symbolMap = {
    " ": false,
    "o": true
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
    this.width = map[0].length;
    this.height = map.length;
    this.map = this.populate(map);
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

Grid.prototype.populate = function(map) {
    var result = [];

    for (var y = 0; y < this.height; y++) {
        var row = [];
        for (var x = 0; x < this.width; x++) {
            var type = symbolMap[map[y][x]];
            row.push(new Cell(type, x, y, this));
        }
        result.push(row);
    }
    return result;
}

Grid.prototype.draw = function() {
    var gameContainer = getElementByClass("game");
    var grid = getElementByClass("grid");
    if (grid) {
        gameContainer.removeChild(grid);
    }
    grid = gameContainer.appendChild(makeElement("div", {class: "container grid"}));

    for (var y = 0; y < this.height; y++) {
        var row = grid.appendChild(makeElement("div", {class: "container grid-row"}))
        for (var x = 0; x < this.width; x++) {
            var cellState = (this.map[y][x].alive) ?
                            " grid-cell-alive" : " grid-cell-dead"
            row.appendChild(makeElement("div", {class: "grid-cell" + cellState}));
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

var gridObject = new Grid(testMap);

window.onload = function() {
    gridObject.draw();
}

var proceedButton = getElementByClass("button-proceed");
proceedButton.addEventListener("click", function(event) {
    gridObject.update();
    setInterval(function() {gridObject.update();}, 500);
});