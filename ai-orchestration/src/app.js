import express from "express"
import morgan from "morgan"

const app = express()

app.use(morgan('dev'))
app.use(express.json())


app.get("/api/status/healthz",(req,res)=>{
    res.status(200).json({
        status: "OK"
    })
})



export default app