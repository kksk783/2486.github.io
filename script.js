
var score= document.getElementById('score')
var bestscore=document.getElementById('bestscore')
var best=0
bestscore.textContent=best
var newscore=0
score.textContent=newscore
var timer = document.getElementById('timer')
var n=1

function swich(){
    var oldcss=document.getElementById('onpage')
    var newcss=document.createElement('link')
    newcss.rel='stylesheet'
    newcss.href=oldcss.href.includes('/成發/2048.css')
    ? '/成發/2048.css'
    : '/成發/homo.css'

    newcss.onload=()=>{if (oldcss) oldcss.remove()}
    document.head.appendChild(newcss)
}


var flow =setInterval(()=>{
    timer.textContent = +timer.textContent+1
},1000)

for(let i=1;i<=16;i++){
    let blok = document.createElement("div")
    blok.classList.add('grid')
    document.getElementById("gridbox").appendChild(blok)
}



const size=4
var tilebox= document.getElementById('tilebox')
var grids=Array(size).fill(0).map(()=>Array(size).fill(0))

function addNew(n){
    let blank=[]
    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
            if(grids[i][j]==0) blank.push([i,j])
        }
    }

    for(let i=0;i<n;i++){
        let rn =Math.floor(Math.random() * blank.length)
        let newsize= 0
        if(Math.random()<0.6) newsize=2 //隨機取2或4
        else newsize=4
        let tile = document.createElement('div')
        let text = document.createElement('div')
        text.textContent = newsize
        text.classList.add('tile-text')
        tile.appendChild(text)
        tile.classList.add('tile', `tile-${blank[rn][0] + 1}-${blank[rn][1] + 1}`, `tile-${newsize}`, 'tile-new');
        tilebox.appendChild(tile)
        grids[blank[rn][0]][blank[rn][1]] = newsize;
        blank.splice(rn,1)
    }
}

addNew(2)

function update(n){
    let gridArr= document.getElementsByClassName('tile')
    while(gridArr.length) gridArr[0].remove() //清空方塊

    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
            if(grids[i][j]){
                let tile= document.createElement('div')
                tile.classList.add('tile',`tile-${i+1}-${j+1}`)
                if(grids[i][j]<=2048) tile.classList.add(`tile-${grids[i][j]}`)
                else tile.classList.add('tile-super')
                tilebox.appendChild(tile)

                let text= document.createElement("div")
                text.classList.add('tile-text')
                text.textContent= `${grids[i][j]}`
                tile.appendChild(text)
            }
        }
    }
    score.textContent=newscore
    if(best<=newscore){
        best=newscore;
        bestscore.textContent=best;
    }
    
    addNew(n)  //新增方塊
}

function move(Xs, Ys) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (Xs[i][j] || Ys[i][j]) {
                let grid = document.getElementsByClassName(`tile-${i + 1}-${j + 1}`);
                grid = grid[grid.length - 1]; // 取得最後一個元素(最新)
                grid.classList.add(`tile-${i + Ys[i][j] + 1}-${j + Xs[i][j] + 1}`);
                grid.classList.remove(`tile-${i + 1}-${j + 1}`);
            }
        }
    }
}

function delay(n) {
    return new Promise(function(r){
        setTimeout(r, n*100);
    });
}

async function left(){
    let copy= grids.map( e => e.map( f => f))//複製
    let merged = {
        x: [],
        y: []
    };
    let notZeros = Array(4).fill(0).map(() => Array(0)); // 創建陣列放不是0的位置
    let moveTos = Array(4).fill(0).map(() => Array(0)); // 創建陣列放要移動到的位置
    let trans = { // 創建物件放X位移陣列和Y位移陣列
        x: Array(size).fill(0).map(() => Array(size).fill(0)),
        y: Array(size).fill(0).map(() => Array(size).fill(0))
    }
    // 找非0位置
    copy.forEach((row, i) => row.forEach((item, j) => {if (item != 0) notZeros[i].push(j)}));

    copy.forEach((ele, index, arr)=>arr[index]=arr[index].filter(e => e!=0 )) //過濾0

    for (let i = 0; i < size; i++) {
        if (copy[i].length == 1) moveTos[i].push(0);
        for (let j = 0; j < copy[i].length - 1; j++) {
            if (copy[i][j] == copy[i][j+1]) {
                copy[i][j] *= 2;
                newscore+= copy[i][j]
                copy[i].splice(j+1, 1);
                moveTos[i].push(j, j);
                if (j + 2 >= copy[i].length) moveTos[i].push(j+1);
                merged.x.push(j + 1);
                merged.y.push(i + 1);
            } else if (j == copy[i].length - 2) moveTos[i].push(j, j + 1);
            else moveTos[i].push(j);
        }
    }

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < notZeros[i].length; j++) {
            trans.x[i][notZeros[i][j]] = +moveTos[i][j] - +notZeros[i][j];
        }
    }

    for(let i=0;i<size;i++){
        while(copy[i].length<4) copy[i].push(0)           //補0
    }
    let same=0
    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
            if(copy[i][j]==grids[i][j]){       //檢查有無變動
                same++
            }
        }
    }
    if(same==16) return 0 //沒變
    move(trans.x, trans.y)
    await delay(1)
    grids = copy.map(e=>e) //變了

    update(1)
}

