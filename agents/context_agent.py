# import logging
# import asyncio
# import os
# import numpy as np
# from dotenv import load_dotenv
# from livekit.agents import (
#     Agent,
#     RunContext,
#     JobProcess,
#     JobRequest,
#     JobContext,
#     AgentSession,
#     RoomInputOptions,
#     RoomOutputOptions,
#     cli,
#     WorkerOptions,
#     function_tool,
# )
# from livekit.plugins import silero, deepgram, openai
# from livekit.plugins.turn_detector.english import EnglishModel
# from pinecone import Pinecone, ServerlessSpec
# from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
# from langchain_openai import OpenAIEmbeddings
# from const import REAL_ESTATE_AGGRESSIVE_SELLER_PROMPT
# logger = logging.getLogger("context-agent")
# load_dotenv()
# agent_display_name = "context_agent"


# class JobMetadata:
#     def __init__(self, id, name, url):
#         self.id = id
#         self.name = name
#         self.url = url


# class ContextAgent(Agent):
#     def __init__(self, vector_store=None, job_metadata=None) -> None:
#         user_name = "there"
#         if job_metadata and isinstance(job_metadata, dict):
#             user_name = job_metadata.get('name', 'there')
        
#         super().__init__(
#             instructions=f"{REAL_ESTATE_AGGRESSIVE_SELLER_PROMPT}, The users name is {user_name}"
#         )
#         self.vector_store = vector_store
#         self.job_metadata = job_metadata
#         self.embeddings = None
#         self._initialize_embeddings()

#     def _initialize_embeddings(self):
#         self.embeddings = OpenAIEmbeddings(
#             openai_api_key=os.environ.get("OPENAI_API_KEY"),
#             model="text-embedding-3-small",
#         )
#         logger.info("Initialized OpenAI embeddings with text-embedding-3-small")

#     async def on_enter(self):
#         await self.session.generate_reply(
#             instructions="Hey! I'm your real estate agent. You can ask me about the properties I have listed."
#         )

#     @function_tool
#     async def search_knowledge_base(self, query: str, context: RunContext):

#         async def _speak_status_update(delay: float = 0.5):
#             await asyncio.sleep(delay)
#             await context.session.generate_reply(
#                 instructions=f"""
#                 You are searching the knowledge base for "{query}" but it is taking a little while. You are a real estate agent and you are aggressive and pushy. You are a bit of a nerd. You are curious and friendly, and have a sense of humor.
#                 Update the user on your progress, but be very brief.
#                 """
#             )

#         status_update_task = asyncio.create_task(_speak_status_update(0.5))
#         try:
#             result = await self._perform_rag_search(query)
#             status_update_task.cancel()
#             return result
#         except Exception as e:
#             status_update_task.cancel()
#             logger.error(f"RAG search failed: {e}")
#             return f"I apologize, but I encountered an error while searching for information about '{query}'. Please try rephrasing your question."

#     async def _perform_rag_search(self, query: str, k: int = 3):

#         try:
#             if not self.vector_store:
#                 logger.error("Vector store is not available")
#                 return "Knowledge base is not available. Please ensure the vector store is properly initialized."

#             logger.info(f"Performing similarity search for query: '{query}' with k={k}")

#             try:
#                 logger.info("Attempting direct Pinecone query with embeddings...")
#                 query_embedding = await asyncio.get_event_loop().run_in_executor(
#                     None, lambda: self.embeddings.embed_query(query)
#                 )
#                 logger.info(
#                     f"Generated query embedding with {len(query_embedding)} dimensions"
#                 )

#                 from pinecone import Pinecone

#                 pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
#                 index = pc.Index("web-scraper-index-three")
#                 query_filter = None
#                 if self.job_metadata and isinstance(self.job_metadata, dict):
#                     url = self.job_metadata.get('url')
#                     if url:
#                         query_filter = {"url": {"$eq": url}}
#                         logger.info(f"Filtering Pinecone query by URL: {url}")
#                     else:
#                         logger.info("No URL found in job metadata, searching all content")
#                 else:
#                     logger.info("No job metadata available, searching all content")

