// scripts/setup-pinecone.ts
import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
  apiKey: "pcsk_3ZPPD5_9XCHC15cbrckRAN4bzGJ8coCKdU1UdRUEmmaZzU3Y4EDXybFvMqRkjCNzyndUTB"
})

async function createIndex() {
  try {
    await pinecone.createIndex({
      name: 'web-scraper-index-three',
      dimension: 1536, // text-embedding-3-small default dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    })
    console.log('Index created successfully!')
  } catch (error) {
    console.error('Error creating index:', error)
  }
}

createIndex()