async function right(){
    let copy= grids.map( e => e.map( f => f)) //複製
    let merged = {
        x: [],
        y: []
    };
    copy= copy.map(e=>e.reverse())  //左右鏡像

    let notZeros = Array(4).fill(0).map(() => Array(0)); // 創建陣列放不是0的位置
    let moveTos = Array(4).fill(0).map(() => Array(0)); // 創建陣列放要移動到的位置
    let trans = { // 創建物件放X位移陣列和Y位移陣列
        x: Array(size).fill(0).map(() => Array(size).fill(0)),
        y: Array(size).fill(0).map(() => Array(size).fill(0))
    }
    // 找非0位置
    copy.forEach((row, i) => row.forEach((item, j) => {if (item != 0) notZeros[i].push(size - 1 - j)}));

    copy.forEach((ele, index, arr)=>arr[index]=arr[index].filter(e => e!=0 )) //過濾0
    

    for (let i = 0; i < size; i++) {
        if (copy[i].length == 1) moveTos[i].push(0);
        for (let j = 0; j < copy[i].length - 1; j++) {
            if (copy[i][j] == copy[i][j+1]) {
                copy[i][j] *= 2;
                copy[i].splice(j+1, 1);
                moveTos[i].push(j, j);
                if (j + 2 >= copy[i].length) moveTos[i].push(j+1);
                merged.x.push(4 - j);
                merged.y.push(i + 1);
            } else if (j == copy[i].length - 2) moveTos[i].push(j, j + 1);
            else moveTos[i].push(j);
        }
    }

    // change value
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < moveTos[i].length; j++) {
            moveTos[i][j] = size - 1 - +moveTos[i][j];
        }
    }

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < notZeros[i].length; j++) {
            trans.x[i][notZeros[i][j]] = +moveTos[i][j] - +notZeros[i][j];
        }
    }
    

    for(let i=0;i<size;i++){
        while(copy[i].length<4) copy[i].push(0)           //補0
    }
    copy=copy.map(e=>e.reverse()) //記得轉回來

    let same=0
    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
            if(copy[i][j]==grids[i][j]){       //檢查有無變動
                same++
            }
        }
    }
    if(same==16) return 0 //沒變
    move(trans.x, trans.y)
    await delay(1)
    grids = copy.map(e=>e) //變了

    update(1, merged.x, merged.y);
}

async function up(){

    let copy= grids[0].map((_,index)=> grids.map(e=>e[index])) //複製+轉置(行列互換)
    let merged = {
        x: [],
        y: []
    };

    let notZeros = Array(4).fill(0).map(() => Array(0)); // 創建陣列放不是0的位置
    let moveTos = Array(4).fill(0).map(() => Array(0)); // 創建陣列放要移動到的位置
    let trans = { // 創建物件放X位移陣列和Y位移陣列
        x: Array(size).fill(0).map(() => Array(size).fill(0)),
        y: Array(size).fill(0).map(() => Array(size).fill(0))
    }
    // 找非0位置
    copy.forEach((row, i) => row.forEach((item, j) => {if (item != 0) notZeros[i].push(j)}));

    copy.forEach((ele, index, arr)=>arr[index]=arr[index].filter(e => e!=0 )) //過濾0

    for (let i = 0; i < size; i++) {
        if (copy[i].length == 1) moveTos[i].push(0);
        for (let j = 0; j < copy[i].length - 1; j++) {
            if (copy[i][j] == copy[i][j+1]) {
                copy[i][j] *= 2;
                newscore+= copy[i][j]
                copy[i].splice(j+1, 1);              //合併
                moveTos[i].push(j, j);
                if (j + 2 >= copy[i].length) moveTos[i].push(j+1);
                merged.x.push(j + 1);
                merged.y.push(i + 1);
            } else if (j == copy[i].length - 2) moveTos[i].push(j, j + 1);
            else moveTos[i].push(j);
        }
    }

    for(let i=0;i<size;i++){
        while(copy[i].length<4) copy[i].push(0)           //補0
    }

    copy= copy[0].map((_,index)=> copy.map(e=>e[index])) //轉置回來

    let same=0
    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
            if(copy[i][j]==grids[i][j]){       //檢查有無變動
                same++
            }
        }
    }

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < notZeros[i].length; j++) {
            trans.y[notZeros[i][j]][i] = +moveTos[i][j] - +notZeros[i][j];
        }
    }

    if(same==16) return 0 //沒變
    move(trans.x, trans.y)
    await delay(1)
    grids = copy.map(e=>e) //變了

    update(1)
}

