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

const OPEN_AI = process.env.OPEN_AI ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function removeTextAfterComment(text: string): string {
    const index = text.toLowerCase().indexOf('comment');
    return index === -1 ? text : text.slice(0, index).trim();
}

async function router(item: string): Promise<boolean> {
    let sys_prompt_raw : object = await supabase.from('prompts').select('prompt').eq('prompt_type', 'router').single();
    let sys_prompt : string = sys_prompt_raw['data']['prompt']['sys'];
    let response: object = await axios.post('https://api.openai.com/v1/chat/completions', {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": sys_prompt
            },
            {
                "role": "user",
                "content": item
            }
        ]
    }, {
        "headers": {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPEN_AI}`
        }
    })
    if (response['data']['choices'][0]['message']['content'] === 'simple') {
        return true;
    } else {
        return false;
    }
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

export async function getRecipe(item: string): Promise<object> {
    // prompt += '\n' + proto_prompt['return'];

    const simple = await router(item);
    let json_response : object = {};

    if (simple) {
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
        json_response = await promptOpenAI(proto_prompt['return'], prompt);
    } else {
        let proto_prompt : object = await supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe_complex').single();
        // console.log(proto_prompt);
        proto_prompt = proto_prompt['data']['prompt'];

        const recipe_sites = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=52d41ee068c0d4fc3&q=how to make ${item}`);
        const recipe_url = recipe_sites.data.items[0].link;
        //const recipe_url = "https://www.loveandlemons.com/how-to-make-hard-boiled-eggs/"
        console.log(recipe_url);
        const recipe_info = await axios.get(recipe_url);
        const selector = cheerio.load(recipe_info.data);
        let pageText : string = selector('p')
        .map(function () {
        return selector(this).text().trim(); // Get and trim the text from each <p>
        })
        .get() // Convert to an array of strings
        .join('\n');

        // console.log(pageText);

        const input = {
            "recipe": item,
            "recipe_text": pageText
        }
        let prompt : string = proto_prompt['context'] + '\n';
        for (const obj of proto_prompt['messages']) {
            prompt += obj['text'] + input[obj['content']];
        }
        json_response = await promptOpenAI(proto_prompt['return'], prompt);
    }
    
    //console.log(json_response);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(json_response);
          }, 1000);
    });
}