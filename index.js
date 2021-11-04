const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vo35w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);
async function run() {
    try {
        await client.connect();
        // console.log("database connect successfully");
        const database = client.db('holidayHype');
        const servicesCollection = database.collection('services');
        const orderCollection = database.collection('addOrder');

        // GET API for ervices
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        //GET SINGLE SERVICE api 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        //POST Products API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log("hit the post api ", service);
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });

        //ADD ORDER Product
        app.post('/addOrder', async (req, res) => {
            console.log(req.body);
            orderCollection.insertOne(req.body).then((result) => {
                console.log(result);
                req.json(result);
            })
            // const order = req.body;
            // console.log("hit the post api ", order);
            // const result = await orderCollection.insertOne(order);
            // console.log(result);
            // res.json(result);

        })

        //GET MYORDER 
        app.get('/myOrder/:email', (req, res) => {
            orderCollection.find({ email: req.params.email })
                .toArray((err, items) => {
                    res.send(items);
                    // console.log(items);
                })
        })
        //Delete Order
        app.delete('/deleteOrder/:id', async (req, res) => {
            console.log(req.params.id);
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        })

        //get ALL Order 
        app.get('/allOrder', async (req, res) => {
            orderCollection.find({})
                .toArray((err, items) => {
                    res.send(items);
                })
        })



    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello from holiday hype server");
});
app.listen(port, () => {
    console.log("Listening to port", port);
});
