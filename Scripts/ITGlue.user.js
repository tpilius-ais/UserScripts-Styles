// ==UserScript==
// @name         IT Glue Tweaks
// @author       tpilius-ais
// @version      0.4.0
// @description  // TODO
// @match        https://ainfosys.itglue.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=itglue.com
// @top-level-await
// @require      https://cdn.jsdelivr.net/npm/toastify-js
// @resource     toastifyCSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
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
    // Prepends the client name and removes 'IT Glue' from the tab title.
    if (document.title.includes(" — IT Glue"))
    {
        const orgName = GetFormattedOrgName();
        document.title = `${orgName} - ${document.title.replace(" — IT Glue", "")}`;
    }
    // TODO add the printer name to the title
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
    const copyButton = document.createElement('button');
    copyButton.innerHTML = `<img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Microsoft%20Teams%20Icon.svg" alt="Teams"> Copy Link for Teams`;
    copyButton.classList.add("teams-button");

    // Insert button after the div
    pageHeaderContainer.appendChild(copyButton);

    // Add click event
    copyButton.addEventListener('click', () =>
    {
        // Copying to clipboard
        const title = document.querySelector("h1.doc-title--view").innerText;
        const html = `<html><body><a href="${window.location.href}">${GetFormattedOrgName()} - ${title}</a></body></html>`;

        const blob = new Blob([html], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([clipboardItem]);

        // Showing toast notification so user knows it worked.
        Toastify({
            text: "Copied!",
            duration: 1000,
            position: "left",
            offset:
            {
                x: copyButton.getBoundingClientRect().left + 40,
            },
        }).showToast();
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
    const copyButton = document.createElement('button');
    copyButton.innerHTML = `<img src="https://raw.githubusercontent.com/tpilius-ais/UserScripts-Styles/refs/heads/master/img/Microsoft%20Teams%20Icon.svg" alt="Teams"> Copy Link for Teams`;
    copyButton.classList.add("teams-button");

    // Insert button after the div
    sidebarButtonsContainer.appendChild(copyButton);

    // Add click event
    copyButton.addEventListener('click', () =>
    {
        // TODO this is hideous
        const div = document.querySelector(".page-header.qa-page-header.h1");
        // Stripping out the extra text that gets included without affecting the original.
        const headerText = Array
            .from(div.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent.trim())
            .join("");

        const html = `<html><body><a href="${window.location.href}">${GetFormattedOrgName()} - ${headerText}</a></body></html>`;
        const blob = new Blob([html], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([clipboardItem]);

        // Showing toast notification so user knows it worked.
        Toastify({
            text: "Copied!",
            duration: 1000,
            position: "left",
            offset:
            {
                x: copyButton.getBoundingClientRect().left + 40,
            },
        }).showToast();
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
        5199303: "Bryant",
        5524967: "CCA",
        5198956: "Costello",
        9121846: "DIA",
        5198997: "Engel Law",
        6038230: "FFCU",
        6213647: "FMDT",
        8609516: "GSG",
        5199266: "Ingerman",
        5198977: "Naiman",
        5199276: "PK Law",
        5870388: "SBWD",
        5199304: "Waranch",
        5198991: "WEA",
        8129780: "WPG"
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

// Loading toastify CSS, since there is no built in support with @require
GM_addStyle(GM_getResourceText("toastifyCSS"));

function UpdateLogic()
{
    SetTabTitle();
    CreateCopyTeamsLinkButton();
    CreateCopyTeamsLinkButton_Passwords();
}

// Will try to update the title any time that it is changed on page navigation
const observer = new MutationObserver(UpdateLogic);
observer.observe(document.querySelector('title'), { childList: true });

window.addEventListener('load', () =>
{
    SetTabTitle();
});