"use strict";

const API_URL = window.location.origin;

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function getCurrentUser() {
    const user = localStorage.getItem("currentUser");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

function saveAuthData(token, user) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function clearAuthData() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
}

async function registerUser(username, password) {
    const response = await fetch(API_URL + "/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    return await response.json();
}

async function loginUser(username, password) {
    const response = await fetch(API_URL + "/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    const data = await response.json();

    if (data.success) {
        saveAuthData(data.token, data.user);
    }

    return data;
}

async function logoutUser() {
    const token = getAuthToken();

    await fetch(API_URL + "/api/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token
        })
    });

    clearAuthData();
}

async function saveGameResult(game, result, score, details) {
    const token = getAuthToken();

    if (!token) {
        return {
            success: false,
            message: "Користувач не авторизований."
        };
    }

    const response = await fetch(API_URL + "/api/results", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token,
            game: game,
            result: result,
            score: score || 0,
            details: details || {}
        })
    });

    return await response.json();
}

async function getUserStats() {
    const token = getAuthToken();

    if (!token) {
        return {
            success: false,
            message: "Користувач не авторизований."
        };
    }

    const response = await fetch(API_URL + "/api/stats", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: token
        })
    });

    return await response.json();
}

window.gameApi = {
    getAuthToken: getAuthToken,
    getCurrentUser: getCurrentUser,
    registerUser: registerUser,
    loginUser: loginUser,
    logoutUser: logoutUser,
    saveGameResult: saveGameResult,
    getUserStats: getUserStats
};