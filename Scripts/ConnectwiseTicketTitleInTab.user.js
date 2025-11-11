// ==UserScript==
// @name         ConnectWise - Ticket Description in Title
// @version      0.0.0
// @description  TODO
// @author       Tim Pilius
// @match        https://na.myconnectwise.net/*
// @icon         https://www.connectwise.com/globalassets/media/logos/company-logos/connectwise-logo-favicon.png
// @top-level-await
// ==/UserScript==

'use strict';
// TODO see if I can set it up so that when you ctrl+click the company it will take you to the company in a new tab.
// See if I can do the same for the contact.
//  https://na.myconnectwise.net/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&recordType=CompanyFV&recid=23675&companyName=ainfosys


//TODO see if mutation observer can help us here.  Seems like it might be more trouble than its worth
function setTitle()
{
    if (document.title.includes("Manage: "))
    {
        document.title = document.title.replace("Manage: ", "");
        return;
    }

    // Only want to get the ticket description if we're on the ticket screen.
    // TODO this doesn't always reliably work.  Like if you copy + paste the link you get in "Share"
    if (!window.location.href.includes("ServiceTicket"))
    {
        return;
    }

    const summary = document.querySelector(".cw_PsaSummaryHeader").value;
    document.title = summary;
}

// TODO comment and cleanup
function CreateCopyTeamsLinkButton()
{
    if (!window.location.href.includes("ServiceTicket"))
    {
        return;
    }

    let ticketTitleElement = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel");
    if (ticketTitleElement)
    {
        if (ticketTitleElement.querySelector('button') !== null)
        {
            return;
        }

        // Create the button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy Link for Teams';
        copyBtn.style.marginLeft = '10px';

        // Insert button after the div
        ticketTitleElement.appendChild(copyBtn);

        // Add click event
        copyBtn.addEventListener('click', () =>
        {
            //TODO this looks awful
            const summary = document.querySelector(".gwt-Label.mm_label.GMDB3DUBDDL.detailLabel.cw_CwLabel")
                .innerText
                .replace("Copy Link for Teams", "");
            const html = `
                       <html><body>
<a href="${window.location.href}">${summary}</a>
</body>
</html>
                        `;

            const blob = new Blob([html], { type: "text/html" });
            const clipboardItem = new ClipboardItem({ "text/html": blob });
            navigator.clipboard.write([clipboardItem])
                .then(() => console.log("HTML copied to clipboard"))
                .catch(err => console.error("Failed to copy:", err));

        });
    }
}

function Main()
{
    setTitle();
    CreateCopyTeamsLinkButton();
}

setInterval(Main, 3000);

// console.log("Trying to setup title observer...");
// const observer = new MutationObserver(setTitle);
// observer.observe(document.querySelector("title"), { childList: true, subtree: true });

// await delay(10000);
// setTitle()


