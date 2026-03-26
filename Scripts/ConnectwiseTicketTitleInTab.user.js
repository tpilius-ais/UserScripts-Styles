// ==UserScript==
// @name         ConnectWise - Ticket Description in Title
// @version      0.0.2
// @description  TODO
// @author       Tim Pilius
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @top-level-await
// ==/UserScript==

'use strict';
// TODO rename this script in both @name and on the file system.  Anyone who had this installed will need to delete + reinstall the script
// TODO try to setup the mutation observer one more time
// TODO Figure out why the CPU usage is so high on this.  Might be related to the grid observers in the other connectwise script.

let companyId = 0;
// This is the ID of the user who submitted the ticket.
let ticketUserId = 0;
const connectwiseUrlBase = "https://na.myconnectwise.net/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&companyName=ainfosys";

function MainLogic()
{
    const start = performance.now();
    SetTabTitle();

    // These should only be run on the service ticket page
    if (!(window.location.href.includes("ServiceTicket") || window.location.href.includes("ServiceFV")))
    {
        return;
    }
    CreateNewTabLinks();
    CreateCopyTeamsLinkButton();

    // const end = performance.now();
    // console.log(`Took ${(end - start).toFixed(2)} ms`);
}

setInterval(MainLogic, 3000);

// TODO maybe break this out into another script.  Or just combine everything connectwise related into one script.
function SetTabTitle()
{
    // Add company name to tab title.
    // CompanyFV is when you click on the company while on a ticket.
    // CompanyDetail is when you click on a company from the Company search view.
    if (window.location.href.includes("routeTo=CompanyFV") || window.location.href.includes("CompanyDetail"))
    {
        const companyNameDiv = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel");
        document.title = companyNameDiv.innerText;
        return;
    }

    if (document.title.includes("Manage: "))
    {
        document.title = document.title.replace("Manage: ", "");
        return;
    }

    // Only want to get the ticket description if we're on the ticket screen.
    // TODO this doesn't always reliably work.  Like if you copy + paste the link you get in "Share"
    if (window.location.href.includes("ServiceTicket") || window.location.href.includes("ServiceFV"))
    {
        const summary = document.querySelector(".cw_PsaSummaryHeader").value;
        document.title = summary;
        return;
    }
}

// TODO rename, absolutely horrible name.
// TODO comment
function CreateNewTabLinks()
{
    // TODO comment
    // Will only run if the Company link has not already been created.
    if (companyId !== 0 && document.querySelector("#companyLink") === null)
    {
        const targetUrl = `${connectwiseUrlBase}&recordType=CompanyFV&recid=${companyId}`;
        const targetDiv = document.querySelector(".gwt-Label.mm_label.GMDB3DUBNLI.GMDB3DUBLLI[title=Company]");

        // ConnectWise adds a bunch of event handles that make you navigate away from the current page.
        // Cloning so theres no event handlers, which makes left click open a new tab.
        const newEl = targetDiv.cloneNode(true);
        targetDiv.replaceWith(newEl);

        // Adds link that will open a new tab
        newEl.innerHTML = `<a id="companyLink" href="${targetUrl}" target="_blank">Company</a>`;
    }

    // TODO comment
    if (ticketUserId !== 0 && document.querySelector("#userLink") === null)
    {
        const targetUrl = `${connectwiseUrlBase}&recordType=ContactFV&recid=${ticketUserId}`;
        const targetDiv = document.querySelector(".gwt-Label.mm_label.GMDB3DUBNLI.GMDB3DUBLLI[title=Contact]");

        // ConnectWise adds a bunch of event handles that make you navigate away from the current page.
        // Cloning so theres no event handlers, which makes left click open a new tab.
        const newEl = targetDiv.cloneNode(true);
        targetDiv.replaceWith(newEl);

        // Adds link that will open a new tab
        newEl.innerHTML = `<a id="userLink" href="${targetUrl}" target="_blank">Contact</a>`;
    }
}

// Creates a button at the top of the page that copies a pre-formatted link to this ticket, which has the display text as the ticket id + description.
// The link can then be pasted into things like Teams and IT Glue, where it will keep the formatting.
function CreateCopyTeamsLinkButton()
{
    const ticketTitleElement = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel");
    if (!ticketTitleElement)
    {
        return;
    }

    if (ticketTitleElement.querySelector('button') !== null)
    {
        return;
    }

    // Create the button
    const copyBtn = document.createElement('button');
    // TODO swap this over to the copy hosted in this repo
    copyBtn.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/0/07/Microsoft_Office_Teams_%282025%E2%80%93present%29.svg" alt="Teams"> Copy Link for Teams`;
    copyBtn.classList.add("teams-button");
    copyBtn.style.marginLeft = '10px';

    // Insert button after the div
    ticketTitleElement.appendChild(copyBtn);

    // Add click event
    copyBtn.addEventListener('click', () =>
    {
        const summary = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel").childNodes[0].data;
        const html = `<html><body><a href="${window.location.href}">${summary}</a></body></html>`;
        const blob = new Blob([html], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([clipboardItem]);
    });
}

// Intercepts requests the browser makes, and stores the results for our use later.
const open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function ()
{
    this.addEventListener("load", function ()
    {
        // Grabs the company id
        if (this.responseURL.includes("GetCompanyNameAction.rails"))
        {
            const response = JSON.parse(this.responseText);
            companyId = response.data.action.companyRecID;
        }

        if (this.responseURL.includes("GetServiceTicketDetailViewAction.rails"))
        {
            const response = JSON.parse(this.responseText);
            ticketUserId = response.data.action.serviceTicketViewModel.companyPodViewModel.contact.id;
        }
    });
    open.apply(this, arguments);
};