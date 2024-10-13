import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js'

dotenv.config();
const PERPLEXITY = process.env.PERPLEXITY;
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? '';
const NUM_TOKENS = 100;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function getRecipe(item: string): Promise<string> {
    let prompt : object = await supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe').single();
    prompt = prompt['data']['prompt'];

    let message = [{
        "role":"system","content":"Be precise and concise."},
        {"role":"user","content":prompt},]
    
    let message_str : string = JSON.stringify(message);
    
    const options = {
        method: 'POST',
        headers: {Authorization: `Bearer ${PERPLEXITY}`, 'Content-Type': 'application/json'},
        body: `{"model":"llama-3.1-sonar-small-128k-online","messages":${message_str},"max_tokens":${NUM_TOKENS},"temperature":0.2,"top_p":0.9,"return_citations":true,"search_domain_filter":["perplexity.ai"],"return_images":false,"return_related_questions":false,"search_recency_filter":"month","top_k":0,"stream":false,"presence_penalty":0,"frequency_penalty":1}`
      };

    const response = await fetch('https://api.perplexity.ai/chat/completions', options);
    const data = await response.json();

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
          }, 1000);
    });
}