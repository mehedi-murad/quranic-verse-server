require('dotenv').config();
const express = require('express')
const compression = require('compression');
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(compression());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kkasusp.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const versesCollection = client.db("quran").collection("verse")
    const surahCollection = client.db("quran").collection("surah")



    //for getting all tests list data endpoint
    app.get('/verse', async(req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const searchQuery = req.query.search || '';
      const searchRegex = new RegExp(searchQuery, 'i');

      const query = {
        $or: [
          { aya: { $regex: searchRegex } },
          // { category: { $regex: searchRegex } },
        ],
      };
      console.log(query)

      const result = await versesCollection.find(query)
      .skip(page * size)
      .limit(size)
      .toArray()
      res.json(result)
    })

    //for pagination 
    app.get('/productsCount', async(req, res) => {
      const count = await versesCollection.estimatedDocumentCount();
      res.send({count})
    })

    app.get('/verse/:id', async(req,res) =>{
      const id = req.params.id;
      // console.log(id)
      const query = {_id: new ObjectId(id)}
      const result = await versesCollection.findOne(query)
      res.send(result)
    })

    app.get('/surah', async(req, res) => {
      const result = await surahCollection.find().toArray()
      res.send(result)
    })



    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Quran searching engine')
})

app.listen(port, () => {
    console.log(`Quran searching engine is running on ${port}`);
})