const electron = require('electron')
const { app, BrowserWindow } = electron

const win = new BrowserWindow({
  width: 800,
  height: 600
})

app.on('ready', () => {
  win.loadFile('index.html')
})
