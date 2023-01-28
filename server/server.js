require("dotenv").config()

const express = require("express")
const app = express()
app.use(express.json())
app.use(express.static("public"))
const stripe = require("stripe")(process.env.STRIPE)

const storeItems = new Map([
    [1, {price: 100, name: 'apple'}],
    [2, {price: 200, name: 'apple'}],
]);

app.post('/checkout', async (req, res) => {
    console.log("checking out server")
    try {
        const session = await stripe.checkout.sessions.create( {
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id);
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.price
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/success.html`,
            cancel_url: `${process.env.SERVER_URL}/cancel.html`
        })
        console.log(session.url)
        res.json({ url : session.url})
    }catch (e) {
        console.log(e.message)
        res.status(500).json({error: e.message})
    }
})


app.listen(3000)
