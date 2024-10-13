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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipe = getRecipe;
var dotenv = require("dotenv");
var supabase_js_1 = require("@supabase/supabase-js");
dotenv.config();
var PERPLEXITY = process.env.PERPLEXITY;
var SUPABASE_URL = (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : '';
var SUPABASE_KEY = (_b = process.env.SUPABASE_KEY) !== null && _b !== void 0 ? _b : '';
var NUM_TOKENS = 1000;
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
function getRecipe(item) {
    return __awaiter(this, void 0, void 0, function () {
        var proto_prompt, input, prompt, _i, _a, obj, message, message_str, options, response, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.from('prompts').select('prompt').eq('prompt_type', 'recipe').single()];
                case 1:
                    proto_prompt = _b.sent();
                    proto_prompt = proto_prompt['data']['prompt'];
                    input = {
                        "recipe": item
                    };
                    prompt = proto_prompt['context'] + '\n';
                    for (_i = 0, _a = proto_prompt['messages']; _i < _a.length; _i++) {
                        obj = _a[_i];
                        prompt += obj['text'] + input[obj['content']];
                    }
                    // prompt += '\n' + proto_prompt['return'];
                    console.log(prompt);
                    message = [{
                            "role": "system", "content": proto_prompt['return']
                        },
                        { "role": "user", "content": prompt },];
                    message_str = JSON.stringify(message);
                    options = {
                        method: 'POST',
                        headers: { Authorization: "Bearer ".concat(PERPLEXITY), 'Content-Type': 'application/json' },
                        body: "{\"model\":\"llama-3.1-sonar-small-128k-online\",\"messages\":".concat(message_str, ",\"max_tokens\":").concat(NUM_TOKENS, ",\"temperature\":0.2,\"top_p\":0.9,\"return_citations\":true,\"search_domain_filter\":[\"perplexity.ai\"],\"return_images\":false,\"return_related_questions\":false,\"search_recency_filter\":\"month\",\"top_k\":0,\"stream\":false,\"presence_penalty\":0,\"frequency_penalty\":1}")
                    };
                    return [4 /*yield*/, fetch('https://api.perplexity.ai/chat/completions', options)];
                case 2:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _b.sent();
                    return [2 /*return*/, new Promise(function (resolve) {
                            setTimeout(function () {
                                resolve(data);
                            }, 1000);
                        })];
            }
        });
    });
}
