import mongose from 'mongoose'

const MONGODB_URI = 'mongodb+srv://tatoclemente:admin@cluster0.ongzcyv.mongodb.net/?retryWrites=true&w=majority'

mongose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(error => console.error('error connection to MongoDB', error.message))

// const { MongoClient } = require("mongodb");

// const username = encodeURIComponent("tatoclemente");
// const password = encodeURIComponent("admin");
// const cluster = "cluster0";
// // const authSource = "<authSource>";
// // const authMechanism = "<authMechanism>";

// let uri =
//   `mongodb+srv://${username}:${password}@${cluster}.ongzcyv.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri);

// async function run() {
//   try {
//     await client.connect();

//     const database = client.db("<dbName>");
//     const ratings = database.collection("<collName>");

//     const cursor = ratings.find();

//     await cursor.forEach(doc => console.dir(doc));
//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);
