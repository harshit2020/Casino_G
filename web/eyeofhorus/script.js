//******************************************************************variables***************************************************************************************************** 
const debugEl = document.getElementById('debug'),
// iconMap = ["EOH", "A","SCATTER", "TOTEM", "ANUBIS","J","WILD","K","BIRD","Q","SCARAB","FAN"],//deafault
// iconMap1 = ["EOH", "A","SCATTER", "TOTEM", "ANUBIS","J","WILD","K","BIRD","Q","SCARAB","TOTEM"],//bonus game 1
// iconMap2 = ["EOH", "A","SCATTER", "SCARAB", "ANUBIS","J","WILD","K","BIRD","Q","SCARAB","SCARAB"],//bonus game 2
// iconMap3 = ["EOH", "A","SCATTER", "BIRD", "ANUBIS","J","WILD","K","BIRD","Q","BIRD","BIRD"],//bonus game 3
// iconMap4 = ["EOH", "A","SCATTER", "ANUBIS", "ANUBIS","J","WILD","K","ANUBIS","Q","ANUBIS","ANUBIS"],//bonus game 4
// iconMap5 = ["EOH", "A","SCATTER", "EOH", "EOH","J","WILD","K","EOH","Q","EOH","EOH"],//bonus game 5
// iconMap_noSCATTER = ["EOH", "A","A", "TOTEM", "ANUBIS","J","WILD","K","BIRD","Q","SCARAB","FAN"],//bonus game with no SCATTER
iconMap = ["ANUBIS", "A","TOTEM", "A", "A","WILD","J","SCATTER","K","FAN","J","TOTEM","BIRD","Q","SCARAB","K","EOH","J"],//default
iconMap1 = ["J", "A","TOTEM", "A", "TOTEM","A","SCATTER","TOTEM","J","Q","BIRD","A","SCARAB","K","ANUBIS","EOH","K","WILD"],//bonus game 1
iconMap2 = ["J", "WILD","SCARAB", "BIRD", "SCARAB","K","SCATTER","K","Q","SCARAB","J","J","SCARAB","Q","EOH","K","ANUBIS","A"],//bonus game 2
iconMap3 = ["K", "Q","BIRD", "SCATTER", "A","J","BIRD","K","BIRD","J","BIRD","EOH","Q","BIRD","Q","A","ANUBIS","WILD"],//bonus game 3
iconMap4 = ["A", "ANUBIS","Q", "K", "K","ANUBIS","Q","A","ANUBIS","Q","ANUBIS","SCATTER","J","ANUBIS","EOH","ANUBIS","J","WILD"],//bonus game 4
iconMap5 = ["Q", "K","Q", "EOH", "K","EOH","J","SCATTER","EOH","Q","Q","EOH","J","EOH","WILD","EOH","A","EOH"],//bonus game 5
iconMap_noSCATTER = ["ANUBIS", "A","TOTEM", "A", "A","WILD","J","SCATTER","K","FAN","J","TOTEM","BIRD","Q","SCARAB","K","EOH"],//bonus game with no SCATTER
icon_width = 100,
icon_height = 100,
num_icons = 18,
time_per_icon = 80
let count_free = 0
let payline = 0
indexes = [0, 0, 0, 0, 0]; // Updated for 5 reels
let horus_arr = [false,false,false,false,false];
let free_game = 0
let bonus_game_on = false
let horus_appear_bonus = false
let cases = 0
let SCATTER_count = 0
let pos =  [0, 0, 0, 0, 0]
let count_pos = 0
const results = Array.from({ length: 3 }, () => Array(5).fill(null));
let bet_amount = 0
let won_amount = 0;
let player_amount = 0
let coords;
let payline_glow;
let small_horus_div = []
let small_horus_backgroundPosition = []
let count_s_div = 0
let global_iconMap;
const icons_default = {
    "image0.png": 0,
    "image1.png": 1,
    "image2.png": 2,
    "image3.png": 3,
    "image4.png": 4,
    "image5.png": 5,
    "image6.png": 6,
    "image7.png": 7,
    "image8.png": 8,
    "image9.png": 9,
    "image10.png": 10,
    "image11.png": 11,
}
//***************************************************************************functions*********************************************************************************************
const roll = (reel, reelIndex, offset = 0) => {
const delta = (offset + 3) * num_icons + Math.round(Math.random() * num_icons);
return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel),
        backgroundPositionY = parseFloat(style["background-position-y"]),
        targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
        normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    setTimeout(() => {
        reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
        reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
    }, offset * 150);

    setTimeout(() => {
        reel.style.transition = `none`;
        reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
        pos[count_pos] = normTargetBackgroundPositionY
        count_pos = count_pos + 1
        resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
});
};


