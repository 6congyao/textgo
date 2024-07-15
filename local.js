const express = require('express');
const nlp = require('compromise');
const fs = require('fs');
const removeMd = require('remove-markdown');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const app = express();

let nounSynonyms;
let adjSynonyms;
let verbSynonyms;
let adverbSynonyms;

const temperature = 1;

const fastdProxy = createProxyMiddleware({
    target: 'http://localhost:8088/v1',
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Authorization', 'Bearer ');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept', '*/*');
            proxyReq.setHeader('Connection', 'keep-alive');
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            if (proxyRes.headers['content-type'] === 'application/json') {
                let result = {
                    messages: [{
                        "role": "assistant",
                        "type": "answer",
                        "content": "",
                        "content_type": "text"
                    }],
                    "code": 0,
                    "msg": "",
                };

                let oriResult = JSON.parse(responseBuffer.toString('utf8'));

                if (res.statusCode >= 400) {
                    result['code'] = oriResult['code'];
                    result['msg'] = oriResult['message'];
    
                } else {
                    // manipulate JSON data here
                    if ('answer' in oriResult) {
                        result['messages'][0]['content'] = oriResult['answer'];
                        result['msg'] = "success";
                    }
                }
                // return manipulated JSON
                return JSON.stringify(result);
            }
            // return other content-types as-is
            return responseBuffer;
        }),
        error: (err, req, res) => {
            console.log(err);
        },
    },
});

const enhancedProxy = createProxyMiddleware({
    target: 'http://localhost:8088/v1',
    changeOrigin: true,
    selfHandleResponse: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Authorization', 'Bearer ');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept', '*/*');
            proxyReq.setHeader('Connection', 'keep-alive');
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            if (proxyRes.headers['content-type'] === 'application/json') {
                let result = {
                    messages: [{
                        "role": "assistant",
                        "type": "answer",
                        "content": "",
                        "content_type": "text"
                    }],
                    "code": 0,
                    "msg": "",
                };

                let oriResult = JSON.parse(responseBuffer.toString('utf8'));

                if (res.statusCode >= 400) {
                    result['code'] = oriResult['code'];
                    result['msg'] = oriResult['message'];
    
                } else {
                    // manipulate JSON data here
                    if ('answer' in oriResult) {
                        let output = rewrite(oriResult['answer']);

                        result['messages'][0]['content'] = output;
                        result['msg'] = "success";
                    }
                }
                // return manipulated JSON
                return JSON.stringify(result);
            }
            // return other content-types as-is
            return responseBuffer;
        }),
        error: (err, req, res) => {
            console.log(err);
        },
    },
});

// Plugin to replace words with synonyms
const synonymPlugin = {
    api: function (View) {
        View.prototype.replaceWithSynonyms = function (nounsDict, adjsDict, verbsDict, adverbsDict) {
            if (nounsDict) {
                // swap nouns
                let m1 = this.match('#Noun+');
                m1.compute('root');
                let nouns = m1.text('root').split(' ');
                nouns.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "");
                    if (nounsDict[clean]) {
                        const synonyms = nounsDict[clean];
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap nouns: ' + clean + ' -> ' + synonyms);
                        this.swap(clean, synonym);
                    }
                });
            }

            // swap verbs
            if (verbsDict) {
                let m2 = this.match('#Verb+');
                m2.map(v => {
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon)').found) {
                        return v;
                    }
                    if (v.has('(#Modal+|#Copula+|#Auxiliary+)')) {
                        let arr = v.splitAfter('(#Modal+|#Copula+|#Auxiliary+)').out('array');
                        const len = arr.length;
                        v = nlp(arr[len - 1]);
                    }
                    v.compute('root');
                    const clean = v.text('root');
                    console.log(clean);
                    if (verbsDict[clean]) {
                        const synonyms = verbsDict[clean];
                        let synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        if (v.match('@isTitleCase').text() === v.text()) {
                            synonym = synonym.charAt(0).toUpperCase() + synonym.slice(1);
                        }
                        console.log('#Swap verbs: ' + v.text() + ' -> ' + synonym);
                        return v.swap(clean, synonym);
                    }
                    return v;
                })
            }

            // swap adjectives
            if (adjsDict) {
                let m3 = this.match('#Adjective+');
                m3.map(v => {
                    const clean = v.text('normal').replace(/\p{P}/gu, "");
                    if (adjsDict[clean]) {
                        const synonyms = adjsDict[clean];
                        let synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        if (v.match('@isTitleCase').text() === v.text()) {
                            synonym = synonym.charAt(0).toUpperCase() + synonym.slice(1);
                        }
                        console.log('#Swap adjectives: ' + v.text() + ' -> ' + synonym);
                        return this.replace(clean, synonym);
                    }
                    return v;
                })
            }

            // swap advs
            if (adverbsDict) {
                let m4 = this.match('#Adverb+');
                m4.map(v => {
                    const clean = v.text('normal').replace(/\p{P}/gu, "");
                    if (adverbsDict[clean]) {
                        const synonyms = adverbsDict[clean];
                        let synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        if (v.match('@isTitleCase').text() === v.text()) {
                            synonym = synonym.charAt(0).toUpperCase() + synonym.slice(1);
                        }
                        console.log('#Swap adverbs: ' + v.text() + ' -> ' + synonym);
                        return this.replace(clean, synonym);
                    }
                    return v;
                })
            }

            return this.text();
        };
    }
};

