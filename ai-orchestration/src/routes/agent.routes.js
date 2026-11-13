
import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    try {
        const { message, projectId } = req.body;

        if (!message || !projectId) {
            return res.status(400).json({
                error: "message and projectId are required"
            });
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });

        const response = await agent.stream(
            {
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                context: {
                    projectId
                },
                streamMode: "custom"
            }
        );

        for await (const chunk of response) {
            if (res.destroyed) return;

            console.log(chunk);

            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        if (!res.destroyed) {
            res.write("event: done\ndata: {}\n\n");
            res.end();
        }

    } catch (error) {
        console.error("Error invoking agent:", error);

        if (res.headersSent) {
            if (!res.destroyed && !res.writableEnded) {
                res.write(`event: error\ndata: ${JSON.stringify({
                    error: "Failed to invoke agent"
                })}\n\n`);

                res.end();
            }

            return;
        }

        return res.status(500).json({
            error: "Failed to invoke agent",
            details: error.message
        });
    }
});

export default agentRouter;