function rollAll(iconMap_para) {
    global_iconMap = iconMap_para;
    console.log("USING MAP --> ",iconMap_para)
    debugEl.textContent = 'rolling...';
    count_pos = 0
    const reelsList = document.querySelectorAll('.slots > .reel');
    stopGlowReel()
    Promise.all([...reelsList].map((reel, i) => roll(reel, i)))
        .then((deltas) => {
            deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);  
    
            // Populate the results 2D array with the visible icons
            let rowIndex = 1
            let i = 0
            for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
                    results[rowIndex][reelIndex] = iconMap_para[indexes[i]];
                    i=i+1
                    if(results[rowIndex][reelIndex] == "WILD" && bonus_game_on == false){//horus appears bonus game off
                        setTimeout(function(){
                            extend_horus(reelIndex)
                        },500);
                        horus_arr[reelIndex] = true
                    }
                    if(results[rowIndex][reelIndex] == "WILD" && bonus_game_on == true){//horus appears bonus game on
                        setTimeout(function(){
                            extend_horus(reelIndex)
                        },500);
                        horus_arr[reelIndex] = true
                        horus_appear_bonus = true
                    }
            }
            rowIndex = 0;
            i=0
            for (let reelIndex = 0; reelIndex < 5; reelIndex++){
                if(indexes[i]==num_icons-1){
                    results[rowIndex][reelIndex] = iconMap_para[0];
                }
                else{
                    results[rowIndex][reelIndex] = iconMap_para[indexes[i]+1];
                }
                i=i+1
                if(results[rowIndex][reelIndex] == "WILD" && bonus_game_on == false){//horus appears bonus game off
                    horus_arr[reelIndex] = true
                    setTimeout(function(){
                        extend_horus(reelIndex)
                    },500);
                }
                if(results[rowIndex][reelIndex] == "WILD" && bonus_game_on == true){//horus appears bonus game on
                    setTimeout(function(){
                        extend_horus(reelIndex)
                    },500);
                    horus_arr[reelIndex] = true    
                    horus_appear_bonus = true
                }
            }
            rowIndex = 2;
            i=0
            for (let reelIndex = 0; reelIndex < 5; reelIndex++){
                if(indexes[i]==0){
                    results[rowIndex][reelIndex] = iconMap_para[num_icons-1]
                }
                else{
                    results[rowIndex][reelIndex] = iconMap_para[indexes[i]-1]
                }
                i=i+1
                if(results[rowIndex][reelIndex] == "WILD" && bonus_game_on == false){//horus appears bonus game of
                    setTimeout(function(){
                        extend_horus(reelIndex)
                    },500);
                    horus_arr[reelIndex] = true
                }
                if(results[rowIndex][reelIndex] == "WILD" && bonus_game_on == true){//horus appears bonus game on
                    setTimeout(function(){
                        extend_horus(reelIndex)  
                    },500);
                    horus_arr[reelIndex] = true    
                    horus_appear_bonus = true
                } 
            }
            
            if(horus_appear_bonus == true && cases < 6){
                horus_appear_bonus = false
                cases = cases+1
            }

            console.log("sending!!!!!")
            setTimeout(function(){
                for(let rowIndex=0;rowIndex<3;rowIndex++){
                    for(let reelIndex = 0;reelIndex<5;reelIndex++){
                        if(results[rowIndex][reelIndex] == "SCATTER"){
                            SCATTER_count++;
                        }
                    }
                }
                if(SCATTER_count >=3 && bonus_game_on == false){
                    SCATTER_count = 0
                    bonus_game_on = true
                    bonusGameON(iconMap_para);
                }
                SCATTER_count = 0
                const event_send = new CustomEvent('send_two_d', {
                    detail:{
                        array_data: results,
                        amount : bet_amount
                    }
                });
                window.dispatchEvent(event_send);
            },600);

        });
    };

