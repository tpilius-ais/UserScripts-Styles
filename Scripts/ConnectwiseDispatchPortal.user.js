// ==UserScript==
// @name         ConnectWise - Customization
// @version      2025-10-07
// @description
// @author       Tim Pilius
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @grant        GM_registerMenuCommand
// @top-level-await
// ==/UserScript==

// TODO figure out how to publish privately.  Can it pull from a private github repo?  Figure out what attributes I need to include.
// TODO document what it does
// TODO rename script
// TODO should I just combine everything ConnectWise into one script and then have feature toggles?
// TODO make this click the search button every minute to make sure the board is updated as fast as possible.
// TODO can I play sounds with just javascript?
// TODO make sure this works reliably on the service board view

// TODO play around with this menu option
// GM_registerMenuCommand("Hello, world (simple)", () => alert("Hello, world!"));

'use strict';

// Only want to run on Dispatch Portal, Ticket Search, or Service Board pages
function UpdateTableRows()
{
    const start = performance.now();

    // Finding all rows from the bottom table
    let allRows = document.getElementsByClassName("cw-ml-row");

    if (allRows.length === 0)
    {
        console.log("No rows found, nothing to update.");
        return;
    }

    for (var i = 0; i < allRows.length; i++)
    {
        const row = allRows[i];

        // Finding the "Ticket #" cell
        const ticketCell = row.querySelector(`[cellindex="${FindColumnIndex("Ticket #")}"] div a`);
        if (ticketCell === null)
        {
            continue;
        }

        const ticketId = ticketCell.innerText;
        const ticketUrl = `https://na.myconnectwise.net/v2025_1/connectwise.aspx?fullscreen=false&locale=en_US#startscreen=sr150&` +
            `state=%7B%22p%22:%22sr150%22,%20%22s%22:%7B%22p%22:%7B%22pid%22:184,%20%22rd%22:${ticketId},%20%22screenid%22:%22sr100%22%7D%7D%7D`;

        // Adds link that can be clicked with middle mouse button
        ticketCell.target = "_blank";
        ticketCell.href = `${ticketUrl}`;
        // Prevents ConnectWise from changing the view from the Dispatch portal to the ticket when you left click it.  Will instead open in a new tab.
        ticketCell.className = "";

        // Adding a url to the existing description link that is unclickable
        const descriptionLink = row.querySelector(`[cellindex="${FindColumnIndex("Summary Description")}"] div a`);
        if (descriptionLink === null)
        {
            continue;
        }
        descriptionLink.target = "_blank";
        descriptionLink.href = `${ticketUrl}`;
        descriptionLink.className = "";
    }

    console.log("Search results updated");

    const end = performance.now();
    // console.log(`Took ${(end - start).toFixed(2)} ms`);
}

// Maps Name -> Index
const columnMap = new Map();
// TODO comment
function FindColumnIndex(columnName)
{
    if (columnMap.size !== 0)
    {
        return columnMap.get(columnName);
    }

    const columns = document.querySelectorAll("div.cw-ml-header tr.GMDB3DUBCFI:nth-child(1) td");
    for (var i = 0; i < columns.length; i++)
    {
        const name = columns[i].querySelector("span").innerText;
        columnMap.set(name, i);
    }
}

//TODO seconds
function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Setting up observer on bottom grid view.  Will retry until we find it.
if (window.location.href.includes("DispatchSchedule")
    || window.location.href.includes("ServiceSearchList")
    || window.location.href.includes("ServiceBoard")
    || window.location.href.includes("ContactServiceList"))
{
    console.log("Trying to setup grid view observer...");
    let target;
    while (!(target = document.querySelector(".GMDB3DUBBXF.mm_grid")))
    {
        await delay(1000);
    }
    const observer = new MutationObserver(UpdateTableRows);
    observer.observe(target, { childList: true, subtree: true });
    console.log("Observing grid view for changes...");

}

// Setting up refresh button clicker.  To click once a minute
// TODO should probably make the refresh timing configurable
// setInterval(() =>
// {
//     var element = document.querySelector(".cw-toolbar-search.cw-ml-search-button");
//     element.click();
//     console.log("Clicky clicky");
// }, 5000);