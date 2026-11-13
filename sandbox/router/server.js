import app, { handleUpgrade } from "./src/app.js";

const server = app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

server.on('upgrade', handleUpgrade)