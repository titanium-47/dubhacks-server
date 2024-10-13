import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js'
import axios from 'axios';
import * as cheerio from 'cheerio';
import { json } from 'stream/consumers';
// import OpenAI from 'openai';
// import OpenAI from "openai";

dotenv.config();
const PERPLEXITY = process.env.PERPLEXITY;
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? '';
const GOOGLE_API_KEY = process.env.GOOGLE_API ?? '';
const USDA_API_KEY = process.env.USDA_API_KEY ?? '';
const NUM_TOKENS = 1000;

// const openai = new OpenAI();
const OPEN_AI = process.env.OPEN_AI ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function removeTextAfterComment(text: string): string {
    const index = text.toLowerCase().indexOf('comment');
    return index === -1 ? text : text.slice(0, index).trim();
}

async function promptOpenAI(sys_prompt: string, user_prompt: string): Promise<object> {
    let response: object = await axios.post('https://api.openai.com/v1/chat/completions', {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": sys_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ]
    }, {
        "headers": {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPEN_AI}`
        }
    })
    let json_response : object = {};
    let errorMessage : string;

    try{
        json_response = JSON.parse(response['data']['choices'][0]['message']['content']);
    } catch(e) {
        errorMessage = e.Message;
        console.log(errorMessage);
        response = await axios.post('https://api.openai.com/v1/chat/completions', {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": "You will read some faulty json and a error message and return valid json."
                },
                {
                    "role": "user",
                    "content": `Error Message: ${errorMessage}\nJSON: ${response['data']['choices'][0]['message']['content']}`
                }
            ]
        }, {
            "headers": {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI}`
            }
        })
        json_response = JSON.parse(response['data']['choices'][0]['message']['content']);
    }
    return json_response;
}

export async function getRecipe(item: string): Promise<string> {
    let proto_prompt : object = await supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe').single();
    // console.log(proto_prompt);
    proto_prompt = proto_prompt['data']['prompt'];
    const input = {
        "recipe": item
    }
    let prompt : string = proto_prompt['context'] + '\n';
    for (const obj of proto_prompt['messages']) {
        prompt += obj['text'] + input[obj['content']];
    }
    // prompt += '\n' + proto_prompt['return'];

    // const recipe_sites = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=52d41ee068c0d4fc3&q=how to make ${item}`);
    // const recipe_url = recipe_sites.data.items[0].link;
    const recipe_url = "https://www.loveandlemons.com/how-to-make-hard-boiled-eggs/"
    console.log(recipe_url);
    const recipe_info = await axios.get(recipe_url);
    const selector = cheerio.load(recipe_info.data);
    let pageText : string = selector('p')
    .map(function () {
      return selector(this).text().trim(); // Get and trim the text from each <p>
    })
    .get() // Convert to an array of strings
    .join('\n');

    pageText = removeTextAfterComment(pageText);

    const json_response = await promptOpenAI(proto_prompt['return'], prompt);
    
    console.log(json_response);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('This is a placeholder for the recipe');
          }, 1000);
    });
}

// export async function getRecipe(item: string): Promise<string> {
//     let proto_prompt : object = await supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe').single();
//     proto_prompt = proto_prompt['data']['prompt'];
    
//     const input = {
//         "recipe": item
//     }
//     let prompt : string = proto_prompt['context'] + '\n';
//     for (const obj of proto_prompt['messages']) {
//         prompt += obj['text'] + input[obj['content']];
//     }
//     // prompt += '\n' + proto_prompt['return'];

//     console.log(prompt);
//     let message = [{
//         "role":"system","content":proto_prompt['return']},
//         {"role":"user","content":prompt},]
    
//     let message_str : string = JSON.stringify(message);
    
//     const options = {
//         method: 'POST',
//         headers: {Authorization: `Bearer ${PERPLEXITY}`, 'Content-Type': 'application/json'},
//         body: `{"model":"llama-3.1-sonar-small-128k-online","messages":${message_str},"max_tokens":${NUM_TOKENS},"temperature":0.2,"top_p":0.9,"return_citations":true,"search_domain_filter":["perplexity.ai"],"return_images":false,"return_related_questions":false,"search_recency_filter":"month","top_k":0,"stream":false,"presence_penalty":0,"frequency_penalty":1}`
//       };

//     const response = await fetch('https://api.perplexity.ai/chat/completions', options);
//     const data = await response.json();

//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(data);
//           }, 1000);
//     });
// }