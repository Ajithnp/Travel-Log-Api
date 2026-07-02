import { inject, injectable } from "tsyringe";
import { IAIProvider } from "../infrastructure/ai-integration/IAiIntegartion";
import { IRagService } from "../interfaces/service_interfaces/IRagService";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';
import { ChatMessage, formatChatHistory } from "../shared/utils/format-ai-chat-history";
import { getRetriever } from "../config/vector.store";
import { SYSTEM_PROMPT } from "../shared/templates/prompt_templates";
import { ERROR_MESSAGES } from "../shared/constants/messages";

@injectable()
export class RagService implements IRagService {
    constructor(
        @inject('IAIProvider')
        private _aiProvider: IAIProvider
    ) { }

    private formatDocuments(docs: Document[]): string {
        if (docs.length === 0) {
            return ERROR_MESSAGES.NO_TRIPS_FOUND;
        }

        return docs.map((doc, index) => {
            return `--- Trip Option ${index + 1} --- ${doc.pageContent}`.trim();
        }).join('\n\n');
    }

    async askChatbot(userMessage: string, chatHistory: ChatMessage[] = []): Promise<string> {

        // Retriever — top 5 matching trips (active, future, seats available)
        const retriever = await getRetriever(this._aiProvider.getEmbeddingModel());

        // Prompt Template build
        const prompt = ChatPromptTemplate.fromMessages([
            ['system', SYSTEM_PROMPT],
            ['human', `Chat History:\n${chatHistory}\n\nUser Question: ${userMessage}`],
        ]);


        // RAG Chain
        // Question → Retrieve → Prompt → LLM → String Output
        const ragChain = RunnableSequence.from([
            {
                //prepare context and question in Parallel
                context: async (input: { question: string; chatHistory: string }) => {
                    const docs = await retriever.invoke(input.question);
                    return this.formatDocuments(docs);
                },
                question: (input: { question: string; chatHistory: string }) => input.question,
                chatHistory: (input: { question: string; chatHistory: string }) => input.chatHistory,
            },
            prompt,
            this._aiProvider.getChatModel(),
            new StringOutputParser(), // AI response → plain string 
        ]);
      

        // Chain invoke
        const response = await ragChain.invoke({
            question: userMessage,
            chatHistory: formatChatHistory(chatHistory),
        });
       
        return response;
    }
}


