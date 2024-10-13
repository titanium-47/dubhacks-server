"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipe = getRecipe;
const dotenv = __importStar(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
// import OpenAI from 'openai';
// import OpenAI from "openai";
dotenv.config();
const PERPLEXITY = process.env.PERPLEXITY;
const SUPABASE_URL = (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : '';
const SUPABASE_KEY = (_b = process.env.SUPABASE_KEY) !== null && _b !== void 0 ? _b : '';
const GOOGLE_API_KEY = (_c = process.env.GOOGLE_API) !== null && _c !== void 0 ? _c : '';
const USDA_API_KEY = (_d = process.env.USDA_API_KEY) !== null && _d !== void 0 ? _d : '';
const NUM_TOKENS = 1000;
const OPEN_AI = (_e = process.env.OPEN_AI) !== null && _e !== void 0 ? _e : '';
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
function removeTextAfterComment(text) {
    const index = text.toLowerCase().indexOf('comment');
    return index === -1 ? text : text.slice(0, index).trim();
}
function router(item) {
    return __awaiter(this, void 0, void 0, function* () {
        let sys_prompt_raw = yield supabase.from('prompts').select('prompt').eq('prompt_type', 'router').single();
        let sys_prompt = sys_prompt_raw['data']['prompt']['sys'];
        let response = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
        });
        if (response['data']['choices'][0]['message']['content'] === 'simple') {
            return true;
        }
        else {
            return false;
        }
    });
}
function promptOpenAI(sys_prompt, user_prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
        });
        let json_response = {};
        let errorMessage;
        try {
            json_response = JSON.parse(response['data']['choices'][0]['message']['content']);
        }
        catch (e) {
            errorMessage = e.Message;
            console.log(errorMessage);
            response = yield axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
            });
            json_response = JSON.parse(response['data']['choices'][0]['message']['content']);
        }
        return json_response;
    });
}
function getRecipe(item) {
    return __awaiter(this, void 0, void 0, function* () {
        // prompt += '\n' + proto_prompt['return'];
        const simple = yield router(item);
        let json_response = {};
        if (simple) {
            let proto_prompt = yield supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe').single();
            // console.log(proto_prompt);
            const input = {
                "recipe": item,
                "recipe_text": ""
            };
            let prompt = proto_prompt['data']['prompt']['context'] + '\n';
            for (const obj of proto_prompt['data']['prompt']['messages']) {
                prompt += obj['text'] + input[obj['content']];
            }
            json_response = yield promptOpenAI(proto_prompt['data']['prompt']['return'], prompt);
        }
        else {
            let proto_prompt = yield supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe_complex').single();
            // console.log(proto_prompt);
            const recipe_sites = yield axios_1.default.get(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=52d41ee068c0d4fc3&q=how to make ${item}`);
            const recipe_url = recipe_sites.data.items[0].link;
            //const recipe_url = "https://www.loveandlemons.com/how-to-make-hard-boiled-eggs/"
            console.log(recipe_url);
            const recipe_info = yield axios_1.default.get(recipe_url);
            const selector = cheerio.load(recipe_info.data);
            let pageText = selector('p')
                .map(function () {
                return selector(this).text().trim(); // Get and trim the text from each <p>
            })
                .get() // Convert to an array of strings
                .join('\n');
            // console.log(pageText);
            const input = {
                "recipe": item,
                "recipe_text": pageText
            };
            let prompt = proto_prompt['data']['prompt']['context'] + '\n';
            for (const obj of proto_prompt['data']['prompt']['messages']) {
                prompt += obj['text'] + input[obj['content']];
            }
            json_response = yield promptOpenAI(proto_prompt['data']['prompt']['return'], prompt);
        }
        //console.log(json_response);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(json_response);
            }, 1000);
        });
    });
}
