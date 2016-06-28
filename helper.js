function setXY(target, value, y) {
    target.x = value
    if (y) {
        target.y = y
    }else {
        target.y = value
    }
}
function setXYFrom(target, from) {
    target.x = from.x
    target.y = from.y
}

function setWidthHeight(target, value, height) {
    target.width = value
    if (height) {
        target.height = height
    }else {
        target.height = value
    }
}

function getXYRatio(startPos, endPos){
    let deltaX = (endPos.x - startPos.x)
    let deltaY = (endPos.y - startPos.y)

    let xRatio = Math.abs(deltaX) / (Math.abs(deltaX) + Math.abs(deltaY)) * Math.sign(deltaX)
    let yRatio = Math.abs(deltaY) / (Math.abs(deltaX) + Math.abs(deltaY)) * Math.sign(deltaY)
    return {
        xRatio:xRatio,
        yRatio:yRatio
    }
}

function moveTowards(startPos, endPos, movementAmount){
    // let deltaX = (endPos.x - startPos.x)
    // let deltaY = (endPos.y - startPos.y)
    //
    // let distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    // let distanceRatio = movementAmount / distance;
    // startPos.x += deltaX * distanceRatio;
    // startPos.y += deltaY * distanceRatio;

    let x = startPos.x - endPos.x;
    let y = startPos.y - endPos.y;
    var radians = Math.atan2(y,x);
    // startPos.x = startPos.x - movementAmount * Math.cos(radians);
    // startPos.y = startPos.y - movementAmount * Math.sin(radians);
    return {
        x : startPos.x - movementAmount * Math.cos(radians),
        y : startPos.y - movementAmount * Math.sin(radians)
    }

}

// 0 180   -180 -0
function turnRight(degree, amount){
    degree += amount;
    if (degree > 180) {
        degree = -180 + degree % 180;
    }
    return degree;
}

// 0 180   -180 -0
function turnLeft(degree, amount){
    degree -= amount;
    if (degree < -180) {
        degree = 180 + degree % 180;
    }
    return degree;
}

function radiansToDegrees(radians){
    return radians * (180/Math.PI)
}

function degreesToRadians(degrees){
    return degrees / 180 * Math.PI
    // return degrees * Math.PI/180
}
