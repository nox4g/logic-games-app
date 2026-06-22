"use strict";

const API_URL = window.location.origin;

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function getCurrentUser() {
    const user = localStorage.getItem("currentUser");

    if (!user || user === "undefined" || user === "null") {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (e) {
        console.error("Bad currentUser in localStorage:", user);
        localStorage.removeItem("currentUser");
        return null;
    }
}

function saveAuthData(token, user) {
    if (!token) return;

    localStorage.setItem("authToken", token);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
        localStorage.removeItem("currentUser");
    }
}

function clearAuthData() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
}

// REGISTER
async function registerUser(username, password) {
    const response = await fetch(API_URL + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    return await response.json();
}

// LOGIN
async function loginUser(username, password) {
    const response = await fetch(API_URL + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
        saveAuthData(data.token, data.user);
    }

    return data;
}

// LOGOUT
async function logoutUser() {
    clearAuthData();
}

window.gameApi = {
    getAuthToken,
    getCurrentUser,
    registerUser,
    loginUser,
    logoutUser,
    saveGameResult,
    getUserStats
};