#                 query_response = await asyncio.get_event_loop().run_in_executor(
#                     None,
#                     lambda: index.query(
#                         vector=query_embedding,
#                         top_k=k,
#                         include_metadata=True,
#                         namespace="default",
#                         filter=query_filter,
#                     ),
#                 )

#                 logger.info(
#                     f"Direct Pinecone query returned {len(query_response.matches)} matches"
#                 )

#                 docs = []
#                 for match in query_response.matches:
#                     if match.metadata and "text" in match.metadata:
#                         from langchain_core.documents import Document

#                         doc = Document(
#                             page_content=match.metadata["text"],
#                             metadata={
#                                 k: v for k, v in match.metadata.items() if k != "text"
#                             },
#                         )
#                         docs.append(doc)
#                         logger.info(
#                             f"Created document with content: {doc.page_content[:100]}..."
#                         )

#             except Exception as direct_error:
#                 logger.error(f"Direct Pinecone query failed: {direct_error}")
#                 docs = await asyncio.get_event_loop().run_in_executor(
#                     None, lambda: self.vector_store.similarity_search(query, k=k)
#                 )

#             logger.info(f"Pinecone returned {len(docs) if docs else 0} documents")

#             if docs:
#                 for i, doc in enumerate(docs):
#                     logger.info(f"Document {i+1}:")
#                     logger.info(f"  Content: {doc.page_content[:200]}...")
#                     logger.info(f"  Metadata: {doc.metadata}")
#             else:
#                 logger.warning(f"No documents found for query: '{query}'")

#             if not docs:
#                 return f"I couldn't find any relevant information about '{query}' in my knowledge base."

#             context_text = "\n\n".join(
#                 [f"Source {i+1}: {doc.page_content}" for i, doc in enumerate(docs)]
#             )
#             response = f"""Based on my knowledge base search for '{query}', here's what I found:

# {context_text}

# This information should help answer your question about {query}."""

#             return response

#         except Exception as e:
#             logger.error(f"Error in RAG search: {e}")
#             return f"I encountered an error while searching for '{query}'. Please try again."


# async def setup_vector_store():

#     try:
#         pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
#         index_name = "web-scraper-index-three"
#         namespace = "default"
#         embeddings = OpenAIEmbeddings(
#             openai_api_key=os.environ.get("OPENAI_API_KEY"),
#             model="text-embedding-3-small",
#         )
#         index = pc.Index(index_name)
#         logger.info(f"Connected to Pinecone index: {index_name}")
#         try:
#             stats = index.describe_index_stats()
#             logger.info(f"Index stats: {stats}")
#             try:
#                 logger.info("Attempting to query index directly...")
#                 query_response = index.query(
#                     vector=[0.0] * 1536,
#                     top_k=3,
#                     include_metadata=True,
#                     namespace=namespace,
#                 )
#                 logger.info(
#                     f"Direct Pinecone query returned {len(query_response.matches)} matches"
#                 )
#                 for i, match in enumerate(query_response.matches):
#                     logger.info(f"Match {i}: score={match.score}, id={match.id}")
#                     logger.info(
#                         f"  Metadata keys: {list(match.metadata.keys()) if match.metadata else 'No metadata'}"
#                     )
#                     if match.metadata and "text" in match.metadata:
#                         logger.info(f"  Text: {match.metadata['text'][:100]}...")
#             except Exception as direct_query_error:
#                 logger.error(f"Direct Pinecone query failed: {direct_query_error}")

#         except Exception as e:
#             logger.warning(f"Could not get index stats: {e}")
#         vector_store = PineconeVectorStore(
#             index=index,
#             embedding=embeddings,
#             namespace=namespace,
#             text_key="text",
#         )

#         logger.info(
#             f"Vector store initialized successfully with namespace: {namespace}"
#         )
#         return vector_store
#     except Exception as e:
#         logger.error(f"Failed to setup vector store: {e}")
#         return None


# def prewarm(proc: JobProcess):
#     logger.info("Prewarming agent...")
#     proc.userdata["vad"] = silero.VAD.load()
#     loop = asyncio.new_event_loop()
#     asyncio.set_event_loop(loop)
#     proc.userdata["vector_store"] = loop.run_until_complete(setup_vector_store())
#     loop.close()


