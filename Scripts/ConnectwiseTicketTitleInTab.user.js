// ==UserScript==
// @name         ConnectWise - Ticket Description in Title
// @author       tpilius-ais
// @version      0.0.2
// @description  TODO
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @noframes     This prevents the script from being loaded twice due to CW's iframes
// ==/UserScript==

'use strict';

// TODO Figure out why the CPU usage is so high on this.  Might be related to the grid observers in the other connectwise script.
//      Could also just us booleans to determine if there is anything to do or if the changes have already been applied
// TODO add a link to IT Glue on the main bar, using this URL  https://ainfosys.itglue.com/links/connectwise/org/[companyrecordid].
//      companyRecordId is the same companyId we already have.
// TODO add a link to Ninja to show the company's devices in the toolbar.  You will need to create a new group in Ninja which can be done after adding
//      a search filter and then clicking "Save group".  Example url https://app.ninjarmm.com/#/group/247.  Will need to create a manual mapping table for
//      lookup.

let companyId = 0;
// This is the ID of the user who submitted the ticket.
let ticketUserId = 0;
const connectwiseUrlBase = "https://na.myconnectwise.net/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&companyName=ainfosys";

// #region Functions

// TODO consider breaking this out into its own script.  Used on more than one page.
let tabTitleSet = false;
function SetTabTitle()
{
    if (tabTitleSet)
    {
        return;
    }

    // Add company name to tab title.
    // CompanyFV is when you click on the company while on a ticket.
    // CompanyDetail is when you click on a company from the Company search view.
    if (window.location.href.includes("routeTo=CompanyFV") || window.location.href.includes("CompanyDetail"))
    {
        const companyNameDiv = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel");
        document.title = companyNameDiv.innerText;
    }

    if (document.title.includes("Manage: "))
    {
        document.title = document.title.replace("Manage: ", "");
    }

    // Adds ticket summary to tab title
    if (window.location.href.includes("ServiceTicket") || window.location.href.includes("ServiceFV"))
    {
        const summary = document.querySelector(".cw_PsaSummaryHeader").value;
        document.title = summary;
    }

    tabTitleSet = true;
}

// TODO rename, absolutely horrible name.  Comment as well.
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
        newEl.innerHTML = `<a id="companyLink" href="${targetUrl}" target="_blank" style="color: #551A8B">Company</a>`;
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
        newEl.innerHTML = `<a id="userLink" href="${targetUrl}" target="_blank" style="color: #551A8B">Contact</a>`;
    }
}

// TODO make it so that a "Link Copied" toast notification shows up when you click the button.
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
    copyBtn.innerHTML = `<img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Microsoft%20Teams%20Icon.svg" alt="Teams"> Copy Link for Teams`;
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

let applied = false;
function AddITGlueButtonToToolbar()
{
    if (applied)
    {
        return;
    }

    // TODO just make a brand new element and manually position it at the end.  Cloning and all this isn't worth the hassle
    const originalButton = document.querySelector(".cw_ToolbarButton_Time");
    originalButton.style.left = "469px";

    // // Stripping out original event handlers
    const cloned = originalButton.cloneNode(true);
    originalButton.replaceWith(cloned);

    // Remove all child nodes
    cloned.firstChild.remove();

    //
    // Add our link
    const link = document.createElement('a');
    link.href = `https://ainfosys.itglue.com/links/connectwise/org/${companyId}`;
    link.target = "_blank";
    // TODO use image from repo
    link.innerHTML = "<img src='https://www.google.com/s2/favicons?sz=64&domain=itglue.com' style='height:16px; width=16px'> IT Glue";

    cloned.appendChild(link);

    // Makes things redraw correctly so that all of the icons are aligned correctly again
    originalButton.style.left = "469px";
    applied = true;
}

// #endregion

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
    AddITGlueButtonToToolbar();

    // const end = performance.now();
    // console.log(`Took ${(end - start).toFixed(3)} ms`);
}

setInterval(MainLogic, 3000);