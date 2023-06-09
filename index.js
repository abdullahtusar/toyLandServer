const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9wjmbrb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db('toyLand').collection('toys');

    //toys route
    app.get('/toys', async(req, res)=> {
        let query = {};
        if(req.query?.email){
            query = { email: req.query.email }
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result)
    })


    app.get('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { photo: 1, title: 1, name: 1, email: 1, category: 1, price: 1, rating: 1,  quantity: 1, rating: 1, description: 1},
          };
        const result = await toysCollection.findOne(query, options);
        res.send(result);
    })

    app.post('/toys', async(req, res)=>{
        const toy = req.body;
        console.log(toy)
        const result = await toysCollection.insertOne(toy);
        res.send(result);
    })

    
    app.put('/toys/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedToy = req.body;
      console.log(updatedToy);
      const updateDoc = {
          $set: {
            title: updatedToy.title,
            photo: updatedToy.photo,
            price: updatedToy.price,
            category: updatedToy.category,
            rating: updatedToy.rating,
            description: updatedToy.description,
          }
      }
      const result = await toysCollection.updateOne(filter, updateDoc, options);
      res.send(result)
  })

    app.delete('/toys/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(query);
      res.send(result)
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Toy Marketplace Server Is Running...')
})

app.listen(port, () => {
    console.log(`toy marketplace server is running on port: ${port}`)
})