function rollButton(){
    disable_button();
    if(small_horus_backgroundPosition.length != 0 || small_horus_div.length != 0){
        for(let i = 0;i<small_horus_backgroundPosition.length;i++){
            after_extend_horus(small_horus_div[i],small_horus_backgroundPosition[i])
        }
        small_horus_backgroundPosition = [];
        small_horus_div = [];
        small_horus_backgroundPosition.length = 0
        small_horus_div.length = 0
        count_s_div = 0
    }
    stopGlowReel()
    rollAll(iconMap)
}

//button enable disable
function disable_button(){
    const button = document.getElementById('start_button')
    button.disabled = true
}
function enable_button(){
    const button = document.getElementById('start_button')
    button.disabled = false
}

//after roll
function check_cond(iconMap){
    // console.log(results)
    // console.log(SCATTER_count)
    // console.log(typeof(results[0][0]))
    // console.log("bonus game  = "+bonus_game_on)
    console.log("Value of cases  = ",cases)
    horus_arr = [false,false,false,false,false]//for glowing
    //conditions for bonus game
    if(SCATTER_count >=3 && bonus_game_on == true){
        SCATTER_count = 0
        free_games(iconMap);
    }


    if(free_game == 0 && bonus_game_on == true){//bonus game end
        change_reel(0)
        bonus_game_on = false
        console.log("Bonus GAME ENDED !!!!!")
        cases = 0
        count_free = 0
        //hide free game div
        //hide special symbols
        const s_symbol = document.getElementById('special_symbols_div')
        s_symbol.style.visibility = 'hidden'
        enable_button();
    }

    if(free_game>0 && bonus_game_on == true){//auto roll for bonus game
        free_game = free_game - 1
        const free = document.getElementById('free_games_div');
        free.innerHTML = `<span style="color: white; font-weight: bold; text-decoration: underline;">FREE GAMES:  ${free_game}</span>`;

            if(cases == 1){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap1)
                },5000); 
            }
            if(cases == 2){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap2)
                },5000); 
            }
            if(cases == 3){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap3)
                },5000); 
            }
            if(cases == 4){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap4)
                },5000); 
            }
            if(cases == 5){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap5)
                },5000); 
            }
            if(cases == 6){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap_noSCATTER)
                },5000); 
            }
            if(cases == 0){
                setTimeout(function(){
                    change_special_symbols(cases)
                    change_reel(cases)
                    rollAll(iconMap)
                },5000); 
            }
    }
    SCATTER_count = 0
    console.log("Value of free game = "+free_game)
}

//glow reel
function glowReel(elementId,payline) {
    const element = document.getElementById(elementId);
    //complete it
    if (payline == 4) {
        element.classList.add('twinkle_four');
    }
    if (payline == 2) {
        element.classList.add('twinkle_two');
    }
    if (payline == 9) {
        element.classList.add('twinkle_nine');
    }
    if (payline == 6) {
        element.classList.add('twinkle_six');
    }
    if (payline == 10) {
        element.classList.add('twinkle_ten');
    }
    if (payline == 1) {
        element.classList.add('twinkle_one');
    }
    if (payline == 7) {
        element.classList.add('twinkle_seven');
    }
    if (payline == 8) {
        element.classList.add('twinkle_eight');
    }
    if (payline == 3) {
        element.classList.add('twinkle_three');
    }
    if (payline == 5) {
        element.classList.add('twinkle_five');
    }
}

