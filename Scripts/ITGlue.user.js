// ==UserScript==
// @name         IT Glue Tweaks
// @author       tpilius-ais
// @version      0.1.0
// @description  // TODO
// @match        https://ainfosys.itglue.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=itglue.com
// ==/UserScript==

/* TODO look at adding these icons as replacements to the built in ones : https://www.iconexperience.com/g_collection/icons/# */
// TODO document both here and on the readme
// TODO Play around with replacing tags like [SPAM FILTER] with a color coded badge.
// TODO https://github.com/gavsto/ITGlue-Helper
'use strict';

// Makes the tab title actually reflect the document title.
function SetTabTitle()
{
    if (document.title.includes("Documents - "))
    {
        document.title = document.title.replace("Documents - ", "");
    }
    if (document.title.includes(" — IT Glue"))
    {
        document.title = document.title.replace(" — IT Glue", "");
    }
}

// Adds a button that will allow the user to easily copy a formatted link to use in Team, Notion, or elsewhere.
// This link will be formatted so that the display text is of the format "[Client] - Document Title", while still linking to the correct page.
function CreateCopyTeamsLinkButton()
{
    // This is only necessary on document pages.  Could possibly add it elsewhere too.
    if (!window.location.href.includes("docs"))
    {
        return;
    }

    let pageHeaderContainer = document.querySelector(".react-page-header__left");
    if (!pageHeaderContainer)
    {
        // Nothing to do since we couldn't find the header
        return;
    }

    // Remove the old button and readd it.  This is so that it will always be to the right of the edit button.
    let existingButton = pageHeaderContainer.querySelector('button.teams-button');
    if (existingButton !== null)
    {
        existingButton.remove();
    }

    // Create the button
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/0/07/Microsoft_Office_Teams_%282025%E2%80%93present%29.svg" alt="Teams"> Copy Link for Teams`;
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

function GetFormattedOrgName()
{
    if (window.dvCurrent.organization.id === 5870388)
    {
        return "SBWDlaw";
    }

    return window.dvCurrent.organization.name;
}

function UpdateLogic()
{
    SetTabTitle();
    CreateCopyTeamsLinkButton();
}

// Will try to update the title any time that it is changed on page navigation
const observer = new MutationObserver(UpdateLogic);
observer.observe(document.querySelector('title'), { childList: true });

//TODO play around with this
// document.querySelectorAll('.doc-name i.item-name-icon').forEach(icon => {
//     const img = document.createElement('img');
//     img.src = 'https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/24x24/folder.png';
//     img.alt = 'Folder';
//     img.style.verticalAlign = 'middle';
//     img.style.marginRight = '6px';

//     // Insert the new image before removing the old icon
//     icon.parentNode.insertBefore(img, icon);
//     icon.remove();
// });
