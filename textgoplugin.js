const nlp = require('compromise');
const fs = require('fs');
const http = require('http');
const removeMd = require('remove-markdown');

let nounSynonyms;
let adjSynonyms;
let verbSynonyms;
let adverbSynonyms;

const temperature = 1;

function init() {
    // nounSynonyms = load_synonyms('./synonyms/nouns.json')
    // verbSynonyms = load_synonyms('./synonyms/verbs.json')
    // adjSynonyms = load_synonyms('./synonyms/adjectives.json')
    adverbSynonyms = load_synonyms('./synonyms/adverbs.json')
}

function callParaphraseApi(reqData, sentences_raw) {
    const postData = JSON.stringify({
        sentences: reqData,
    });

    const options = {
        hostname: 'localhost',
        port: 6000,
        path: '/sentences',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            let sentences_filled = JSON.parse(data);
            let text_masked = sentences_raw.text();

            sentences_filled['sentences'].forEach((sentence, index) => {
                text_masked = text_masked.replace(sentences_masked[index], sentence)
            });

            console.log('->:' + postHandle(text_masked));
            return;
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(postData);
    req.end();
}


function asyncCallFillMaskBaseApi(reqData, sentences_raw) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            sentences: reqData,
        });

        const options = {
            hostname: 'localhost',
            port: 6000,
            path: '/sentences',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                let sentences_filled = JSON.parse(data);
                let text_masked = sentences_raw.text();

                // console.log(sentences_filled)
                sentences_filled['sentences'].forEach((sentence, index) => {
                    text_masked = text_masked.replace(reqData[index], sentence)
                });
                // console.log('->:' + postHandle(text_masked));

                resolve(text_masked);
            });
        });

        req.on('error', (error) => {
            // console.error(error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}


function callFillMaskBaseApi(reqData, sentences_raw) {
    const postData = JSON.stringify({
        sentences: reqData,
    });

    const options = {
        hostname: 'localhost',
        port: 6000,
        path: '/sentences',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            let sentences_filled = JSON.parse(data);
            let text_masked = sentences_raw.text();

            // console.log(sentences_filled)
            sentences_filled['sentences'].forEach((sentence, index) => {
                text_masked = text_masked.replace(sentences_masked[index], sentence)
            });

            console.log('->:' + postHandle(text_masked));
            return;
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(postData);
    req.end();
}

// Plugin to fill mask of sentences
const robertaPlugin = {
    api: function (View) {
        View.prototype.fillMaskBeforeAdjective = function () {
            let m = this.match('(#Adverb #Conjunction? #Adjective|#Adjective+)');
            let done = false;
            console.log(m.out('array'));
            m.map(v => {
                if (!done) {
                    // console.log(v.splitAfter('(#Adverb|#Adjective)').out('array'));
                    if (v.splitAfter('(#Adverb|#Adjective)').out('array').length > 1) {
                        return v;
                    }
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    if (v.match('@isTitleCase').text() === v.text()) {
                        return v;
                    }
                    console.log(v.text() + ' -> ' + '<mask>');
                    done = true;
                    return v.replace(v, '<mask> ' + v.text());
                }
                return v;
            })
        };
        View.prototype.fillMaskAfterOthers = function () {
            let m = this.match('(#Copula|#Preposition|#Conjunction|#Determiner)');
            let done = false;
            console.log(m.out('array'));
            m.map(v => {
                if (!done) {
                    // console.log(v.splitAfter('(#Adverb|#Adjective)').out('array'));
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    // if (v.match('@isTitleCase').text() === v.text()) {
                    //     return v;
                    // }
                    console.log(v.text() + ' -> ' + '<mask>');
                    done = true;
                    return v.replace(v, v.text() + ' <mask>');
                }
                return v;
            })
        };
        View.prototype.fillMaskBeforeAdverb = function () {
            let m = this.match('(#Adverb #Conjunction? #Adverb|#Adverb #Conjunction? #Adjective|#Adverb+)');
            let done = false;
            console.log(m.out('array'));
            m.map(v => {
                if (!done) {
                    if (v.splitAfter('(#Adverb|#Verb)').out('array').length > 1) {
                        return v;
                    }
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    if (v.match('@isTitleCase').text() === v.text()) {
                        return v;
                    }
                    console.log(v.text() + ' -> ' + '<mask>');
                    done = true;
                    return v.replace(v, '<mask> ' + v.text());
                }
                return v;
            })
        };
        View.prototype.fillMaskReplaceVerb = function () {
            if (this.wordCount() < 5) {
                return;
            }
            // let m = this.match('#Verb');
            // let m = this.match('#Adverb');
            let m = this.match('#Adjective');
            let done = false;
            console.log(m.out('array'));
            m.map(v => {
                if (!done) {
                    // console.log(v.splitAfter('(#Adverb|#Adjective)').out('array'));
                    // if (v.splitAfter('(#Adverb|#Adjective)').out('array').length > 1) {
                    //     return v;
                    // }
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    // if (v.match('@isTitleCase').text() === v.text()) {
                    //     return v;
                    // }
                    console.log(v.text() + ' -> ' + '<mask>');
                    done = true;
                    return v.replace(v, '<mask>');
                }
                return v;
            })
        };
        View.prototype.fillMaskReplaceOthers = function () {
            if (this.wordCount() < 5) {
                return;
            }
            let m = this.match('(#Copula|#Preposition|#Conjunction|#Determiner)');
            let done = false;
            console.log(m.out('array'));
            m.map(v => {
                if (!done) {
                    // console.log(v.splitAfter('(#Adverb|#Adjective)').out('array'));
                    // if (v.splitAfter('(#Adverb|#Adjective)').out('array').length > 1) {
                    //     return v;
                    // }
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    // if (v.match('@isTitleCase').text() === v.text()) {
                    //     return v;
                    // }
                    console.log(v.text() + ' -> ' + '<mask>');
                    done = true;
                    return v.replace(v, '<mask>');
                }
                return v;
            })
        };
    }
};

// Plugin to replace words with synonyms
const synonymPlugin = {
    api: function (View) {
        View.prototype.replaceWithSynonyms = function (nounsDict, adjsDict, verbsDict, adverbsDict) {
            if (nounsDict) {
                // swap nouns
                let m1 = this.match('#Noun+');
                console.log(m1.out('array'));
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
                let m2 = this.match('#Verb+');
                // console.log(m2.out('array'));
                m2.map(v => {
                    console.log(v.text());
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    if (v.has('(#Modal+|#Copula+|#Auxiliary+)')) {
                        let arr = v.splitAfter('(#Modal+|#Copula+|#Auxiliary+)').out('array');
                        const len = arr.length;
                        v = nlp(arr[len - 1]);
                        console.log(v.text());
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
                console.log(m3.out('array'));
                m3.map(v => {
                    // const clean = v.text('normal').replace(/\p{P}/gu, "");
                    // console.log(clean);
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    const clean = v.text();
                    if (adjsDict[clean]) {
                        const synonyms = adjsDict[clean];
                        let synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        if (v.match('@isTitleCase').text() === v.text()) {
                            synonym = synonym.charAt(0).toUpperCase() + synonym.slice(1);
                        }
                        console.log('#Swap adjectives: ' + v.text() + ' -> ' + synonym);
                        return v.replace(clean, synonym);
                    }
                    return v;
                })
            }

            // swap advs
            if (adverbsDict) {
                let m4 = this.match('(#Adverb+ #Conjunction? #Adverb+|#Adverb+ #Conjunction? less|#Adverb+)');
                console.log(m4.out('array'));
                m4.map(v => {
                    // const clean = v.text('normal').replace(/\p{P}/gu, "");
                    if (v.match('(@hasDash|@hasHyphen|@hasComma|@hasQuote|@hasPeriod|@hasExclamation|@hasQuestionMark|@hasEllipses|@hasSemicolon|@hasColon|@hasContraction)').found) {
                        return v;
                    }
                    const clean = v.text();
                    if (adverbsDict[clean]) {
                        const synonyms = adverbsDict[clean];
                        let synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        if (v.match('@isTitleCase').text() === v.text()) {
                            synonym = synonym.charAt(0).toUpperCase() + synonym.slice(1);
                        }
                        console.log('#Swap adverbs: ' + v.text() + ' -> ' + synonym);
                        return v.replace(clean, synonym);
                    }
                    return v;
                })
            }

            return this.text();
        };
    }
};

init();
// Extend Compromise with the plugin
nlp.extend(synonymPlugin);
nlp.extend(robertaPlugin);

// Example text
const text = `Parental control becomes more and more important as the digital world grows and parents increasingly rely on tools and mechanisms to keep their children safe and healthy in a world where technology has a growing footprint in children's lives, fast and quickly.`;
// const text = `He is like a boy. He liked that girl, anyway he likes. Elon Musk stands as a titan of modern innovation.`;
// const text = `The Rise of OpenAI: A New Era in Artificial Intelligence.
// OpenAI is rapidly becoming a leader in artificial intelligence (AI), developing state-of-the-art technologies and conducting world-class research.
// Founded in 2015, OpenAI aims to develop artificial general intelligence (AGI)—highly autonomous systems that outperform humans at most economically valuable work—and make sure that its benefits are shared by everyone.
// This article looks at how OpenAI is changing the AI game and where it may be heading in the future.
// One of OpenAI's key strengths is its development of the GPT (Generative Pre-trained Transformer) algorithms that write text that looks similar to how a human would write it, based on input prompts.
// The ability of GPT algorithms to understand context and structure has made them game changers in natural language processing tasks, including translation, text generation and answering questions.
// OpenAI is committed to democratizing AI research, and its open-source strategies and collaborations with the global AI community reflect that.
// By opening up its research and tools to researchers and developers around the world, OpenAI promotes innovation and helps speed up the development of AI.
// OpenAI can already point to real-world applications of its AI technologies in numerous fields.
// Its machine-learning algorithms have beaten humans at intricate games such as chess and Go, and its AI is already generating images and video of extraordinary quality.
// Importantly too, OpenAI takes seriously the ethical issues that arise from its implementation of AI technologies and systems.
// The organization believes in responsible development of AI and stresses the importance of transparency, fairness, and safety as AI becomes more prevalent.
// In confronting these challenges, OpenAI endeavors to make sure that AI helps people, rather than doing them harm.
// Moving forward, OpenAI will continue to push the boundaries of AI, and help humans unlock a portion of its immense potential.
// With cutting-edge research, collaborative partnerships, and a focus on ethical AI development rounding out its core mission, OpenAI promises to be hugely important to the future of artificial intelligence—and the way in which it will change our lives in the years ahead.`;
// 
// const text = `Gender equality in labor force participation, in education and healthcare, and wage parity all yield significant benefits for the economy. According to the McKinsey Global Institute, these forms of gender equality could potentially add $12 trillion to the world economy by 2025.
// Health and Well-being
// Gender equality benefits health and well-being. Greater equality in access to healthcare enables women to look after their own health better. Gender equality in education improves women’s health outcomes and those of their families, as educated women are more likely to make informed health choices and to seek medical help as necessary. And gender equality is associated with lower risks of violence against women, a problem that is itself both a cause and a consequence of poor physical and mental health.
// Political Stability and Peace
// Gender equality fosters political stability and peace. When women are included in negotiations and in decision-making, they respond differently, bringing up different issues and solutions. Research also suggests that peace settlements in civil wars are more likely to be sustainable when they are negotiated with the participation of women. Women’s political engagement raises the likelihood of their priorities being addressed and, possibly as a consequence, of successful conflict resolution.
// Challenges to Achieving Gender Equality
// Given the many benefits associated with gender equality, why is it so difficult to achieve? The reason is simply that gender disparities run deep, and that economic, legal and social structures often conspire to perpetuate inequality. Meeting the challenge of gender inequality requires comprehensive approaches to changing the beliefs of individuals, to reforming the rules of the game found in laws and policies, and to implementing increasingly effective targeted interventions where necessary.
// Cultural Norms and Stereotypes
// Cultural norms and stereotypes are an important obstacle to gender equality. The assignment of gender roles in most societies to women as the primary caregivers limits opportunities both for women and for men. In some societies, it restricts women’s access to wage labor, in others, men’s access to caregiving. Stereotypes operate in a variety of ways and at multiple levels.
// For example, cultural stereotyping can discourage girls from pursuing higher education or entry into science, technology, engineering, and mathematics (STEM) fields. This limits their individual potential, but also deprives their societies of potentially significant scientific contributions.
// Legal and Policy Barriers
// Legal and policy barriers contribute to discrimination and to unequal opportunities. For example, some societies have long restricted women’s access to certain sectors of the economy or certain occupations though employment and inheritance laws. Women in other societies earn lower wages than men and receive fewer benefits, including paid leave for pregnancy or illness. Legal reforms and policies aimed at reducing disparities can make important contributions to eliminating gender inequalities.
// Economic Barriers
// Economic barriers are both a root cause and a consequence of gender inequality. Women end up over-represented in some of the lowest paying, most insecure and most informal jobs in the world. Gender wage gaps characterize most of the world’s labor markets. Women’s participation in paid work more generally and in formal work specifically is often limited by inadequate access to paid leave for maternity and parental responsibilities.
// Countering economic inequalities necessarily involves legal and policy measures. Governments can encourage more equal participation in economic and in social life through a variety of means, including eliminating discriminatory laws and practices in the labor market, enforcing work-place safety standards and protecting workers against discrimination.
// Governments can also promote gender equality by investing in care – in young children, the elderly and those needing medical attention and assistance.`;

const plainText = removeMd(text);

let text2 = prePatch(plainText);
// console.log(text2);
// const sentences = text.match(/([^\。.?!？！]+[.?!。？！])/g);
let sentences = nlp(text2).sentences();

let sentences_masked = [];

// # repalcement
sentences.map(s => {
    s.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);
    return s;
})

// # paraphraser
// sentences.map(s => {
//     sentences_masked.push(s.text())
// })

// # roberta
sentences.map(s => {
    // console.log('##' + s.text())
    // s.fillMaskReplaceVerb();
    // s.fillMaskAfterOthers();
    s.fillMaskBeforeAdverb();
    if (s.text().indexOf('<mask>') != -1) {
        sentences_masked.push(s.text())
    }

    return s;
})

// console.log('!!!: ' + sentences_masked);
asyncCallFillMaskBaseApi(sentences_masked, sentences).then((latest_doc) => {
    sentences = nlp(latest_doc).sentences();
    sentences_masked = [];
    sentences.map(s => {
        s.fillMaskBeforeAdjective();
        if (s.text().indexOf('<mask>') != -1) {
            sentences_masked.push(s.text())
        }

        return s;
    })

    return asyncCallFillMaskBaseApi(sentences_masked, sentences);

}).then((latest_doc) => {
    sentences = nlp(latest_doc).sentences();
    sentences_masked = [];
    sentences.map(s => {
        // console.log('##' + s.text())
        // s.fillMaskReplaceOthers();
        // s.fillMaskAfterOthers();
        if (s.text().indexOf('<mask>') != -1) {
            sentences_masked.push(s.text())
        }

        return s;
    })

    return asyncCallFillMaskBaseApi(sentences_masked, sentences);
    
}).then((latest_doc) => {
    console.log('->:' + postHandle(latest_doc));
});



// sentences = callFillMaskBaseApi(sentences_masked, sentences);

// callParaphraseApi(sentences_masked, sentences);




// sentences.forEach((sentence, index) => {
//     // let output = sentenceHandler(sentence)
//     console.log(`Sentence ${index + 1} in : ${sentence}`);
//     // console.log(`Sentence ${index + 1} out: ${output}`);
// });

// Replace words with synonyms
// let output = doc.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);


// Output the modified text
// console.log('<-:' + text);
// console.log('->:' + sentences.text());
// console.log('->:' + addTricks(sentences.text()));
// console.log('->:' + addTricks(capitalizeFirstLetterOfEachSentence(sentences.text())));
// console.log("->:" + capitalizeFirstLetterOfEachSentence(sentences.text()));

function prePatch(text) {
    let result = text.replaceAll("\n\n", "\n");
    result = result.replaceAll("(", "\u301D");
    result = result.replaceAll(")", "\u301E");
    result = result.replaceAll("*", "\"*\"");

    return result;
}

function load_synonyms(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error('File read failed:', err);
    }
}

function addTricks(doc) {
    const sentences = nlp(doc).sentences();

    sentences.map(s => {
        s = sentenceHandle(s);
        return s;
    })

    return postHandle(sentences.text());
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

function postHandle(content) {
    const trick1 = '\u2008';
    const trick2 = ',\u2008';
    const patch1 = '(';
    const patch2 = ')';
    const patch3 = ' ';

    let output = content.replaceAll('\u200c ', trick1);
    // output = output.replaceAll(', ', trick2);
    output = output.replaceAll('\u301D', patch1);
    output = output.replaceAll('\u301E', patch2);
    output = output.replaceAll('  ', patch3);
    output = output.replaceAll(' \u200d', '');
    output = output.replaceAll('\u200d', '')
    // output = output.replaceAll('\"**\"', '**')
    output = output.replaceAll('\"*\"', '*')

    return output;
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

// token sizes
const MAX = 5
const MIN = 2
// output properties
const opts = { offset: true, terms: false };

// tokenizers to run in descending order, until satisfied
let methods = [
    // split prepositions 'in, by, for'
    (part) => part.splitBefore('#Preposition'),
    // 'and, or, but'
    (part) => part.splitBefore('#Conjunction'),
    // 'if ...'
    (part) => part.splitBefore('(if|which|so|then)'),
    // 'talk quickly'
    (part) => part.splitAfter('#Verb #Adverb+'),
    // 'walks to'
    (part) => part.splitBefore('#PresentTense to'),
    // '99 reasons'
    (part) => part.splitAfter('#Value #Noun+'),
    // 'spencer kelly'
    (part) => part.splitAfter('#ProperNoun+'),
    // 'Canada's'
    (part) => part.splitBefore('#Possessive+'),
    // 'aug 10th 2023'
    (part) => part.splitAfter('#Date+'),
    // 'i suspect'
    (part) => part.splitBefore('#Pronoun'),
    // 'is very nice'
    (part) => part.splitAfter('#Copula #Adverb+? #Adjective'),
    // spencer walks
    (part) => part.splitAfter('[#Noun] #Verb', 0),
    // split on any comma?
    (part) => part.splitAfter('@hasComma'),
    // fallback, split blindly after 5 words
    (part) => part.splitAfter('.{5}')
]

const splitOne = function (part) {
    for (let i = 0; i < methods.length; i += 1) {
        if (part.terms().length <= MAX) {
            return part
        }
        part = methods[i](part)
    }
    return part;
}

const splitList = function (list) {
    let out = list.none()
    list.forEach((part) => {
        out = out.concat(splitOne(part))
    })
    return out;
}

// find anything < MIN and join to neighbour
const joinSmalls = function (list) {
    let out = list.none()
    for (let i = 0; i < list.length; i += 1) {
        let part = list.eq(i)
        let beside = list.eq(i + 1)
        if (part.terms().length < MIN && beside.found && beside.lookBefore('.').found) {
            out = out.concat(part.append(beside))
            i += 1
        } else {
            out = out.concat(part)
        }
    }
    return out;
}

// loosely tokenize text by phrases of a given size
const getPhrases = function (str) {
    let doc = nlp(str)
    // first, split commas, semicolons
    let list = doc.clauses()
    // other natural sentence chunks
    list = list.splitOn(doc.parentheses())
    list = list.splitOn(doc.quotations())
    // run each of our split methods, in sequence
    list = splitList(list)
    // join any too-small
    list = joinSmalls(list)
    return list.json(opts);
}

// console.log(getPhrases(text));