function stopGlowReel() {
    const reels = document.querySelectorAll('.reel');
    const iconContainers = document.querySelectorAll('.icon-container');

    reels.forEach(reel => {
        reel.classList.remove('twinkle_four', 'twinkle_two', 'twinkle_eight', 'twinkle_six', 'twinkle_ten', 'twinkle_one', 'twinkle_seven', 'twinkle_nine', 'twinkle_three', 'twinkle_five');
    });

    iconContainers.forEach(container => {
        container.classList.remove('twinkle_four', 'twinkle_two', 'twinkle_eight', 'twinkle_six', 'twinkle_ten', 'twinkle_one', 'twinkle_seven', 'twinkle_nine', 'twinkle_three', 'twinkle_five');
    });

}
//glow 
function glow_allDiv(divs,payline){
    stopGlowReel();
    for(let i = 0;i<divs.length;i++){
        console.log("me in glow ")
        glowReel(divs[i],payline)
    }
}


//horus extend
function extend_horus(div){
    if(div == 0){
        div = 'reel0'
    }
    if(div == 1){
        div = 'reel1'
    }
    if(div == 2){
        div = 'reel2'
    }
    if(div == 3){
        div = 'reel3'
    }
    if(div == 4){
        div = 'reel4'
    }
    const element = document.getElementById(div);
    const computedStyle = getComputedStyle(element);
    const backgroundPosition = computedStyle.backgroundPosition;
    element.style.backgroundPosition = '0% 0%';
    //change the matrix
    for(let rowIndex = 0;rowIndex<3;rowIndex++){
        for(reelIndex = 0; reelIndex<5;reelIndex++){
            if (results[rowIndex][reelIndex] == "WILD"){
                results[0][reelIndex] = "WILD"
                results[1][reelIndex] = "WILD"
                results[2][reelIndex] = "WILD"
            }
        }
    }

    if (element) {
        element.classList.remove('animate-bg');
        element.offsetHeight;
        element.style.backgroundImage = `url('images/extended-horus.png')`;
        element.offsetHeight;
        element.classList.add('animate-bg');
    }
    setTimeout(function(){
        element.classList.remove('animate-bg');
    },1000);
    small_horus_div[count_s_div] = div
    small_horus_backgroundPosition[count_s_div] = backgroundPosition
    count_s_div = count_s_div+1;
}

function after_extend_horus(div,backgroundPosition){
    if(cases == 1){
        imageURL ='images/bonus_game1.png' 
    }
    if(cases == 2){
        imageURL ='images/bonus_game2.png' 
    }
    if(cases == 3){
        imageURL ='images/bonus_game3.png' 
    }
    if(cases == 4){
        imageURL ='images/bonus_game4.png' 
    }
    if(cases == 5){
        imageURL ='images/bonus_game5.png' 
    }
    if(cases == 6){
        imageURL ='images/bonus_game6.png' 
    }
    if(cases == 0){
        imageURL ='images/default_strip.png' 
    }
    const element = document.getElementById(div);
    element.style.backgroundImage = 'none';
    if (element) {
        element.style.backgroundImage = `url(${imageURL})`;
    }
    element.style.backgroundPosition = backgroundPosition
}

//bonus game 
function bonusGameON(iconMap){
    free_games(iconMap)
    bonus_game_on = true
    console.log("Bonus game true")
    const s_symbol = document.getElementById('special_symbols_div')
    s_symbol.style.visibility = 'visible'
}


