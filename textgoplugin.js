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
    adjSynonyms = load_synonyms('./synonyms/adjectives.json')
    // verbSynonyms = load_synonyms('./synonyms/verbs.json')
    // adverbSynonyms = load_synonyms('./synonyms/adverbs.json')
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
        View.prototype.fillMaskInSentences = function () {
            let m = this.match('(#Adverb #Adjective|#Adjective+)');
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
                    // if (v.match('@isTitleCase').text() === v.text()) {
                    //     return v;
                    // }
                    console.log(v.text() + ' -> ' + '<mask>');
                    done = true;
                    return v.replace(v, '<mask> ' + v.text());
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
                let m4 = this.match('#Adverb+');
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
// const text = `OpenAI is committed to democratizing AI research, and its open-source strategies and collaborations with the global AI community reflect that.
// By opening up its research and tools to researchers and developers around the world, OpenAI promotes innovation and helps speed up the development of AI.`;
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
const text = `Parental Control: Navigating the Digital Age for Child Safety and Well-being.
As the digital landscape continues evolving, parental control has become increasingly vital in helping parents keep their kids safe and healthy. With digital devices and online platforms capturing the attention of younger generations like never before, parents face more challenges concerning the well-being of their children and it is increasingly being done through technology. Parental control is how parents monitor, manage and help guide their children, to create a healthy and safe digital environment, this article will highlight ways to go about it.
Why Parental Control Matters.
From education to play, to social activities, internet access is changing the way children do it all, and while there are many benefits, including interaction and information, there are also pitfalls. Cyberbullying, adult content, contact with potential predators and the amount of time spent plugged in, are just a few of the threats children may face, and parental control is important because of the following.
Keeping Kids Safe Online.
The biggest reason that most parents implement parental control to begin with is to keep their kids safe online. The internet is an expansive, largely unfiltered world and children can easily come across things that may be shocking, such as violence and pornography, or that leads to hate. With parental control, parents can use tools to filter and block websites and content so children have a lesser chance of seeing inappropriate material.
Limiting Bullying.
Cyberbullying can be just as bad -- if not worse, and parents can monitor their children via parental control throughout their social media to identify problems and be able to act accordingly. Parents can therefore help keep children of cyberbullying.
Controlling Screen Time.
Screen time is a new challenge for parents, as an excess of it can affect children physically, psychologically and academically; even socially. With parental control, parents are allowed to limit screen time, schedule the use of devices and provide digital curfews. Parents can do it all in order to create a better balance between adults and children in a digital world.
Protecting Privacy and Information.
Kids sometimes don’t realize how important is it not to share too much with strangers online. With parental control, parents can not only help children learn about safety, but also supervise the sharing of information to protect data from strangers as well as family and friends. It’s particularly relevant in an era when identity theft and data breaches are news headlines.
Teaching Responsible Digital Citizenship..
Parental control is not only about limiting access and keeping tabs, it’s also about raising responsible kids. Parents can teach their children how to navigate the internet safely and become responsible digital citizens through participation in their kids appliance usage. Good digital citizenship consists of everything from being ethical with technology, to being respectful online, to understanding the ripple effects of clicky actions.`;

const plainText = removeMd(text);

let text2 = prePatch(plainText);
// console.log(text2);
// const sentences = text.match(/([^\。.?!？！]+[.?!。？！])/g);
const sentences = nlp(text2).sentences();

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
    s.fillMaskInSentences();
    if (s.text().indexOf('<mask>') != -1) {
        sentences_masked.push(s.text())
    }

    return s;
})

// console.log('!!!: ' + sentences_masked);
callFillMaskBaseApi(sentences_masked, sentences);
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