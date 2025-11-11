// ==UserScript==
// @name         ConnectWise - Customization
// @version      2025-10-07
// @description  0.0.0
// @author       Tim Pilius
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @top-level-await
// ==/UserScript==

// TODO document what it does
// TODO rename script
// TODO should I just combine everything ConnectWise into one script and then have feature toggles?
// TODO make this click the search button every minute to make sure the board is updated as fast as possible.
// TODO can I play sounds with just javascript?  I want it to play a sound when there are entries in the result list.
// TODO make sure this works reliably on the service board view
// TODO this doesn't work if I go from Contact Search -> Service tab

'use strict';

// Maps Name -> Index
let columnMap = new Map();

// Only want to run on Dispatch Portal, Ticket Search, or Service Board pages
function UpdateTableRows()
{
    // Needs to be done every time in case the user navigates to a different page.  Each grid can potentially have a different column layout
    columnMap = new Map();
    const start = performance.now();

    // Finding all rows from the bottom table
    let allRows = document.getElementsByClassName("cw-ml-row");

    if (allRows.length === 0)
    {
        console.log("No rows found, nothing to update.");
        return;
    }

    // TODO first row isn't clickable
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
    return columnMap.get(columnName);
}

//TODO seconds
function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function TrySetupGridObserver()
{
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

        UpdateTableRows();
    }
}

// Will attempt to re-setup things anytime a link is clicked to a different page
window.addEventListener('popstate', async function ()
{
    console.log("Url changed");
    TrySetupGridObserver();
});

// Otherwise we will need to do the initial setup, like when we open a new tab
TrySetupGridObserver();
