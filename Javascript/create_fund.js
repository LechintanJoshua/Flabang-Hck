const btn=document.querySelector(".card");
let cnt=0;
btn.addEventListener("click",New)
function New(){
    const fund_card=document.createElement("div");
    fund_card.className="card";
    const imagine = document.createElement('img');
    imagine.src=""
    const text=document.createElement("h1");
    text.textContent=`This is the ${cnt} donation`;
    cnt++;
    fund_card.append(text);
    document.body.appendChild(fund_card);
}