async function down(){
    let copy= grids[0].map((_,index)=> grids.map(e=>e[index])) //複製+轉置(行列互換)
    let merged = {
        x: [],
        y: []
    };
    copy= copy.map(e=>e.reverse())

    let notZeros = Array(4).fill(0).map(() => Array(0)); // 創建陣列放不是0的位置
    let moveTos = Array(4).fill(0).map(() => Array(0)); // 創建陣列放要移動到的位置
    let trans = { // 創建物件放X位移陣列和Y位移陣列
        x: Array(size).fill(0).map(() => Array(size).fill(0)),
        y: Array(size).fill(0).map(() => Array(size).fill(0))
    }
    // 找非0位置
    copy.forEach((row, i) => row.forEach((item, j) => {if (item != 0) notZeros[i].push(size - 1 - j)}));

    copy.forEach((ele, index, arr)=>arr[index]=arr[index].filter(e => e!=0 )) //過濾0

    for (let i = 0; i < size; i++) {
        if (copy[i].length == 1) moveTos[i].push(0);
        for (let j = 0; j < copy[i].length - 1; j++) {
            if (copy[i][j] == copy[i][j+1]) {
                copy[i][j] *= 2;
                newscore+= copy[i][j]
                copy[i].splice(j+1, 1);              //合併
                moveTos[i].push(j, j);
                if (j + 2 >= copy[i].length) moveTos[i].push(j+1);
                merged.x.push(j + 1);
                merged.y.push(i + 1);
            } else if (j == copy[i].length - 2) moveTos[i].push(j, j + 1);
            else moveTos[i].push(j);
        }
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < moveTos[i].length; j++) {
            moveTos[i][j] = size - 1 - +moveTos[i][j];
        }
    }

    //設置移動動畫
    for (let i = 0; i < size; i++) {
        for(let j = 0; j < notZeros[i].length; j++) {
            trans.y[notZeros[i][j]][i] = +moveTos[i][j] - +notZeros[i][j];
        }
    }

    for(let i=0;i<size;i++){
        while(copy[i].length<4) copy[i].push(0)           //補0
    }
    copy= copy.map(e=>e.reverse())
    copy= copy[0].map((_,index)=> copy.map(e=>e[index])) //轉置回來

    let same=0
    for(let i=0;i<size;i++){
        for(let j=0;j<size;j++){
            if(copy[i][j]==grids[i][j]){       //檢查有無變動
                same++
            }
        }
    }

    for (let i = 0; i < size; i++) {
        for(let j = 0; j < notZeros[i].length; j++) {
            trans.y[notZeros[i][j]][i] = +moveTos[i][j] - +notZeros[i][j];
        }
    }

    if(same==16) return 0 //沒變
    move(trans.x, trans.y)
    await delay(1)
    grids = copy.map(e=>e) //變了
    update(1, merged.x, merged.y);
}
function newGame() {
    newscore=0
    grids = Array(size).fill(0).map(() => Array(size).fill(0));
    update(2);
    timer.textContent=0;

}

document.body.addEventListener('keyup', Keydetect )

function Keydetect(e){
    console.log(e.code)
    switch (e.code){
        case "KeyA":
            left()
            break           
        case "KeyD":
            right()
            break
        case 'KeyW':
            up()
            break
        case 'KeyS':
            down()
            break
        case 'KeyR':
            newGame()
            break
    }

}


