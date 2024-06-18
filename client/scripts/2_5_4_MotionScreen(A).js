// Code to disable motion actuation to prevent accidental actuation

//This code presntly require more study as its highly contest specific and may not be applicable to all the cases.
//so to deternmine the applicability of this code, we need to study the context of the application and the use of motion actuation in the application.
//for now we can sollve this by avoiding acidental button or link click by disabling them
function disableMotionActuation() {
    var blankWindow = document.createElement("div");
    blankWindow.style.position = 'fixed';
    blankWindow.style.top = '0';
    blankWindow.style.left = '0';
    blankWindow.style.right = '0';
    blankWindow.style.width = '100%';
    blankWindow.style.height = '100%';
    blankWindow.style.backgroundColor = 'rgba(255, 255, 255, 0.005)'; // White with some transparency
    blankWindow.style.zIndex = '-999'; // Ensure it's on top of other elements

   
    // Creating button
    console.log("Disable button");
    var button = document.createElement("button");
    button.style.border = 'none';
    button.style.backgroundImage = 'url(https://clipart-library.com/images_k/play-button-icon-transparent/play-button-icon-transparent-8.jpg)';
    button.style.backgroundSize = 'cover';
    button.style.backgroundColor = 'rgba(0, 255, 0, 0.7)';
    button.style.fontSize = '20px';
    button.style.color = 'white';
    button.style.padding = '0';
    button.style.borderRadius = '50%'; 
    button.style.width = '23px'; 
    button.style.height = '23px';
    button.style.lineHeight = '20px'; 
    button.style.position = 'fixed';
    button.style.top = '56px'; 
    button.style.right = '30px'; 
    button.style.zIndex = '100001';
    button.style.cursor = 'pointer';
    button.style.backgroundColor = 'rgba(255, 69, 0, 0.8)';   

    button.addEventListener('mouseenter', function() {
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.lineHeight = '26px'; 
    });
    
    // Restore button size on mouse leave
    button.addEventListener('mouseleave', function() {
        button.style.width = '23px';
        button.style.height = '23px';
        button.style.lineHeight = '20px'; 
    });
    //we disable all link by just making it not clickable
    button.onclick=function(){
        var swap= blankWindow.style.zIndex;
        if(swap=='-999'){
            button.style.backgroundImage = 'url(https://png.pngtree.com/png-vector/20190129/ourmid/pngtree-pause-vector-icon-png-image_355975.jpg)';
            blankWindow.style.zIndex='10001';
            button.style.backgroundColor = 'rgba(255, 69, 0, 0.8)';  
        }
        else{
            button.style.backgroundImage = 'url(https://clipart-library.com/images_k/play-button-icon-transparent/play-button-icon-transparent-8.jpg)';

            blankWindow.style.zIndex='-999';
            button.style.backgroundColor = 'rgba(0, 255, 0, 0.7)'; 

        }
    }
    

     // Append the blank window to the body,this reduces workload of disabling all link
     //it prevents any kind of click event so no link works,we obtained saame goal with less workload
     document.body.appendChild(blankWindow);
    // Appending button to the body
    document.body.appendChild(button);
    
}

//disableMotionActuation();
setTimeout(() => {
    disableMotionActuation();
}, 10);
