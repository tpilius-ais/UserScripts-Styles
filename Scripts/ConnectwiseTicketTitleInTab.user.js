// ==UserScript==
// @name         ConnectWise - Ticket Description in Title
// @author       tpilius-ais
// @version      1.1.0
// @description  TODO
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @noframes     This prevents the script from being loaded twice due to CW's iframes
// @require      https://cdn.jsdelivr.net/npm/toastify-js
// @resource     toastifyCSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

'use strict';

// TODO Rename this.  It is more of a ticket view script more than the tab title at this point.
// TODO add a link to Ninja to show the company's devices in the toolbar.  You will need to create a new group in Ninja which can be done after adding
//      a search filter and then clicking "Save group".  Example url https://app.ninjarmm.com/#/group/247.  Will need to create a manual mapping table for
//      lookup.
//      Example url https://app.ninjarmm.com/#/customerDashboard/19/maintenance
//      Possibly suggest here https://ninjarmm.zendesk.com/hc/en-us/community/topics/360001187411-General-Discussion

let companyId = 0;
let emailDomain = "";
// This is the ID of the user who submitted the ticket.
let ticketUserId = 0;
const connectwiseUrlBase = "https://na.myconnectwise.net/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&companyName=ainfosys";

// #region Functions

// TODO consider breaking this out into its own script.  Used on more than one page.
function SetTabTitle()
{
    // Company View - Add company name to tab title.
    // CompanyFV is when you click on the company while on a ticket.
    // CompanyDetail is when you click on a company from the Company search view.
    if (window.location.href.includes("routeTo=CompanyFV") || window.location.href.includes("CompanyDetail"))
    {
        const companyNameDiv = document.querySelector(".cw_company");
        document.title = companyNameDiv.value;
        return;
    }

    // User View - Adds User name to tab title
    if (window.location.href.includes("ContactFV"))
    {
        const summary = document.querySelector(".detailLabel.cw_CwLabel").innerText;
        document.title = summary;
        return;
    }

    // Ticket View - Adds ticket summary to tab title
    if (window.location.href.includes("ServiceTicket") || window.location.href.includes("ServiceFV"))
    {
        const summary = document.querySelector(".cw_PsaSummaryHeader").value;
        document.title = summary;
        return;
    }

    if (document.title.includes("Manage: "))
    {
        document.title = document.title.replace("Manage: ", "");
    }
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

// Creates a button at the top of the page that copies a pre-formatted link to this ticket, which has the display text as the ticket id + description.
// The link can then be pasted into things like Teams and IT Glue, where it will keep the formatting.
function CreateCopyTeamsLinkButton()
{
    // Only continue if we haven't already added the button
    const ticketTitleElement = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel");
    if (!ticketTitleElement || document.querySelector('.teams-button') !== null)
    {
        return;
    }

    // Create the button
    const copyButton = document.createElement('button');
    copyButton.innerHTML = `<img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Microsoft%20Teams%20Icon.svg" alt="Teams"> Copy Link for Teams`;
    copyButton.classList.add("teams-button");
    copyButton.style.marginLeft = '10px';

    // Adding click event that will copy the formatted link to the clipboard and show a toast notification
    copyButton.addEventListener('click', () =>
    {
        // Copying to clipboard
        const summary = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel").childNodes[0].data;
        const html = `<html><body><a href="${window.location.href}">${summary}</a></body></html>`;
        const blob = new Blob([html], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([clipboardItem]);

        // Showing toast notification to right side of button so user knows it worked.
        Toastify({
            text: "Copied!",
            duration: 1000,
            position: "left",
            offset:
            {
                x: copyButton.getBoundingClientRect().right
            },
        }).showToast();
    });

    // Insert button after the div
    ticketTitleElement.appendChild(copyButton);
}

let customLinksAdded = false;
function AddToolbarCustomLinks()
{
    if (customLinksAdded)
    {
        return;
    }

    // We need these values set otherwise we can't create the links yet
    if (companyId === 0 || emailDomain === "")
    {
        return;
    }

    // Looks like I do need to hijack one of the existing buttons in order to get things to layout properly
    const originalButton = document.querySelector(".cw_ToolbarButton_Help");
    originalButton.style.left = "400px";

    // Stripping out original event handlers
    const cloned = originalButton.cloneNode(true);
    originalButton.replaceWith(cloned);

    // Empty out the div so we can add whatever we want to it.
    cloned.firstChild.remove();

    const html = `<span class="custom-toolbar-button">
                    <a href="https://ainfosys.itglue.com/links/connectwise/org/${companyId}" target="_blank">
                        <img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/ITGlue.png"> IT Glue
                    </a>
                  </span>
                  <span class="custom-toolbar-button">
                    <a href="https://admin.cloud.microsoft/?delegatedOrg=${emailDomain}" target="_blank">
                        <img src='https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/M365.ico'> M365 Admin
                    </a>
                  </span>
                  <span class="custom-toolbar-button">
                    <a href="https://admin.cloud.microsoft/exchange?delegatedOrg=${emailDomain}" target="_blank">
                        <img src='https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Exchange.ico'> Exchange Admin
                    </a>
                  </span>
                  <span class="custom-toolbar-button">
                    <a href="https://cipp.ainfosys.com/?tenantFilter=${emailDomain}" target="_blank">
                        <img src='https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/CIPP.ico'> CIPP
                    </a>
                  </span>`;
    cloned.innerHTML = html;

    customLinksAdded = true;
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

        // UserID and email domain
        if (this.responseURL.includes("GetServiceTicketDetailViewAction.rails"))
        {
            const response = JSON.parse(this.responseText);
            ticketUserId = response.data.action.serviceTicketViewModel.companyPodViewModel.contact.id;

            const emailAddress = response.data.action.serviceTicketViewModel.companyPodViewModel.emailAddress;
            emailDomain = emailAddress.split("@")[1];
        }
    });
    open.apply(this, arguments);
};

// Loading toastify CSS, since there is no built in support with @require
GM_addStyle(GM_getResourceText("toastifyCSS"));

function MainLogic()
{
    SetTabTitle();

    // These should only be run on the service ticket page
    if (!(window.location.href.includes("ServiceTicket") || window.location.href.includes("ServiceFV")))
    {
        return;
    }

    CreateNewTabLinks();
    CreateCopyTeamsLinkButton();
    AddToolbarCustomLinks();
}

setInterval(MainLogic, 3000);