function change_special_symbols(cases){
    const imageContainer = document.getElementById('special_symbols_div');
    function toggleImage(newImageUrl) {
        imageContainer.classList.add('fade-out');
        setTimeout(() => {
            imageContainer.style.backgroundImage = `url(${newImageUrl})`;
            imageContainer.classList.remove('fade-out');
            imageContainer.classList.add('fade-in');
            setTimeout(() => {
                imageContainer.classList.remove('fade-in');
            }, 1000); // Match this duration to the CSS transition duration
        }, 1000); // Match this duration to the CSS transition duration
    }
    switch(cases){
        //bonus game on
        case 1:
            toggleImage('images/special_symbol2.png')
            break;
        case 2:
            //change reel
            toggleImage('images/special_symbol3.png')
            break;
        case 3:
            //change reel
            toggleImage('images/special_symbol4.png')
            break;
        case 4:
            //change reel
            toggleImage('images/special_symbol5.png')
            break;
        case 5:
            //change reel
            toggleImage('images/special_symbol6.png')
            break;
        //bonus game off
        case 6 :
            imageContainer.style.backgroundImage = `url(${'images/special_symbol6.png'})`;
            break;
        case 0:
            //change to def_reel
            imageContainer.style.backgroundImage = `url(${'images/special_symbol1.png'})`;
            break;
        default :
            console.log("Out of cases!!!!")
    }    

}
//change reel only inside bonus game
function change_reel(cases){
    const element0 = document.getElementById('reel0')
    const element1 = document.getElementById('reel1')
    const element2 = document.getElementById('reel2')
    const element3 = document.getElementById('reel3')
    const element4 = document.getElementById('reel4')
    const imageContainer = document.getElementById('special_symbols_div');
    
    switch(cases){
        //bonus game on
        case 1:
            element0.style.backgroundImage = `url(${'images/bonus_game1.png'})`;
            element1.style.backgroundImage = `url(${'images/bonus_game1.png'})`;
            element2.style.backgroundImage = `url(${'images/bonus_game1.png'})`;
            element3.style.backgroundImage = `url(${'images/bonus_game1.png'})`;
            element4.style.backgroundImage = `url(${'images/bonus_game1.png'})`;
            break;
        case 2:
            //change reel
            element0.style.backgroundImage = `url(${'images/bonus_game2.png'})`;
            element1.style.backgroundImage = `url(${'images/bonus_game2.png'})`;
            element2.style.backgroundImage = `url(${'images/bonus_game2.png'})`;
            element3.style.backgroundImage = `url(${'images/bonus_game2.png'})`;
            element4.style.backgroundImage = `url(${'images/bonus_game2.png'})`;
            break;
        case 3:
            //change reel
            element0.style.backgroundImage = `url(${'images/bonus_game3.png'})`;
            element1.style.backgroundImage = `url(${'images/bonus_game3.png'})`;
            element2.style.backgroundImage = `url(${'images/bonus_game3.png'})`;
            element3.style.backgroundImage = `url(${'images/bonus_game3.png'})`;
            element4.style.backgroundImage = `url(${'images/bonus_game3.png'})`;
            break;
        case 4:
            //change reel
            element0.style.backgroundImage = `url(${'images/bonus_game4.png'})`;
            element1.style.backgroundImage = `url(${'images/bonus_game4.png'})`;
            element2.style.backgroundImage = `url(${'images/bonus_game4.png'})`;
            element3.style.backgroundImage = `url(${'images/bonus_game4.png'})`;
            element4.style.backgroundImage = `url(${'images/bonus_game4.png'})`;
            break;
        case 5:
            //change reel
            element0.style.backgroundImage = `url(${'images/bonus_game5.png'})`;
            element1.style.backgroundImage = `url(${'images/bonus_game5.png'})`;
            element2.style.backgroundImage = `url(${'images/bonus_game5.png'})`;
            element3.style.backgroundImage = `url(${'images/bonus_game5.png'})`;
            element4.style.backgroundImage = `url(${'images/bonus_game5.png'})`;
            break;
        case 6:
            element0.style.backgroundImage = `url(${'images/bonus_game6.png'})`;
            element1.style.backgroundImage = `url(${'images/bonus_game6.png'})`;
            element2.style.backgroundImage = `url(${'images/bonus_game6.png'})`;
            element3.style.backgroundImage = `url(${'images/bonus_game6.png'})`;
            element4.style.backgroundImage = `url(${'images/bonus_game6.png'})`;
            break;
        //bonus game off
        case 0:
            //change to def_reel
            element0.style.backgroundImage = `url(${'images/default_strip.png'})`;
            element1.style.backgroundImage = `url(${'images/default_strip.png'})`;
            element2.style.backgroundImage = `url(${'images/default_strip.png'})`;
            element3.style.backgroundImage = `url(${'images/default_strip.png'})`;
            element4.style.backgroundImage = `url(${'images/default_strip.png'})`;
            imageContainer.style.backgroundImage = `url(${'images/special_symbol1.png'})`;
            bonus_game_on = false
            break;
        default :
            console.log("Out of cases!!!!")
    }
}

