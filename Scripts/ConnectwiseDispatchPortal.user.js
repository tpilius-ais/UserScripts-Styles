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
// TODO should I just combine everything ConnectWise into one script and then have feature toggles?  Will need to rename script
// TODO this whole thing needs to be cleaned up in general
// TODO rename this script

'use strict';

// #region Functions

// Maps Name -> Index
let columnMap = new Map();

// Goes through all of the table rows and replaces the contents of each 'Ticket #' and 'Summary Description' cell with
// a link to the ticket that can be middle clicked to open in a new tab
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

    // console.log("Search results updated");

    const end = performance.now();
    // console.log(`Took ${(end - start).toFixed(2)} ms`);
}

let previousRowCount = 0;
let previousRows = [];
let firstRun = true;
// TODO make this click the search button every minute to make sure the board is updated as fast as possible.
function MonitorBoardTickets()
{
    // This should only run on the dispatch schedule page, since this is where I keep track of tickets coming in.
    if (!window.location.href.includes("DispatchSchedule"))
    {
        return;
    }

    // Don't want to notify on first page load since its annoying.
    if (firstRun)
    {
        firstRun = false;
        return;
    }

    //TODO might not need this logic just yet.
    const parsedRows = [];
    // Finding all rows from the bottom table, running through them and extract what info I need
    let allRows = document.getElementsByClassName("cw-ml-row");
    for (var i = 0; i < allRows.length; i++)
    {
        const row = allRows[i];

        // Finding the cells that we're interested in
        const ticketCell = row.querySelector(`[cellindex="${FindColumnIndex("Ticket #")}"] div a`);
        const statusCell = row.querySelector(`[cellindex="${FindColumnIndex("Status")}"] div`);
        const updatedCell = row.querySelector(`[cellindex="${FindColumnIndex("Last Update")}"] div`);

        parsedRows.push(new TableRow(ticketCell.innerText, statusCell.innerText, updatedCell.innerText));
    }

    ShouldNotify(parsedRows);
    previousRows = parsedRows;
}

// TODO comment.  Crappy name and should be refactored.
// TODO make this only notify if new tickets are added or if the status of an existing one changed.
function ShouldNotify(parsedRows)
{
    // If there are no rows then why are we notifying?
    if (parsedRows.length === 0)
    {
        return;
    }

    // Build lookup of previous tickets by ticket number
    const prevMap = new Map();
    for (const row of previousRows)
    {
        prevMap.set(row.ticketNum, row.status);
    }

    // If ticket count decreased, only notify if any remaining ticket changed status
    if (parsedRows.length < previousRows.length)
    {
        for (const row of parsedRows)
        {
            const prevStatus = prevMap.get(row.ticketNum);

            // New ticket appeared unexpectedly or status changed
            if (prevStatus === undefined || prevStatus !== row.status)
            {
                SendNotification("Ticket status changed!");
                return;
            }
        }

        // Count decreased and no status changes → do not notify
        return;
    }

    // If the row count increased then we should play a sound.
    if (parsedRows.length > previousRows.length)
    {
        //TODO give a better message
        SendNotification("There are new tickets to look at!");
        return;
    }

    //TODO If any of the current ticket statuses are different than the previous check -> notify
}

//TODO comment
async function SendNotification(message)
{
    if (Notification.permission === 'default')
    {
        await Notification.requestPermission();
    }
    if (Notification.permission === 'granted')
    {
        new Notification('ConnectWise', { body: message });
    }
}

// TODO give a better name
class TableRow
{
    constructor(ticketNum, status, lastUpdate)
    {
        this.ticketNum = ticketNum;
        this.status = status;
        this.lastUpdate = lastUpdate;
    }
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

// #endregion Functions

async function TrySetupGridObserver()
{
    // Setting up observer on grid view.  Will retry until we find it.
    // Only want to run on Dispatch Portal, Ticket Search, or Service Board pages
    if (window.location.href.includes("DispatchSchedule")
        || window.location.href.includes("ServiceSearchList")
        || window.location.href.includes("ServiceBoard")
        || window.location.href.includes("ContactServiceList")
        || window.location.href.includes("CompanyServiceList")
        || window.location.href.includes("routeTo=CompanyFV")
        || window.location.href.includes("routeTo=ContactFV"))
    {
        console.log("Trying to setup grid view observer...");
        let target;
        while (!(target = document.querySelector(".GMDB3DUBBXF.mm_grid")))
        {
            await delay(1000);
        }
        // Sets up actions that run anytime the grid updates
        const observer = new MutationObserver(() =>
        {
            UpdateTableRows();
            MonitorBoardTickets();
        });
        observer.observe(target, { childList: true, subtree: true });
        console.log("Observing grid view for changes...");

        // Run these once on page load
        UpdateTableRows();
        MonitorBoardTickets();

        // Setting up refresh button clicker.  To make sure that the grid is being updated even when it isn't in focus in its own tab.
        // TODO should probably make the refresh timing configurable, and make this a bit more robust
        // TODO this messes with the "dont notify on first page load" logic
        setInterval(() =>
        {
            var element = document.querySelector(".cw-toolbar-search.cw-ml-search-button");
            element.click();
            console.log("Clicky clicky");
        }, 600000);
    }
}

// Will attempt to re-setup things anytime a link is clicked to a different page
window.addEventListener('popstate', async function ()
{
    TrySetupGridObserver();
});

// Otherwise we will need to do the initial setup, like when we open a new tab
TrySetupGridObserver();