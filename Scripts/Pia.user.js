// ==UserScript==
// @name        Pia Test
// @version      0.0.0
// @description  TODO
// @author       Tim Pilius
// @match       https://ainfosys.pia.ai/Pia/CWEmbed*
// ==/UserScript==


let isSetup = false;
// Fun little tweak to PiaBot
function Main()
{
    if (isSetup)
    {
        return;
    }

    // Remove the original PiaBot image
    const piaImageElement = document.querySelector("#pia-image");
    if (piaImageElement)
    {
        piaImageElement.remove();
    }

    // Finds the header where we'll insert our image
    const piaHeaderElement = document.querySelector(".pia-header");
    if (!piaHeaderElement)
    {
        return;
    }

    // Create Sauron image element and add it to the existing header
    const img = document.createElement('img');
    img.src = "https://images.steamusercontent.com/ugc/182794793964664573/85F65479DD67B942FE5087A4D541CC165E2A9A2B/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false";
    piaHeaderElement.prepend(img);

    piaHeaderElement.style.paddingLeft = 0;
    piaHeaderElement.style.setProperty('height', '180px', 'important');

    isSetup = true;
}

setInterval(Main, 2000);