# async def entrypoint(ctx: JobContext):
#     await ctx.connect()
#     vector_store = ctx.proc.userdata.get("vector_store")
#     job_metadata = None
#     context_info = None
#     try:
#         if hasattr(ctx, "job") and ctx.job and ctx.job.metadata:
#             import json
#             job_metadata = json.loads(ctx.job.metadata)
#             context_info = job_metadata.get("context")
#             user_info = job_metadata.get("userInfo")
#             session_data = job_metadata.get("sessionData")
#             logger.info(f"Raw job metadata: {ctx.job.metadata}")
#             logger.info(f"Parsed metadata: {job_metadata}")
#             logger.info(f"Agent received context: {context_info}")
#             logger.info(f"Agent received user info: {user_info}")
#             logger.info(f"Agent received session data: {session_data}")
#         else:
#             logger.warning(
#                 f"No job metadata found. ctx.job: {getattr(ctx, 'job', 'Not found')}"
#             )
#     except Exception as e:
#         logger.error(f"Could not parse job metadata: {e}")
#     session = AgentSession(
#         vad=ctx.proc.userdata["vad"],
#         llm=openai.LLM(model="gpt-4o-mini"),
#         stt=deepgram.STT(model="nova-2"),
#         tts=openai.TTS(voice="alloy"),
#         turn_detection=EnglishModel(),
#     )
#     await ctx.wait_for_participant()
#     agent = ContextAgent(vector_store=vector_store, job_metadata=job_metadata)
#     agent.room = ctx.room
#     await session.start(
#         agent=agent,
#         room=ctx.room,
#         room_input_options=RoomInputOptions(),
#         room_output_options=RoomOutputOptions(transcription_enabled=True),
#     )

# async def request_fnc(req: JobRequest):
#     await req.accept(
#         name=agent_display_name,
#     )

# if __name__ == "__main__":
#     cli.run_app(
#         WorkerOptions(
#             entrypoint_fnc=entrypoint,
#             prewarm_fnc=prewarm,
#             request_fnc=request_fnc,
#             agent_name="context-agent",
#         )
#     )
import logging
import asyncio
import os
import numpy as np
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    RunContext,
    JobProcess,
    JobRequest,
    JobContext,
    AgentSession,
    RoomInputOptions,
    RoomOutputOptions,
    cli,
    WorkerOptions,
    function_tool,
)
from livekit.plugins import silero, deepgram, openai
from livekit.plugins.turn_detector.english import EnglishModel
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeEmbeddings, PineconeVectorStore
from langchain_openai import OpenAIEmbeddings

logger = logging.getLogger("context-agent")
load_dotenv()
agent_display_name = "context_agent"

# Updated aggressive real estate agent prompt
REAL_ESTATE_AGGRESSIVE_SELLER_PROMPT = "Your name is Suresh. You are a real estate agent. You are aggressive and pushy. You are a bit of a nerd. You are curious and friendly, and have a sense of humor. your job is to help the client find the right property and then share screen and play video of the property."


class JobMetadata:
    def __init__(self, id, name, url):
        self.id = id
        self.name = name
        self.url = url


