"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipe = getRecipe;
var dotenv = require("dotenv");
var supabase_js_1 = require("@supabase/supabase-js");
var axios_1 = require("axios");
var cheerio = require("cheerio");
// import OpenAI from 'openai';
// import OpenAI from "openai";
dotenv.config();
var PERPLEXITY = process.env.PERPLEXITY;
var SUPABASE_URL = (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : '';
var SUPABASE_KEY = (_b = process.env.SUPABASE_KEY) !== null && _b !== void 0 ? _b : '';
var GOOGLE_API_KEY = (_c = process.env.GOOGLE_API) !== null && _c !== void 0 ? _c : '';
var USDA_API_KEY = (_d = process.env.USDA_API_KEY) !== null && _d !== void 0 ? _d : '';
var NUM_TOKENS = 1000;
var OPEN_AI = (_e = process.env.OPEN_AI) !== null && _e !== void 0 ? _e : '';
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
function removeTextAfterComment(text) {
    var index = text.toLowerCase().indexOf('comment');
    return index === -1 ? text : text.slice(0, index).trim();
}
function router(item) {
    return __awaiter(this, void 0, void 0, function () {
        var sys_prompt_raw, sys_prompt, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase.from('prompts').select('prompt').eq('prompt_type', 'router').single()];
                case 1:
                    sys_prompt_raw = _a.sent();
                    sys_prompt = sys_prompt_raw['data']['prompt']['sys'];
                    return [4 /*yield*/, axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
                                'Authorization': "Bearer ".concat(OPEN_AI)
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (response['data']['choices'][0]['message']['content'] === 'simple') {
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function promptOpenAI(sys_prompt, user_prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var response, json_response, errorMessage, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.post('https://api.openai.com/v1/chat/completions', {
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
                            'Authorization': "Bearer ".concat(OPEN_AI)
                        }
                    })];
                case 1:
                    response = _a.sent();
                    json_response = {};
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 3, , 5]);
                    json_response = JSON.parse(response['data']['choices'][0]['message']['content']);
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    errorMessage = e_1.Message;
                    console.log(errorMessage);
                    return [4 /*yield*/, axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                            "model": "gpt-4o-mini",
                            "messages": [
                                {
                                    "role": "system",
                                    "content": "You will read some faulty json and a error message and return valid json."
                                },
                                {
                                    "role": "user",
                                    "content": "Error Message: ".concat(errorMessage, "\nJSON: ").concat(response['data']['choices'][0]['message']['content'])
                                }
                            ]
                        }, {
                            "headers": {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(OPEN_AI)
                            }
                        })];
                case 4:
                    response = _a.sent();
                    json_response = JSON.parse(response['data']['choices'][0]['message']['content']);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, json_response];
            }
        });
    });
}
function getRecipe(item) {
    return __awaiter(this, void 0, void 0, function () {
        var simple, json_response, proto_prompt, input, prompt_1, _i, _a, obj, proto_prompt, recipe_sites, recipe_url, recipe_info, selector_1, pageText, input, prompt_2, _b, _c, obj;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, router(item)];
                case 1:
                    simple = _d.sent();
                    json_response = {};
                    if (!simple) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe').single()];
                case 2:
                    proto_prompt = _d.sent();
                    // console.log(proto_prompt);
                    proto_prompt = proto_prompt['data']['prompt'];
                    input = {
                        "recipe": item
                    };
                    prompt_1 = proto_prompt['context'] + '\n';
                    for (_i = 0, _a = proto_prompt['messages']; _i < _a.length; _i++) {
                        obj = _a[_i];
                        prompt_1 += obj['text'] + input[obj['content']];
                    }
                    return [4 /*yield*/, promptOpenAI(proto_prompt['return'], prompt_1)];
                case 3:
                    json_response = _d.sent();
                    return [3 /*break*/, 9];
                case 4: return [4 /*yield*/, supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe_complex').single()];
                case 5:
                    proto_prompt = _d.sent();
                    // console.log(proto_prompt);
                    proto_prompt = proto_prompt['data']['prompt'];
                    return [4 /*yield*/, axios_1.default.get("https://www.googleapis.com/customsearch/v1?key=".concat(GOOGLE_API_KEY, "&cx=52d41ee068c0d4fc3&q=how to make ").concat(item))];
                case 6:
                    recipe_sites = _d.sent();
                    recipe_url = recipe_sites.data.items[0].link;
                    //const recipe_url = "https://www.loveandlemons.com/how-to-make-hard-boiled-eggs/"
                    console.log(recipe_url);
                    return [4 /*yield*/, axios_1.default.get(recipe_url)];
                case 7:
                    recipe_info = _d.sent();
                    selector_1 = cheerio.load(recipe_info.data);
                    pageText = selector_1('p')
                        .map(function () {
                        return selector_1(this).text().trim(); // Get and trim the text from each <p>
                    })
                        .get() // Convert to an array of strings
                        .join('\n');
                    input = {
                        "recipe": item,
                        "recipe_text": pageText
                    };
                    prompt_2 = proto_prompt['context'] + '\n';
                    for (_b = 0, _c = proto_prompt['messages']; _b < _c.length; _b++) {
                        obj = _c[_b];
                        prompt_2 += obj['text'] + input[obj['content']];
                    }
                    return [4 /*yield*/, promptOpenAI(proto_prompt['return'], prompt_2)];
                case 8:
                    json_response = _d.sent();
                    _d.label = 9;
                case 9: 
                //console.log(json_response);
                return [2 /*return*/, new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(json_response);
                        }, 1000);
                    })];
            }
        });
    });
}
