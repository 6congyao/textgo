const nlp = require('compromise');
const fs = require('fs');
const removeMd = require('remove-markdown');

let nounSynonyms;
let adjSynonyms;
let verbSynonyms;
let adverbSynonyms;

const temperature = 1;

function init() {
    // nounSynonyms = load_synonyms('./synonyms/nouns.json')
    // adjSynonyms = load_synonyms('./synonyms/adjectives.json')
    verbSynonyms = load_synonyms('./synonyms/verbs.json')
    // adverbSynonyms = load_synonyms('./synonyms/adverbs.json')
}

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
                let m2 = this.match('#Verb+');
                console.log(m2.out('array'));
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
                // console.log(m3.out('array'));
                m3.map(v => {
                    const clean = v.text('normal').replace(/\p{P}/gu, "");
                    // console.log(clean);
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
                // console.log(m4.out('array'));
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

init();
// Extend Compromise with the plugin
nlp.extend(synonymPlugin);

// Example text
// const text = `Let's face it, our phones are basically extensions of ourselves. `;
// const text = `He is like a boy. He liked that girl, anyway he likes. Elon Musk stands as a titan of modern innovation.`;
const text = `	Drink calcium-fortified orange juice.`;


// const text = `The rapid evolution of AI, particularly in natural language processing and machine learning, positions it as a potential replacement for human article writers. Advanced content generation tools like GPT-4 demonstrate the ability to produce high-quality, contextually relevant articles across diverse topics. Trained on massive datasets, these tools can emulate various writing styles and formats, generating content at speeds unmatched by humans. This efficiency makes them invaluable for meeting deadlines and large-scale content demands. AI's capacity to analyze data and trends ensures the creation of timely and accurate articles.  Furthermore, AI writing tools are constantly refined through machine learning, enhancing their ability to handle complex and specialized subjects. Businesses can leverage these tools to reduce costs associated with large writing teams and boost productivity by automating repetitive writing tasks. This allows human writers to focus on more creative and strategic aspects of content creation. However, while AI demonstrates significant potential, it lacks the nuanced understanding, emotional depth, and creativity inherent in human writers. The optimal approach involves a collaborative integration of AI and human expertise, leveraging the strengths of both to produce exceptional content.  Ethical considerations, such as transparency regarding AI-generated content and upholding quality standards, are paramount. While AI excels at generating large volumes of content efficiently, human oversight remains essential to ensure authenticity and emotional resonance. As AI technology advances, it is poised to become an indispensable tool in content creation, augmenting human capabilities and shaping the future of writing. In essence, AI's role in content creation is rapidly expanding, presenting numerous advantages. However, striking a balance between automation and human creativity, while addressing ethical considerations, is crucial to achieving optimal outcomes.`;
// const text = `Advanced content-generation-tools like GPT-4 demonstrate the ability to produce high-quality.`;

const plainText = removeMd(text);

let text2 = prePatch(plainText);
// console.log(text2);
// const sentences = text.match(/([^\。.?!？！]+[.?!。？！])/g);
const sentences = nlp(text2).sentences();

// const sentences = nlp(text)
// console.log(sentences.text());
sentences.map(s => {
    s.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);
    // console.log('!!!: ' + s.text());
    // return s.firstTerms().toTitleCase();
    return s;
})
// sentences.forEach((sentence, index) => {
//     // let output = sentenceHandler(sentence)
//     console.log(`Sentence ${index + 1} in : ${sentence}`);
//     // console.log(`Sentence ${index + 1} out: ${output}`);
// });

// Replace words with synonyms
// let output = doc.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);


// Output the modified text
console.log('<-:' + text);
console.log('->:' + addTricks(sentences.text()));
// console.log('->:' + addTricks(capitalizeFirstLetterOfEachSentence(sentences.text())));
// console.log("->:" + capitalizeFirstLetterOfEachSentence(sentences.text()));

function prePatch(text) {
    let result = text.replaceAll("\n\n", "\n");
    result = result.replaceAll("(", "\u301D");
    result = result.replaceAll(")", "\u301E");
    // result = result.replaceAll(":", ": \u200d");
    // result = result.replaceAll(".", ". \u200d");
    // result = result.replaceAll("**", "\"**\"");
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