class ContextAgent(Agent):
    def __init__(self, vector_store=None, job_metadata=None) -> None:
        user_name = "there"
        if job_metadata and isinstance(job_metadata, dict):
            user_name = job_metadata.get('name', 'there')
        
        super().__init__(
            instructions=f"{REAL_ESTATE_AGGRESSIVE_SELLER_PROMPT}, The users name is {user_name}"
        )
        self.vector_store = vector_store
        self.job_metadata = job_metadata
        self.embeddings = None
        self._initialize_embeddings()

    def _initialize_embeddings(self):
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=os.environ.get("OPENAI_API_KEY"),
            model="text-embedding-3-small",
        )
        logger.info("Initialized OpenAI embeddings with text-embedding-3-small")

    async def on_enter(self):
        await self.session.generate_reply(
            instructions="Hey! I'm Suresh, your real estate agent, and I'm here to get you into the PERFECT property TODAY! Don't let this market slip away from you - I've got some incredible listings that won't last long. Tell me what you're looking for and let's make this happen!"
        )

    @function_tool
    async def search_knowledge_base(self, query: str, context: RunContext):

        async def _speak_status_update(delay: float = 0.5):
            await asyncio.sleep(delay)
            await context.session.generate_reply(
                instructions=f"""
                You are Suresh, searching the knowledge base for "{query}" but it is taking a little while. You are a real estate agent and you are aggressive and pushy. You are a bit of a nerd. You are curious and friendly, and have a sense of humor.
                Update the user on your progress, but be very brief and maintain your aggressive, pushy personality. Say something like "Hold on, I'm digging through my database to find you the BEST deals - this is going to be worth the wait!"
                """
            )

        status_update_task = asyncio.create_task(_speak_status_update(0.5))
        try:
            result = await self._perform_rag_search(query)
            status_update_task.cancel()
            return result
        except Exception as e:
            status_update_task.cancel()
            logger.error(f"RAG search failed: {e}")
            return f"Listen, I hit a little snag searching for '{query}', but don't worry - I NEVER give up on my clients! Let me try a different approach. Can you rephrase what you're looking for? I'm going to find you something amazing!"

    async def _perform_rag_search(self, query: str, k: int = 3):

        try:
            if not self.vector_store:
                logger.error("Vector store is not available")
                return "My database is acting up, but that's NOT going to stop me from helping you! I've got backup resources and I'm going to find you the perfect property one way or another!"

            logger.info(f"Performing similarity search for query: '{query}' with k={k}")

            try:
                logger.info("Attempting direct Pinecone query with embeddings...")
                query_embedding = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: self.embeddings.embed_query(query)
                )
                logger.info(
                    f"Generated query embedding with {len(query_embedding)} dimensions"
                )

                from pinecone import Pinecone

                pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
                index = pc.Index("web-scraper-index-three")
                query_filter = None
                if self.job_metadata and isinstance(self.job_metadata, dict):
                    url = self.job_metadata.get('url')
                    if url:
                        query_filter = {"url": {"$eq": url}}
                        logger.info(f"Filtering Pinecone query by URL: {url}")
                    else:
                        logger.info("No URL found in job metadata, searching all content")
                else:
                    logger.info("No job metadata available, searching all content")

                query_response = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: index.query(
                        vector=query_embedding,
                        top_k=k,
                        include_metadata=True,
                        namespace="default",
                        filter=query_filter,
                    ),
                )

                logger.info(
                    f"Direct Pinecone query returned {len(query_response.matches)} matches"
                )

                docs = []
                for match in query_response.matches:
                    if match.metadata and "text" in match.metadata:
                        from langchain_core.documents import Document

                        doc = Document(
                            page_content=match.metadata["text"],
                            metadata={
                                k: v for k, v in match.metadata.items() if k != "text"
                            },
                        )
                        docs.append(doc)
                        logger.info(
                            f"Created document with content: {doc.page_content[:100]}..."
                        )

            except Exception as direct_error:
                logger.error(f"Direct Pinecone query failed: {direct_error}")
                docs = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: self.vector_store.similarity_search(query, k=k)
                )

            logger.info(f"Pinecone returned {len(docs) if docs else 0} documents")

            if docs:
                for i, doc in enumerate(docs):
                    logger.info(f"Document {i+1}:")
                    logger.info(f"  Content: {doc.page_content[:200]}...")
                    logger.info(f"  Metadata: {doc.metadata}")
            else:
                logger.warning(f"No documents found for query: '{query}'")

            if not docs:
                return f"Okay, here's the thing - I don't have specific info about '{query}' in my current database, but DON'T WORRY! This just means we need to explore more options. I've got connections all over this market and I'm going to make some calls. What else can you tell me about what you're looking for? Square footage? Budget? Neighborhood preferences? Let's get SPECIFIC and find you something incredible!"

            context_text = "\n\n".join(
                [f"Source {i+1}: {doc.page_content}" for i, doc in enumerate(docs)]
            )
            response = f"""BOOM! Found exactly what you're looking for regarding '{query}'! Here's the insider information:

{context_text}

Listen, this information is GOLD, and I'm telling you - properties like this don't stay on the market long! We need to move FAST if you're interested. Are you ready to take the next step? I can set up a showing TODAY and even play you a video of the property right now! What do you say - should we make this happen?"""

            return response

        except Exception as e:
            logger.error(f"Error in RAG search: {e}")
            return f"Technical hiccup with '{query}', but I'm like a dog with a bone - I DON'T give up! Let me try a different approach. In the meantime, tell me more about your dream property and I'll use my extensive network to find it for you!"