//called only in bonus game
function free_games(iconMap){
    if(count_free == 5){
        change_reel(6)
        //remove the gates
    }
    free_game = free_game+12
    count_free++;
}
function call_glow(coords, payline_glow) {
    return new Promise((resolve) => {
        if (coords.length == 0) {
            resolve();
        }
        for (let i = 0; i < coords.length; i++) {
            setTimeout(() => {
                glow_allDiv(coords[i], payline_glow[i]);
                
                // Resolve after the last element
                if (i == coords.length - 1) {
                    resolve();
                }
            }, i * 2000);
        }

    });
}


//***********************************************************************************************************EVENTS*****************************************************************************************************************
document.addEventListener('DOMContentLoaded', () => {
    const betAmountInput = document.getElementById('bet-amount');

    // Function to parse the bet amount and ensure it's a valid number
    function parseBetAmount() {
        return parseFloat(betAmountInput.value) || 0;
    }

    // Update bet amount
    function updateBetAmount(amount) {
        betAmountInput.value = amount.toFixed(2);
    }

    // Save bet amount on Enter key press
    betAmountInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default Enter key action (like form submission)
            let currentAmount = parseBetAmount();
            if (isNaN(currentAmount) || currentAmount < 0) {
                betAmountInput.value = '0.00';
            } else {
                updateBetAmount(currentAmount);
            }
            console.log('Bet amount saved:', betAmountInput.value); // Debugging log
            won_amount = betAmountInput.value
        }
    });
});


window.addEventListener('receive_two_d', async (event) => {
    payline_glow = event.detail.payline_glow,
    coords = event.detail.coords,
    won_amount = event.detail.won_amount
    console.log("receive 2d ok ")
    console.log(payline_glow)
    console.log(coords)
 
    if(bonus_game_on == true){
        setTimeout(function(){
            call_glow(coords,payline_glow)
        },1000);
        setTimeout(() => {
            call_glow(coords, payline_glow).then(() => {
                console.log("Spinning START !!!!!")
                check_cond(global_iconMap);
            });
        },1000);
    }
    else{
        setTimeout(function(){
            call_glow(coords,payline_glow)
            enable_button();
        },1000);
    }
    const bet_update = document.getElementById('total_won_amount')
    bet_update.innerHTML = `<span style="color: white; font-weight: bold; text-decoration: underline;">TOTAL WON AMOUNT: ${won_amount}</span>`;
}); 

// window.addEventListener('DOMContentLoaded', () => {
//     //dispatch event
// });

// //player ingame amount
// window.addEventListener('player_wallet', (event) =>{
//     player_amount = event.details.player_amount
// })

// function callEvent(name,data) {
//     fetch('https://' + GetParentResourceName() + '/' + name, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
// }

// callEvent("update_player_wallet",won_amount)//for finally updating