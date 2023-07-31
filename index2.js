
let ROWQTY = 40;
let COLQTY = 40;

let running = false;

$(document).ready(()=>{
    let mat = setGrid();
    
    $("#setGrid").click(()=>{
        running = false;
        mat = setGrid();
        ROWQTY = parseInt($("#rows_amount").val())
        COLQTY = parseInt($("#cols_amount").val())
    });

    $(cell()).click((e)=>{
        if(running) return;

        let attr = e.target.attributes;
        let row = parseInt(attr['row'].value);
        let col = parseInt(attr['col'].value);

        let curr_cell = mat[row][col];

        curr_cell.isAlive = !curr_cell.isAlive;

        console.log(mat[row][col])
        console.log(nearby_living_cells(mat,row,col))
    });

    $("#play").click(()=>{
        running = true;
    });


    $("#pause").click(()=>{
        running = false;
    });
    
    $("#stop").click(()=>{
        running = false;
        mat = setGrid();
    });
    run(mat, ROWQTY, COLQTY);
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function run(mat, rows, cols){
    while(true){
        await delay(1000);
        if(!running) continue;

        for(let i = 0; i < rows; i++){
            for(let j = 0; j < cols; j++){
                check_cell(mat,mat[i][j]);
            }
        }

        for(let i = 0; i < rows; i++){
            for(let j = 0; j < cols; j++){
                set_status(mat[i][j]);
                mat[i][j].isAlive = mat[i][j].nextStatus;
            }
        }
    }
}


function nearby_living_cells(mat, row, col){
    let living_cells = 0;

    /*
    | 1 | 2 | 3 |
    | 4 | 5 | 6 |
    | 7 | 8 | 9 |

    5 is the targeted cell

    we want to check 1 to 9 cells but if any row/col doesn't exist we need to skip that
    */
   let row_from = Math.max(row - 1, 0);
   let row_to = Math.min(row + 1, ROWQTY - 1);
   let col_from = Math.max(col - 1, 0);
   let col_to = Math.min(col + 1, COLQTY - 1);
    for(let i = row_from; i < row_to + 1; i++){
        for(let j = col_from; j < col_to + 1; j++){
            if(i == row && j == col) //skip the cell you are checking
                continue;
            if(mat[i][j].isAlive)
                living_cells++;
        }
    }

    return living_cells;
}

function check_cell(mat,cell){
    let {row,col,isAlive,nextStatus} = cell;
    let living_cells = nearby_living_cells(mat,row,col);
    if((isAlive && ![2,3].includes(living_cells)) || (!isAlive && living_cells == 3)){
        mat[row][col].nextStatus = !mat[row][col].isAlive;
    }else
        mat[row][col].nextStatus = mat[row][col].isAlive;
}

function set_status({row,col,isAlive,nextStatus}){
    if(nextStatus){
        $(cell(row,col)).addClass("alive");
    }else{
        $(cell(row,col)).removeClass("alive");
    }

}

function cell(row = null,col = null){
    let cellSelector = row != null && col != null  ? `[row="${row}"][col="${col}"]` : '';
    return `#grid > tr > td${cellSelector}`;
}

function newRow(mat, row){
    let colsHtml = mat[row].map((e,i) => newCol(row,i, false, false)).join('');
    return `<tr row="${row}">${colsHtml}</td>`;
}

function newCol(rowID, colID, isAlive, nextStatus){
    return `<td row="${rowID}" col="${colID}"></td>`;
}

function setGrid(){
    let grid = $("#grid");
    grid.empty();

    let mat = generate_matrix(ROWQTY, COLQTY);

    let tableHtml = mat.map((e,i) => newRow(mat,i)).join('');
        
    grid.append(tableHtml);

    return mat;
}

function create_cell(row, col, isAlive){
    return {
        row,
        col,
        isAlive, 
        nextStatus: false
    }
}

function generate_matrix(rows,cols){
    let mat = new Array(rows);


    for(let i = 0; i < rows; i++){
        mat[i] = new Array(cols);
        for(let j = 0; j < cols; j++){
            mat[i][j] = create_cell(i,j,Math.random() > 0.5);
        }
    }

    return mat;
}

