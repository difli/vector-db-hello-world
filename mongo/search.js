const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

async function getEmbedding(query) {
    // Define the OpenAI API url and key.
    const url = 'https://api.openai.com/v1/embeddings';
    const openai_key = 'sk-XYZ'; // Replace with your OpenAI key.
    
    // Call OpenAI API to get the embeddings.
    let response = await axios.post(url, {
        input: query,
        model: "text-embedding-ada-002"
    }, {
        headers: {
            'Authorization': `Bearer ${openai_key}`,
            'Content-Type': 'application/json'
        }
    });
    
    if(response.status === 200) {
        return response.data.data[0].embedding;
    } else {
        throw new Error(`Failed to get embedding. Status code: ${response.status}`);
    }
}

async function findSimilarDocuments(embedding) {
    const url = 'mongodb+srv://XYZ:XYZ@mycluster.jn3om28.mongodb.net/?retryWrites=true&w=majority'
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        
        const db = client.db('sample_mflix'); // Replace with your database name.
        const collection = db.collection('movies'); // Replace with your collection name.
        
        // Query for similar documents.
        const documents = await collection.aggregate([
            {
            "$search": {
            "index": "default",
            "knnBeta": {
            "vector": embedding,
            "path": "plot_embedding",
            "k": 5
            }
            }
            }
            ]).toArray();
        
        return documents;
    } finally {
        await client.close();
    }
}

async function main() {
//    const query = '{"plot": "A group of bandits stage a brazen train hold-up, only to find a determined posse hot on their heels."}'; // Replace with your query.
    const query = 'Are there any bandit movies'; // Replace with your query.
    
    try {
        const embedding = await getEmbedding(query);
        console.log(embedding)
        const documents = await findSimilarDocuments(embedding);
        
        console.log(documents);
    } catch(err) {
        console.error(err);
    }
}

main();
