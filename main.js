window.onload = init;

// let colors = [{"name":"tile-pink", "color":"#ec407a" },{"name":"tile-purple", "color":"#ab47bc" },{"name":"tile-cyan", "color":"#26c6da" },{"name":"tile-amber", "color":"#ffca28" },{"name":"tile-light-blue", "color":"#29b6f6" },{"name":"tile-red", "color":"#e84e40" },{"name":"tile-indigo", "color":"#5c6bc0" },{"name":"tile-deep-orange", "color":"#ff7043" },{"name":"tile-redlight-green", "color":"#9ccc65" }];

let colors = [0xec407a,0xab47bc,0x26c6da,0xffca28,0x29b6f6,0xe84e40,0x5c6bc0,0xff7043,0x9ccc65];


let index = 0;
function getNextColor(){
    if (index == colors.length) {
        index=0;
    }
    let col = colors[index];
    index++;
    return col;
}

let filter = PIXI.filters || PIXI.Filter;

let game = {};


function init() {

    // module aliases
    let Engine = Matter.Engine, Render = Matter.Render, World = Matter.World, Bodies = Matter.Bodies, Body = Matter.Body, Composites = Matter.Composites, Common = Matter.Common, Query = Matter.Query;
    // create an engine
    let engine = Engine.create();

    let width = 800;
    let height = 600;
    let radiusMin = 20;
    let radiusMax = 80;
    let cellValueMin = 20;
    let cellValueMax = 80;
    let canvas = document.getElementById("stage");

    let scale = .7;
    height*=scale,width*=scale,radiusMax*=scale,radiusMin*=scale

    canvas.width=width;
    canvas.height=height;

    let stage = new PIXI.Container(0x66FF99, true);
    let renderer = new PIXI.autoDetectRenderer(width, height, {
        view: canvas, backgroundColor : 0x1099bb, antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoResize:true});

        PIXI.cocoontext.CONST.TEXT_RESOLUTION =  window.devicePixelRatio;

        //full size
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
        //
        // window.addEventListener("resize", function(){
        //     canvas.width = window.innerWidth;
        //     canvas.height = window.innerHeight;
        // });

        //Add world border
        let offset = 25;
        World.add(engine.world, [
            Bodies.rectangle(width/2, -offset, width + .5 + 2 * offset, 50+ .5, { isStatic: true }),
            Bodies.rectangle(width/2, height + offset, width + .5 + 2 * offset, 50 +.5, { isStatic: true }),
            Bodies.rectangle(width + offset, height/2, 50 + .5, height + .5 + 2 * offset, { isStatic: true }),
            Bodies.rectangle(-offset, height/2, 50 + .5, height + .5 + 2 * offset, { isStatic: true })
        ]);

        engine.world.gravity.y = .0;

        Engine.run(engine);

        //Create owners
        let owners = [];
        for (let i = 0; i < 3; i++) {
            let owner = new Owner(i+'', getNextColor());
            owners.push(owner);
        }

        const USER = owners[0];


        let NUM_CELLS = 10;
        //Create Cells
        let cells = [];
        for (let i = 0; i < NUM_CELLS; i++) {
            let maxValue = _.random(radiusMin, radiusMax);
            let value = _.random(0, maxValue);
            let cell = new Cell(value, maxValue, _.sample(owners));
            cells.push(cell);
        }

        let attackCells = [];

        placeRandomCells(cells);
        function placeRandomCells(cells) {
            for (let cell of cells) {
                let x = _.random(0, width), y = _.random(0, height);
                cell.body = Bodies.circle(x, y, cell.maxValue);
                cell.body.cell = cell;
                World.add(engine.world, [cell.body]);
            }
        }

        let getSelectedCells = () => {
            return _.filter(cells, 'selected');
        }
        let getCellBodies = () => {
            return _.map(cells, 'body');
        }

        PIXI.cocoontext.CONST.TEXT_RESOLUTION =  window.devicePixelRatio;

        addSprites(cells);
        function addSprites(cells) {

            for (let cell of cells) {
                let container = new PIXI.DisplayObjectContainer();
                cell.container = container;
                stage.addChild(container);

                let graphics = new PIXI.Graphics();

                drawCell(graphics, 0xffffff, cell.body.position, cell.maxValue/1);
                drawCell(graphics, 0xcccccc, cell.body.position, cell.maxValue/1.1);
                drawCell(graphics, 0xaaaaaa, cell.body.position, cell.maxValue/1.5);
                drawCell(graphics, 0x999999, cell.body.position, cell.maxValue/3);
                drawCell(graphics, 0x666666, cell.body.position, cell.maxValue/4);

                let texture = graphics.generateTexture();
                cell.sprite = new PIXI.Sprite(texture);
                cell.sprite.interactive = true;

                setXY(cell.sprite.anchor, 0.5);
                container.addChild(cell.sprite);

                cell.text = new PIXI.cocoontext.CocoonText(cell.value+'',{font : '15px Arial', align : 'center', fill:"white"});
                setXY(cell.text.anchor, 0.5);
                cell.text.canvas.style.webkitFontSmoothing = "antialiased";
                container.addChild(cell.text);

                // let displacementTexture = PIXI.Sprite.fromImage("2yYayZk.png");
                // let displacementFilter = new filter.DisplacementFilter(displacementTexture);
                // setXY(displacementFilter.scale, cell.maxValue/radiusMax *4)
                // container.filters = [displacementFilter];
                // cell.displacementTexture = displacementTexture;
                // container.addChild(displacementTexture);

                cell.sprite.click = (mouseData) => {

                    if (cell.owner == USER) {
                        cell.selected = !cell.selected;
                    }
                    if (getSelectedCells().length >= 1 && cell.owner != USER) {
                        attack(getSelectedCells(), cell);
                        for (let cell of cells) {
                            cell.selected = false;
                        }
                        play("attack")
                    }else if (cell.selected){
                        play("hit")
                    }
                }

            }

        }

        function attack(from, to) {
            for (let cell of from) {
                let attackValue = cell.value/2
                cell.value -= attackValue;
                while(attackValue){
                    let val = attackValue >=3 ? 3:attackValue;
                    attackValue-=val;
                    createAttackCell(cell, to, val)
                }
                updateText([cell])
            }
        }

        function createAttackCell(cell, targetCell, value) {

            let attackCell = new AttackCell(cell.owner, targetCell, value);
            attackCells.push(attackCell);

            let attackCellPos = {x: cell.body.position.x, y:cell.body.position.y};
            let attackCellRadius = attackCell.value;

            moveTowards(attackCellPos, targetCell.body.position, attackCellRadius + cell.maxValue);

            attackCell.body = Bodies.circle(attackCellPos.x, attackCellPos.y, attackCellRadius);
            attackCell.body.cell = attackCell;
            World.add(engine.world, [attackCell.body]);

            attackCell.interval = setInterval(function(){
                let body = attackCell.body;
                let forceMagnitude = 0.001 * body.mass; /// 0.001 cell.speed
                // Query.point(_.intersection(getCellBodies(), [targetCell.body]), point)

                Body.applyForce(body, body.position, {
                    x: forceMagnitude * getXYRatio(body.position, targetCell.body.position).xRatio,
                    y: forceMagnitude * getXYRatio(body.position, targetCell.body.position).yRatio,
                });
            }, 1000) //1000 cell.agitlity

            let graphics = new PIXI.Graphics();
            drawCell(graphics, cell.owner.color, cell.body.position, attackCell.value);
            let texture = graphics.generateTexture();
            attackCell.sprite = new PIXI.Sprite(texture);
            setXY(attackCell.sprite.anchor, 0.5);
            stage.addChild(attackCell.sprite);

        }

        function removeAttackCell(attackCell){
            stage.removeChild(attackCell.sprite);
            clearInterval(attackCell.interval);
            World.remove(engine.world, [attackCell.body])

        }

        // an example of using collisionStart event on an engine
        Matter.Events.on(engine, 'collisionStart', function(event) {
            let pairs = event.pairs;

            // change object colours to show those starting a collision
            for (let i = 0; i < pairs.length; i++) {
                let pair = pairs[i];
                let cells = [pair.bodyA.cell, pair.bodyB.cell];
                let aCell = _.find(cells, (o) => { return o instanceof AttackCell });
                let cell = _.find(cells, (o) => { return o instanceof Cell });
                if(aCell && cell && aCell.target == cell){
                    cell.value -= (aCell.value * (cell.owner == aCell.owner)?-1:1);
                    if (cell.value < 0) {
                        cell.owner = aCell.owner;
                        cell.value *= -1;
                    }
                    updateText([cell])
                    removeAttackCell(aCell)
                    play("drop");
                };

            }
        })

        // let displacementTexture = PIXI.Sprite.fromImage("2yYayZk.png");
        // let displacementFilter = new filter.DisplacementFilter(displacementTexture);
        // displacementFilter.scale.x = 5;
        // displacementFilter.scale.y = 5;
        // stage.addChild(displacementTexture);
        // stage.filters = [displacementFilter]

        // start animating
        animate();
        function animate(time) {
            requestAnimationFrame(animate);
            for (let cell of cells) {
                setXYFrom(cell.sprite, cell.body.position)
                setXYFrom(cell.text, cell.body.position)
                cell.sprite.tint = cell.owner.color;
                if (cell.displacementTexture) {
                    cell.displacementTexture.x += 2;
                    cell.displacementTexture.y += 2;
                }
                if (cell.shock){
                    cell.shock.time = (cell.shock.time >= 1 ) ? 0 : cell.shock.time + 0.005;
                }

                if (cell.light1)
                    cell.light1.rotation += 0.02;
                if (cell.light2)
                    cell.light2.rotation += 0.01;
            }

            for (let cell of attackCells) {
                setXYFrom(cell.sprite, cell.body.position)
            }

            TWEEN.update(time);
            // displacementTexture.x += 3;
            // displacementTexture.y += 3;

            renderer.render(stage)
        }

        renderer.render(stage)

        function updateText(cells){
            for (let cell of cells) {
                cell.recalculateValue();
                cell.text.text = Math.round(cell.value)+'';
            }
        }

        setInterval(function(){
            updateText(cells);
        }, 1000);

    }

    class Owner {
        constructor(name, color) {
            this.name = name;
            this.color = color;
        }
    }

    class Cell {
        constructor(value, maxValue, owner) {
            this.value = value;
            this.maxValue = maxValue;
            this.growth = 1 / 100;
            this.owner = owner;
            this.selected = false;

        }
        set value(value) {
            this._value=value;
            this.baseGrowthValue = value;
            this.baseGrowthValueTime = Date.now();
        }
        get value(){
            return this._value;
        }
        set selected(value) {
            let prev = this._selected;
            this._selected = value;
            if (prev == undefined) return; // initial value

            if (value) {
                selectCells([this]);
            }else {
                deselectCells([this]);
            }
        }
        get selected(){
            return this._selected;
        }
        toString() {
            return '(' + this.value + ')';
        }
        recalculateValue() {
            let timeSince = (Date.now() - this.baseGrowthValueTime ) / 10000;
            this.value = this.maxValue * (1 / ( 1 + Math.exp(-this.growth * this.maxValue * timeSince) * ( (this.maxValue/this.baseGrowthValue) - 1 ) ));
        }
    }

    class AttackCell {
        constructor(owner, target, value, speed) {
            this.owner = owner;
            this.target = target;
            this.value = value;
            this.speed = speed;
        }
    }
