import express from "express";

import db from '@repo/db/client'

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    console.log("Hello World");
    res.json({
        message: "Hello World"
    })
})

app.post("/hdfcWebhook", async (req, res) => {
    console.log(req.body);
    
    // Parse request body
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    try {        
        await db.$transaction([
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                }, 
                data: {
                    status: "Success"
                }
            }),
            db.balance.upsert({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                update: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    }
                },
                create: {
                    userId: Number(paymentInformation.userId),
                    amount: Number(paymentInformation.amount),
                    locked: Number(paymentInformation.amount),
                    
                }
            })
        ]);
        res.json({
            message: "Captured"
        });
    } catch(e) {

        console.error(e);
        res.status(500).json({
            message: "Error while processing webhook"
        });
    }
});


app.listen(8000, () => {
    console.log("Listening on port 8000");
})