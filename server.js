const express = require('express');
const nlp = require('compromise');
const fs = require('fs');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const app = express();

let nounSynonyms;
let adjSynonyms;
let verbSynonyms;
let adverbSynonyms;

const apiProxy = createProxyMiddleware({
    target: 'https://api.coze.com/open_api',
    changeOrigin: true,
    selfHandleResponse: true,
    on: {
        proxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('Authorization', 'Bearer ');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Host', 'api.coze.com');
            proxyReq.setHeader('Accept', '*/*');
            proxyReq.setHeader('Connection', 'keep-alive');
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            if (proxyRes.headers['content-type'] === 'application/json; charset=utf-8') {
                let data = JSON.parse(responseBuffer.toString('utf8'));

                // manipulate JSON data here
                if (data['msg'] !== 'success') {
                    res.statusCode = 403;
                } else {
                    if ('messages' in data) {
                        for (let msg of data['messages']) {
                            if ('type' in msg) {
                                if (msg['type'] === 'answer') {
                                    let output = rewrite(msg['content']);
                                    // let target = msg['content'].replaceAll(' ', spacechar);
                                    msg['content'] = output;
                                    break;
                                }
                            }
                        }
                    }
                }
                // return manipulated JSON
                return JSON.stringify(data);
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
                    const clean = term.replace(/\p{P}/gu, "")
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
                let m2 = this.match('#Verb');
                m2.compute('root');
                let verbs = m2.text('root').split(' ');
                // console.log(verbs);
                verbs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (verbsDict[clean]) {
                        const synonyms = verbsDict[clean];
                        // console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap verbs: ' + clean + ' -> ' + synonyms);
                        this.swap(clean, synonym);
                    }
                });
            }

            // swap adjectives
            if (adjsDict) {
                let adjs = this.match('#Adjective').out('array');
                // m3.compute('root');
                // let adjs = m3.text('root').split(' ');
                // console.log(adjs);
                adjs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (adjsDict[clean]) {
                        const synonyms = adjsDict[clean];
                        // console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap adjectives: ' + clean + ' -> ' + synonyms);
                        this.replace(clean, synonym);
                    }
                });
            }

            // swap advs
            if (adverbsDict) {
                let adverbs = this.match('#Adverb').out('array');
                // m4.compute('root');
                // let adverbs = m4.text('root').split(' ');
                // console.log(adverbs);

                adverbs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (adverbsDict[clean]) {
                        const synonyms = adverbsDict[clean];
                        // console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap adverbs: ' + clean + ' -> ' + synonyms);
                        this.replace(clean, synonym);
                    }
                });
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
    let doc = nlp(content);
    let output = doc.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);
    return addTricks(capitalizeFirstLetterOfEachSentence(output));
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

function capitalizeFirstLetterOfEachSentence(text) {
    const sentences = text.split(/([.!?]\s*)/);

    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].length > 0) {
            sentences[i] = sentences[i].charAt(0).toUpperCase() + sentences[i].slice(1);
        }
    }

    return sentences.join('');
}

function addTricks(doc) {
    const trick1 = ',\u2008';
    const trick2 = '.\u2007';

    let output = doc.replaceAll(', ', trick1);
    output = output.replaceAll('. ', trick2);

    return output;
}

// Extend Compromise with the plugin
nlp.extend(synonymPlugin);

app.use('/api', apiProxy);

// Setting port and serve
const PORT = process.env.PORT || 8089;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