function init() {
    // nounSynonyms = load_synonyms('./synonyms/nouns.json')
    // adjSynonyms = load_synonyms('./synonyms/adjectives.json')
    verbSynonyms = load_synonyms('./synonyms/verbs.json')
    // adverbSynonyms = load_synonyms('./synonyms/adverbs.json')
}

function rewrite(content) {
    const plainText = removeMd(content);
    let patchedText = prePatch(plainText);
    const sentences = nlp(patchedText).sentences();
    // console.log("<-:" + content);
    sentences.map(s => {
        s.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);
        return s.firstTerms().toTitleCase();;
    })
    // console.log("->:" + sentences.text());
    return addTricks(sentences.text());
}

init();

function load_synonyms(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error('File read failed:', err);
    }
}

function postHandle(content) {
    const trick1 = '\u2008';
    const trick2 = ',\u2008';
    const patch1 = '(';
    const patch2 = ')';
    const patch3 = ' ';

    let output = content.replaceAll('\u200c ', trick1);
    output = output.replaceAll('\u301D', patch1);
    output = output.replaceAll('\u301E', patch2);
    output = output.replaceAll('  ', patch3);
    output = output.replaceAll('\"*\"', '*')
    // output = output.replaceAll(' \u200d', '');

    return output;
}

function sentenceHandle(sentence) {
    // let m = sentence.match('(#Modal+|#Copula+|#Preposition+|#Conjunction+|#Pronoun+|#Determiner+)');
    let m = sentence.match('(#Copula+|#Preposition+|#Conjunction+|#Pronoun+|#Determiner+)');
    // console.log(m.out('array'));
    m.map(v => {
        if (Math.random() <= temperature) {
            // console.log("##:" + v.text());
            if (v.match('(@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                return v;
            }
            const target = v.text() + '\u200c';
            // console.log(target + ' <-> ' + v.text());
            v.replace(v.text(), target);
        }

        return v;
    })
    return sentence;
}

function addTricks(doc) {
    const sentences = nlp(doc).sentences();

    sentences.map(s => {
        s = sentenceHandle(s);
        return s;
    })

    return postHandle(sentences.text());
}

function prePatch(text) {
    let result = text.replaceAll("\n\n\n", "\n");
    result = result.replaceAll("\n\n", "\n");
    result = result.replaceAll("  ", " ");
    result = result.replaceAll("(", "\u301D");
    result = result.replaceAll(")", "\u301E");
    // result = result.replaceAll("**", "\u200d**\u200d");
    result = result.replaceAll("*", "\"*\"");

    return result;
}

// Extend Compromise with the plugin
nlp.extend(synonymPlugin);

app.use('/api/v2/enhanced', enhancedProxy);
app.use('/api/v2/fast', fastdProxy);

// Setting port and serve
const PORT = process.env.PORT || 8089;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