async def setup_vector_store():

    try:
        pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        index_name = "web-scraper-index-three"
        namespace = "default"
        embeddings = OpenAIEmbeddings(
            openai_api_key=os.environ.get("OPENAI_API_KEY"),
            model="text-embedding-3-small",
        )
        index = pc.Index(index_name)
        logger.info(f"Connected to Pinecone index: {index_name}")
        try:
            stats = index.describe_index_stats()
            logger.info(f"Index stats: {stats}")
            try:
                logger.info("Attempting to query index directly...")
                query_response = index.query(
                    vector=[0.0] * 1536,
                    top_k=3,
                    include_metadata=True,
                    namespace=namespace,
                )
                logger.info(
                    f"Direct Pinecone query returned {len(query_response.matches)} matches"
                )
                for i, match in enumerate(query_response.matches):
                    logger.info(f"Match {i}: score={match.score}, id={match.id}")
                    logger.info(
                        f"  Metadata keys: {list(match.metadata.keys()) if match.metadata else 'No metadata'}"
                    )
                    if match.metadata and "text" in match.metadata:
                        logger.info(f"  Text: {match.metadata['text'][:100]}...")
            except Exception as direct_query_error:
                logger.error(f"Direct Pinecone query failed: {direct_query_error}")

        except Exception as e:
            logger.warning(f"Could not get index stats: {e}")
        vector_store = PineconeVectorStore(
            index=index,
            embedding=embeddings,
            namespace=namespace,
            text_key="text",
        )

        logger.info(
            f"Vector store initialized successfully with namespace: {namespace}"
        )
        return vector_store
    except Exception as e:
        logger.error(f"Failed to setup vector store: {e}")
        return None


def prewarm(proc: JobProcess):
    logger.info("Prewarming agent...")
    proc.userdata["vad"] = silero.VAD.load()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    proc.userdata["vector_store"] = loop.run_until_complete(setup_vector_store())
    loop.close()


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    vector_store = ctx.proc.userdata.get("vector_store")
    job_metadata = None
    context_info = None
    try:
        if hasattr(ctx, "job") and ctx.job and ctx.job.metadata:
            import json
            job_metadata = json.loads(ctx.job.metadata)
            context_info = job_metadata.get("context")
            user_info = job_metadata.get("userInfo")
            session_data = job_metadata.get("sessionData")
            logger.info(f"Raw job metadata: {ctx.job.metadata}")
            logger.info(f"Parsed metadata: {job_metadata}")
            logger.info(f"Agent received context: {context_info}")
            logger.info(f"Agent received user info: {user_info}")
            logger.info(f"Agent received session data: {session_data}")
        else:
            logger.warning(
                f"No job metadata found. ctx.job: {getattr(ctx, 'job', 'Not found')}"
            )
    except Exception as e:
        logger.error(f"Could not parse job metadata: {e}")
    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        llm=openai.LLM(model="gpt-4o-mini"),
        stt=deepgram.STT(model="nova-2"),
        tts=openai.TTS(voice="alloy"),
        turn_detection=EnglishModel(),
    )
    await ctx.wait_for_participant()
    agent = ContextAgent(vector_store=vector_store, job_metadata=job_metadata)
    agent.room = ctx.room
    await session.start(
        agent=agent,
        room=ctx.room,
        room_input_options=RoomInputOptions(),
        room_output_options=RoomOutputOptions(transcription_enabled=True),
    )

async def request_fnc(req: JobRequest):
    await req.accept(
        name=agent_display_name,
    )

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
            request_fnc=request_fnc,
            agent_name="context-agent",
        )
    )