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
    let deltaX = (endPos.x - startPos.x)
    let deltaY = (endPos.y - startPos.y)

    let distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    let distanceRatio = movementAmount / distance;
    startPos.x += deltaX * distanceRatio;
    startPos.y += deltaY * distanceRatio;

}
