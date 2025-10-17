// ==UserScript==
// @name         Connectwise - Ticket Description in Title
// @version      2025-10-07
// @description
// @author       Tim Pilius
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @grant        none
// ==/UserScript==

'use strict';

setInterval(setTitle, 3000);

//TODO test out using mutation observer will work here
function setTitle()
{
    if (document.title.includes("Manage: "))
    {
        document.title = document.title.replace("Manage: ", "");
    }
    // Only want to get the ticket description if we're on the ticket screen.
    if (!window.location.href.includes("ServiceTicket"))
    {
        return;
    }


    const summary = document.getElementsByClassName("cw_PsaSummaryHeader")[0].value;
    document.title = summary;
}