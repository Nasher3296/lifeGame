const STEP_SPEED = 500;
let mouseDown = false;

$(document).ready(()=>{
    setGrid();
    
    $("#setGrid").click(()=>{
        setGrid();
    });

    $(document).mousedown(()=>{
        mouseDown = true;
    });

    $(document).mouseup(()=>{
        mouseDown = false;
    });

    //Runnign the game
    let interval;
    $("#play").click(()=>{
        clearInterval(interval);
        let counter = $("#counter");
        let i = 0;
        interval = setInterval(()=>{
            step();
            counter.html(i++);
        },STEP_SPEED);
    });

    $("#stop").click(()=>{
        clearInterval(interval);
        setGrid();
        let counter = $("#counter");
        counter.html(0);
    });
});

function setGrid(){
    let grid = $("#grid");
    grid.empty();

    let cols_qty = $("#cols_qty").val() || 1;
    let rows_qty = $("#rows_qty").val() || 1;

    let rowElement;
    for(let i = 0; i < rows_qty ; i++){
        grid.append(newRow(i));
        rowElement = $(`tr[row_ID=${i}]`);
        for(let j = 0; j < cols_qty ; j++){
            rowElement.append(newCol(i,j));
        }
    }

    $("#grid tr td").mousedown(({target:e})=>{
        let colID = $(e).attr("col_id");
        let rowID = $(e).attr("row_id");
        toggle_cell(rowID, colID);
    });

    $("#grid tr td").mouseover(({target:e})=>{
        let colID = $(e).attr("col_id");
        let rowID = $(e).attr("row_id");
        if(mouseDown) 
            toggle_cell(rowID, colID);
    });
}

function newRow(rowID){
    return `<tr row_id="${rowID}"></td>`;
}

function newCol(rowID, colID){
    return `<td row_id="${rowID}" col_id="${colID}"></td>`;
}

function toggle_cell(rowID, colID){
    getCell(rowID,colID).toggleClass("alive");
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function step(){
    // test_random_cells();
    check_every_cell(); //I can optimize this function to prevent unnecesary iterations

}

function test_random_cells(){
    let cols_qty = $("#cols_qty").val() || 1;
    let rows_qty = $("#rows_qty").val() || 1;

    let col = getRandomInt(cols_qty);
    let row = getRandomInt(rows_qty);

    let e = getCell(row,col).get(0);

    toggle_cell(e);
}

function getCell(row,col){
    return $(`#grid tr td[row_id=${row}][col_id=${col}]`);
}

function nearby_living_cells(rowID, colID){
    let cols_qty = $("#cols_qty").val() || 1;
    let rows_qty = $("#rows_qty").val() || 1;
    let living_cells = 0;

    /*
    | 1 | 2 | 3 |
    | 4 | 5 | 6 |
    | 7 | 8 | 9 |

    5 is the targeted cell

    we want to check 1 to 9 cells but if any row/col doesn't exist we need to skip that
    */

    let row_from = Math.max(rowID - 1, 0);
    let row_to = Math.min(rowID + 1, rows_qty);
    let col_from = Math.max(colID - 1, 0);
    let col_to = Math.min(colID + 1, cols_qty);
    for(let i = row_from; i < row_to + 1; i++){
        for(let j = col_from; j < col_to + 1; j++){
            if(i == rowID && j == colID) //skip the cell you are checking
                continue;

            if(getCell(i,j).hasClass("alive"))
                living_cells++;
        }
    }

    return living_cells;
}

function check_every_cell(){
    let cols_qty = $("#cols_qty").val() || 1;
    let rows_qty = $("#rows_qty").val() || 1;

    let stop = true;

    for(let i = 0; i < rows_qty; i++){
        for(let j = 0; j < cols_qty; j++){
            if(check_cell(i,j))
                stop = false;
        }
    }

    $("#grid tr td[toggleNext=true]").each((i, e)=>{
        let colID = $(e).attr("col_id");
        let rowID = $(e).attr("row_id");
        toggle_cell(rowID, colID);
        $(e).attr("toggleNext", "false");
    });


    if(stop){
        $("#stop").click();
    }
}

function prepare_cell_toToggle(rowID,colID){
    //I can't update the cells while it's checking all the cells. I must do it after it ends and before next check all.
    getCell(rowID,colID).attr("toggleNext", "true");
}

function check_cell(rowID, colID){
    let nlc = nearby_living_cells(rowID, colID)

    let isAlive = getCell(rowID,colID).hasClass("alive");

    if((isAlive && ![2,3].includes(nlc)) || (!isAlive && nlc == 3)){
        prepare_cell_toToggle(rowID, colID);
        return true
    }
    return false;
}