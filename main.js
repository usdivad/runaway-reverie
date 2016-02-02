"use strict";

const electron = require("electron");
var mainWindow = null;

electron.app.on("window-all-closed", () => {
  if (process.platform != "darwin") electron.app.quit();
});

electron.app.on("ready", () => {
  mainWindow = new electron.BrowserWindow({
    width: 1280, height: 720,
    useContentSize: true,
    // NOTE: You can enable those if you want
    // resizable: false,
    icon: `${__dirname}/icon.png`
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on("closed", () => { mainWindow = null; });
});