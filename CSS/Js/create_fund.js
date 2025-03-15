function addDiv() {
    const newDiv = document.createElement("div");
    newDiv.classList.add("new-div");
    newDiv.textContent = "New Div!";
    
    document.getElementById("container").appendChild(newDiv);
}