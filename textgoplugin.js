const nlp = require('compromise');
const fs = require('fs');


let nounSynonyms;
let adjSynonyms;
let verbSynonyms;
let adverbSynonyms;

function init() {
    // nounSynonyms = load_synonyms('./synonyms/nouns.json')
    adjSynonyms = load_synonyms('./synonyms/adjectives.json')
    // verbSynonyms = load_synonyms('./synonyms/verbs.json')
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
                let m2 = this.match('#Verb');
                m2.compute('root');
                let verbs = m2.text('root').split(' ');
                console.log(verbs);
                verbs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (verbsDict[clean]) {
                        const synonyms = verbsDict[clean];
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
                console.log(adjs);
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
                let adverbs = this.match('#Adverb').out('array');;
                // m4.compute('root');
                // let adverbs = m4.text('root').split(' ');
                console.log(adverbs);

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

init();
// Extend Compromise with the plugin
nlp.extend(synonymPlugin);

// Example text
const text = `Elon Musk is like the rockstar of the tech world, so long as products like the Tesla Powerwall are gaining popularity as a way to store solar energ.`;

let doc = nlp(text);

// Replace words with synonyms
let output = doc.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);


// Output the modified text
console.log('<-:' + text);
console.log('->:' + addTricks(capitalizeFirstLetterOfEachSentence(output)));
// console.log("**:" + addTricks(doc.text()));

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
    const trick1 = 'g\u2007';
    const trick2 = 's\u2007';
    const trick3 = 'y\u2007';
    const trick4 = ',\u2008';
    const trick5 = '.\u2007';
    const trick_a = '\u10E7';
    const trick_i = '\u{1D5C4}';
    // const trick_o = '\u03BF';
    const trick_o = '\u10FF';
    const trick_s = '\u1949';
    const trick_e = '\u1971';
    // const trick_e = '\u19C9';
    const trick_u = '\u1D5C';
    const trick_c = '\u1D5C';
    const trick_v = '\uABA9';
    const trick_x = '\u{10C45}';
    // let output = replaceSpaces(doc.text(), spacechar, 6);
    let output = doc.replaceAll(', ', trick4);
    output = output.replaceAll('. ', trick5);
    // output = output.replaceAll('s ', trick2);
    // output = output.replaceAll('y ', trick3);
    // output = output.replaceAll(', ', trick4);
    // output = output.replaceAll('. ', trick5);
    // output = output.replaceAll('i', trick_i);
    // output = output.replaceAll('o', trick_o);
    // output = output.replaceAll('u', trick_u);

    // output = output.replaceAll(". ", spacechar2);
    // console.log(output);

    // return doc;
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