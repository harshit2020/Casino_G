let winamt = 0;
let betamt = 0;
let matrix_temp = [];
let result = [];
let matchingindices = [];
let paylinematchingindices = [];

const paylines = [
    [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], // payline 1
    [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // payline 2
    [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], // payline 3
    [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], // payline 4
    [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], // payline 5
    [[1, 0], [0, 1], [0, 2], [0, 3], [1, 4]], // payline 6
    [[1, 0], [2, 1], [2, 2], [2, 3], [1, 4]], // payline 7
    [[0, 0], [0, 1], [1, 2], [2, 3], [2, 4]], // payline 8
    [[2, 0], [2, 1], [1, 2], [0, 3], [0, 4]], // payline 9
    [[1, 0], [1, 1], [2, 2], [1, 3], [1, 4]], // payline 10
];

const itemcval3 = {"A": 5, "K": 5, "Q": 5, "J": 5, "FAN": 10, "TOTEM": 10, "SCARAB": 20, "BIRD": 20, "ANUBIS": 50, "EOH": 100, "SCATTER": 20};
const itemcval4 = {"A": 20, "K": 20, "Q": 20, "J": 20, "FAN": 50, "TOTEM": 50, "SCARAB": 100, "BIRD": 125, "ANUBIS": 200, "EOH": 250, "SCATTER": 200};
const itemcval5 = {"A": 100, "K": 100, "Q": 100, "J": 100, "FAN": 200, "TOTEM": 200, "SCARAB": 250, "BIRD": 300, "ANUBIS": 400, "EOH": 500, "SCATTER": 500};
const valuedict = {3: itemcval3, 4: itemcval4, 5: itemcval5}; // Item valuation 

const numberToWord = {0: 'zero',1: 'one',2: 'two',3: 'three',4: 'four',5: 'five',6: 'six',7: 'seven',8: 'eight',9: 'nine',10: 'ten',11: 'eleven'};
const indexToWord = ([row, col]) => `${numberToWord[row]}_${numberToWord[col]}`; // Num Co-Ordinate to Word Co-Ordinate


function checkpayline(matrix) 
{
    winamt = 0;
    result = [];
    matchreel = [];
    matchingindices = [];
    paylinematchingindices = [];

    const countScatter = matrix.flat().filter(value => value === "SCATTER").length;
    if (valuedict[countScatter]) {
        winamt += valuedict[countScatter]["SCATTER"];
    } // This Count the number of "SCATTER" in the matrix and adds win amount

    let bpl = betamt / 10; // bpl: bet per line 

    for (let paylineIndex = 0; paylineIndex < paylines.length; paylineIndex++) 
    {
        const payline = paylines[paylineIndex];
        let count = 0;
        let match = false;
        let element = '';
        paylinematchingindices = [];

        for (let i = 0; i < payline.length; i++) 
        {
            let [row, col] = payline[i];
            if (matrix[row][col] !== "WILD") 
            {
                element = matrix[row][col];
                break;
            }
        } // This loop finds the next element after WILD

        for (let i = 0; i < payline.length; i++) 
        {
            let [row, col] = payline[i];
            if (matrix[row][col] === element || matrix[row][col] === "WILD") 
            {
                count++;
                paylinematchingindices.push(indexToWord([row, col]));
                if (matrix[row][col] === "WILD")
                {
                    paylinematchingindices.push(`reel${col}`);
                    matchreel.push(col);
                }
                if (count >= 3) 
                    match = true;
            } 
            else 
                break;
        } // This loop finds the matching indices on win payline and pushes into array

        if (match & element != 'SCATTER')
        {
            winamt+= valuedict[count][element] * bpl;
            result.push(paylineIndex + 1);
            matchingindices.push(paylinematchingindices);
        } // This Condition pushes the data into separate array whenever player wins
    }

    for (let reelIndex of matchreel) {
        matchingindices = matchingindices.map(indices => 
            indices.filter(index => !index.endsWith(`_${numberToWord[reelIndex]}`))
        );
    } // Remove indices related to wild reel columns from matchingindices
    send();
}
function send(){
    const event_send = new CustomEvent('receive_two_d', {
        detail:{
            payline_glow: result,
            coords : matchingindices,
            won_amount: winamt
        }
    });
    window.dispatchEvent(event_send); // sends the data back
}

window.addEventListener('send_two_d', (event) => {
    matrix_temp = event.detail.array_data,
    betamt = event.detail.amount
    console.log("yo me in s2")
    console.log(matrix_temp)
    checkpayline(matrix_temp);
}); // receives the data