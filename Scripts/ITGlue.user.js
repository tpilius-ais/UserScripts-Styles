// ==UserScript==
// @name         IT Glue Tweaks
// @author       tpilius-ais
// @version      0.2.0
// @description  // TODO
// @match        https://ainfosys.itglue.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=itglue.com
// ==/UserScript==
// TODO document both here and on the readme
// TODO Play around with replacing tags like [SPAM FILTER] with a color coded badge.
'use strict';

// Cleans up the tab title so it is actually more readable and useful.
function SetTabTitle()
{
    // Makes it so that the document name is actually readable in the tab title, and not just cut off because "Documents -" at the beginning.
    if (document.title.includes("Documents - "))
    {
        const orgName = GetFormattedOrgName();
        document.title = document.title.replace("Documents - ", `${orgName} - `);
    }
    // Removes IT Glue from the tab since I already know what site I'm on.
    if (document.title.includes(" — IT Glue"))
    {
        document.title = document.title.replace(" — IT Glue", "");
    }

    // Prepends the client name to these pages
    // TODO figure out if this could be more generic so it applies to all of the pages
    if (document.title === "Documents")
    {
        const orgName = GetFormattedOrgName();
        document.title = `${orgName} - Documents`;
    }
    if (document.title === "Passwords")
    {
        const orgName = GetFormattedOrgName();
        document.title = `${orgName} - Passwords`;
    }
    if (document.title === "Printing")
    {
        const orgName = GetFormattedOrgName();
        document.title = `${orgName} - Printing`;
    }
}

// Adds a button that will allow the user to easily copy a formatted link to use in Team, Notion, or elsewhere.
// This link will be formatted so that the display text is of the format "[Client] - Document Title", while still linking to the correct page.
function CreateCopyTeamsLinkButton()
{
    // This is only necessary on document pages.
    if (!window.location.href.includes("docs"))
    {
        return;
    }

    const pageHeaderContainer = document.querySelector(".react-page-header__left");
    if (!pageHeaderContainer)
    {
        // Nothing to do since we couldn't find the header
        return;
    }

    // Remove the old button and readd it.  This is so that it will always be to the right of the edit button.
    const existingButton = pageHeaderContainer.querySelector('button.teams-button');
    if (existingButton !== null)
    {
        existingButton.remove();
    }

    // Create the button
    const copyBtn = document.createElement('button');
    // TODO swap this over to a the copy hosted in this repo
    copyBtn.innerHTML = `<img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Microsoft%20Teams%20Icon.svg" alt="Teams"> Copy Link for Teams`;
    copyBtn.classList.add("teams-button");

    // Insert button after the div
    pageHeaderContainer.appendChild(copyBtn);

    // Add click event
    copyBtn.addEventListener('click', () =>
    {
        const title = document.querySelector("h1.doc-title--view").innerText;
        const html = `<html><body><a href="${window.location.href}">${GetFormattedOrgName()} - ${title}</a></body></html>`;

        const blob = new Blob([html], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([clipboardItem]);
    });
}

function CreateCopyTeamsLinkButton_Passwords()
{
    // Only creating this button on the passwords page
    if (!window.location.href.includes("passwords"))
    {
        return;
    }

    const sidebarButtonsContainer = document.querySelector(".sidebar-buttons-section .buttons");
    if (!sidebarButtonsContainer)
    {
        return;
    }

    // Remove the old button and readd it.  This is so that it will always be to the right of the edit button.
    const existingButton = sidebarButtonsContainer.querySelector('button.teams-button');
    if (existingButton !== null)
    {
        existingButton.remove();
    }

    // Create the button
    const copyBtn = document.createElement('button');
    // TODO swap this over to the copy hosted in this repo
    copyBtn.innerHTML = `<img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Microsoft%20Teams%20Icon.svg" alt="Teams"> Copy Link for Teams`;
    copyBtn.classList.add("teams-button");

    // Insert button after the div
    sidebarButtonsContainer.appendChild(copyBtn);

    // Add click event
    copyBtn.addEventListener('click', () =>
    {
        const title = document.querySelector(".page-header.qa-page-header.h1").innerText;
        const html = `<html><body><a href="${window.location.href}">${GetFormattedOrgName()} - ${title}</a></body></html>`;

        const blob = new Blob([html], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([clipboardItem]);
    });
}

// Takes Organization names that are very long and formats them down into acronyms,
// so that the org name doesn't hide the document title in the tab text.
function GetFormattedOrgName()
{
    const orgMap = {
        5199378: "Acorn",
        5198948: "AFP",
        5185248: "AIS",
        5198950: "BI",
        5524967: "CCA",
        5198997: "Engel Law",
        6038230: "FFCU",
        6213647: "FMDT",
        5199266: "Ingerman",
        5198977: "Naiman",
        5199276: "PK Law",
        5870388: "SBWD",
        5199304: "Waranch",
        5198991: "WEA"
    };

    const orgId = unsafeWindow.dvCurrent.organization.id;
    return orgMap[orgId] ?? unsafeWindow.dvCurrent.organization.name;
}

// Icons taken from https://www.iconexperience.com/g_collection/icons
// TODO play around with this some more.  Need to add a delay or something for it to pickup the elements.
function ReplaceFolderIcons()
{
    console.log("Found elements: ");
    console.log(document.querySelectorAll('.doc-name i.item-name-icon.fa-folder'));
    document.querySelectorAll('.doc-name i.item-name-icon.fa-folder').forEach(icon =>
    {
        const img = document.createElement('img');
        // TODO change the url to point to the repo's copy
        img.src = 'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/16x16/folder.png';
        img.alt = 'Folder';
        img.style.verticalAlign = 'middle';
        img.style.marginRight = '6px';
        img.style.height = '16px';
        img.style.width = '16px';

        // Insert the new image before removing the old icon
        icon.parentNode.insertBefore(img, icon);
        icon.remove();
    });
}

// TODO comment
function UpdateLogic()
{
    SetTabTitle();
    CreateCopyTeamsLinkButton();
    CreateCopyTeamsLinkButton_Passwords();
}

// Will try to update the title any time that it is changed on page navigation
const observer = new MutationObserver(UpdateLogic);
observer.observe(document.querySelector('title'), { childList: true });
