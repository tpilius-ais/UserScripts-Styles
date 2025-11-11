// ==UserScript==
// @name        Pia Test
// @version      0.0.0
// @description  TODO
// @author       Tim Pilius
// @match       https://ainfosys.pia.ai/Pia/CWEmbed*
// ==/UserScript==

function Main()
{
    let piaImageElement = document.querySelector("#pia-image");
    if (piaImageElement)
    {
        piaImageElement.remove();
    }

    let piaHeaderElement = document.querySelector(".pia-header");
    if (piaHeaderElement)
    {
        if (piaHeaderElement.querySelector('img') !== null)
        {
            return;
        }

        // Create the button
        const img = document.createElement('img');
        img.src = "https://images.steamusercontent.com/ugc/182794793964664573/85F65479DD67B942FE5087A4D541CC165E2A9A2B/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false";
        // img.style.marginLeft = '10px';

        // Insert button after the div
        piaHeaderElement.prepend(img);
    }
}

setInterval(Main, 3000);
// <div style="width:200px;height:83px;overflow:hidden;position:relative;">
//     <img src="https://images.steamusercontent.com/ugc/182794793964664573/85F65479DD67B942FE5087A4D541CC165E2A9A2B/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"
//         style="position:absolute;width:900px;height:375px;left:-350px; top:-146px;" />
// </div>

//     <img src="https://images.steamusercontent.com/ugc/182794793964664573/85F65479DD67B942FE5087A4D541CC165E2A9A2B/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"
//         style="position:absolute;width:900px;height:375px;left:-350px; top:-146px;" />
