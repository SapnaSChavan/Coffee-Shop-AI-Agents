import axios from 'axios';
import { MessageInterface } from '@/types/types';
import { API_KEY, API_URL } from '@/config/runpodConfigs';

async function callChatBotAPI(messages: MessageInterface[]): Promise<MessageInterface> {
    console.log("API STufff")
    console.log(API_URL)
    console.log(API_KEY)
    console.log(messages)
    try {
        // Step 1: Make the initial request

        const initialResponse = await axios.post(API_URL, {
            input: { messages },
            parameters: { sync: true },
            
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer rpa_B4Q1SXVLA3Q4XVDBIOU52G6BA04S5A45T0UU1Y7S1sazri`
            }
        });

        // Step 2: Check the response status
        let jobStatus = initialResponse.data.status;
        let jobId = initialResponse.data.id;

        if (jobStatus === 'COMPLETED') {
            // Return the completed output immediately
            return initialResponse.data.output;
        } else if (jobStatus === 'IN_PROGRESS' || jobStatus==='IN_QUEUE') {
            console.log(`Job is in progress. Job ID: ${jobId}`);
            return await pollJobStatus(jobId);
        } else {
            throw new Error(`Unexpected status: ${jobStatus}`);
        }
    } catch (error) {
        console.error('Error calling the API:', error);
        throw error;
    }
}

// Step 3: Poll the job status endpoint
async function pollJobStatus(jobId:string) {
    const API_STATUS_URL = "https://api.runpod.ai/v2/7ehva35shrfoy4/status"
    const STATUS_URL = `${API_STATUS_URL}/${jobId}`; // Endpoint to check the job status
    const POLL_INTERVAL = 6000; // Poll every 5 seconds
    const MAX_RETRIES = 20; // Retry up to 20 times (100 seconds total)

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(STATUS_URL, {
                headers: {
                    Authorization: `Bearer rpa_B4Q1SXVLA3Q4XVDBIOU52G6BA04S5A45T0UU1Y7S1sazri`,
                },
            });

            const jobStatus = response.data.status;

            if (jobStatus === 'COMPLETED') {
                console.log('Job completed successfully.');
                return response.data.output;
            } else if (jobStatus === 'FAILED') {
                console.error('Job failed.');
                throw new Error(`Job failed with ID: ${jobId}`);
            }

            console.log(`Job still in progress... [Attempt ${i + 1}/${MAX_RETRIES}]`);
        } catch (error) {
            console.error('Error polling job status:', error);
            throw error;
        }

        // Wait before the next poll
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error('Polling timed out. The job did not complete within the expected time.');
}

export { callChatBotAPI };


        
//         let output = response.data;
//         console.log(output)
//         let outputMessage: MessageInterface = output['output'];

//         return outputMessage;

//     } catch (error) {
//         console.error('Error calling the API:', error);
//         throw error;
//     }
// }

// export { callChatBotAPI };