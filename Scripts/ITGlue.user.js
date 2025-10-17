// ==UserScript==
// @name         IT Glue
// @version      2025-10-07
// @description
// @author       Tim Pilius
// @match        https://ainfosys.itglue.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=myconnectwise.net
// @grant        none
// ==/UserScript==

// TODO document + fix icon
'use strict';

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

// Will try to update the title any time that it is changed on page navigation
const observer = new MutationObserver(SetTabTitle);
observer.observe(document.querySelector('title'), { childList: true });
