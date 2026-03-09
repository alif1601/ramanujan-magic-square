// simple demo analytics animation

function animateValue(id,start,end,duration){

let obj=document.getElementById(id);
let range=end-start;
let current=start;
let increment=end>start?1:-1;
let stepTime=Math.abs(Math.floor(duration/range));

let timer=setInterval(function(){

current+=increment;
obj.textContent=current;

if(current==end){
clearInterval(timer);
}

},stepTime);

}

animateValue("visitors",0,1240,1500);
animateValue("squares",0,4820,1500);
