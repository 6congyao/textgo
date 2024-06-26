const nlp = require('compromise');
const fs = require('fs');

let nounSynonyms;
let adjSynonyms;
let verbSynonyms;
let adverbSynonyms;

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
                    if (v.match('@hasQuote').found) {
                        return v;
                    }
                    if (v.has('(#Modal+|#Copula+|#Auxiliary+)')) {
                        let arr = v.splitAfter('(#Modal+|#Copula+|#Auxiliary+)').out('array');
                        const len = arr.length;
                        v = nlp(arr[len-1]);
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
                        return this.swap(clean, synonym);
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
// const text = `Elon Musk stands as a titan of modern innovation, a visionary whose ventures have not only transformed industries but also sparked global conversations about the future of humanity. From his pioneering efforts in electric vehicles with Tesla to his ambitious goals of colonizing Mars with SpaceX, Musk's impact resonates across multiple spheres. However, his journey is not without its controversies and challenges, as his bold vision often intersects with skepticism and critique. In this comprehensive exploration, we delve deeper into the life, achievements, and controversies surrounding Elon Musk.\n\nBorn on June 28, 1971, in Pretoria, South Africa, Elon Musk's early years foreshadowed his future as a tech luminary. His fascination with computers and technology led him to develop programming skills at a young age, setting the stage for his entrepreneurial journey. Musk's first foray into business came with Zip2, an online city guide software company he co-founded in 1996. The success of Zip2 laid the groundwork for Musk's subsequent ventures and established him as a force to be reckoned with in the tech world.\n\nIn 1999, Musk co-founded X.com, an online payment company that later became PayPal after a series of mergers. PayPal revolutionized online transactions, making it easier and more secure for individuals and businesses to conduct financial transactions over the internet. Musk's role in PayPal's success earned him a substantial fortune, providing him with the resources to pursue his grander ambitions.\n\nIn 2002, Musk set his sights on the final frontier with the founding of SpaceX. With a vision of making space exploration more accessible and affordable, Musk sought to challenge the monopoly of government space agencies and usher in a new era of space exploration. Despite facing skepticism from industry insiders and encountering numerous setbacks, Musk's determination and resilience propelled SpaceX to unprecedented heights.\n\nOne of SpaceX's most significant achievements came in 2008 when the Falcon 1 rocket became the first privately-funded liquid-fueled rocket to reach orbit. Since then, SpaceX has achieved numerous milestones, including the development of the Falcon 9 rocket and the Dragon spacecraft, which have been used for cargo resupply missions to the International Space Station. In 2020, SpaceX made history by launching the first crewed mission to the ISS aboard the Crew Dragon spacecraft, marking a major milestone in commercial spaceflight.\n\nMusk's ambitions extend beyond Earth's orbit, with his sights set on Mars as the next frontier for human exploration. He envisions establishing a self-sustaining colony on the Red Planet, making humanity a multi-planetary species and ensuring the survival of our species in the event of catastrophic events on Earth. While the feasibility of Musk's Mars colonization plans remains a subject of debate, his unwavering commitment to pushing the boundaries of space exploration has inspired millions around the world.\n\nIn addition to his space endeavors, Musk has made significant contributions to sustainable energy and transportation through his work with Tesla. As CEO of Tesla, Musk has spearheaded the development of electric vehicles that combine performance, efficiency, and environmental sustainability. The Tesla Model S, Model 3, Model X, and Model Y have redefined the automotive industry, challenging the dominance of traditional gasoline-powered cars and accelerating the transition to clean energy.\n\nFurthermore, Musk's vision extends beyond electric vehicles to encompass renewable energy solutions and energy storage. Through Tesla Energy, the company produces solar panels and energy storage systems, enabling individuals and businesses to harness the power of the sun and reduce their reliance on fossil fuels. Products such as the Tesla Powerwall have gained traction as means of storing solar energy for use during peak demand periods or power outages.\n\nDespite his numerous accomplishments, Elon Musk is not without his detractors. His outspoken nature and provocative statements on social media have often landed him in hot water and sparked controversy. Musk's tweets have been known to move markets, ignite legal battles, and incite public debate on a wide range of topics, from cryptocurrency to the COVID-19 pandemic. While some admire his willingness to challenge the status quo and push boundaries, others criticize his behavior as reckless and irresponsible.\n\nOne of the most contentious issues surrounding Musk is his views on artificial intelligence (AI) and its potential impact on society. While Musk acknowledges the transformative power of AI, he has also expressed concerns about its potential risks, warning that AI poses a greater threat to humanity than nuclear weapons. In response to these concerns, Musk co-founded OpenAI, a research organization dedicated to promoting and developing AI in a safe and beneficial manner.\n\nIn addition to his ventures in space exploration, sustainable energy, and AI, Musk has expressed interest in various other fields, including high-speed transportation, brain-computer interfaces, and underground tunnels for alleviating traffic congestion. His company, The Boring Company, aims to revolutionize transportation through the construction of tunnels for electric vehicles and hyperloop systems.\n\nIn conclusion, Elon Musk's impact on technology, business, and society is undeniable. Through his visionary leadership and relentless pursuit of ambitious goals, Musk has transformed industries, inspired innovation, and sparked debate on the future of humanity. While controversies and challenges have accompanied his journey, Musk's contributions to space exploration, sustainable energy, and AI have positioned him as one of the most influential figures of the 21st century. Whether he is colonizing Mars, revolutionizing transportation, or advocating for responsible AI development, Elon Musk continues to shape the course of history and inspire future generations of entrepreneurs and innovators.`;
const text = `The hero's journey is a universal narrative resonating across cultures and generations. It taps into fundamental human experiences and emotions, making it a powerful and enduring storytelling framework. Its stages provide a structured yet flexible framework for character development and storytelling.`;


// const text = `The rapid evolution of AI, particularly in natural language processing and machine learning, positions it as a potential replacement for human article writers. Advanced content generation tools like GPT-4 demonstrate the ability to produce high-quality, contextually relevant articles across diverse topics. Trained on massive datasets, these tools can emulate various writing styles and formats, generating content at speeds unmatched by humans. This efficiency makes them invaluable for meeting deadlines and large-scale content demands. AI's capacity to analyze data and trends ensures the creation of timely and accurate articles.  Furthermore, AI writing tools are constantly refined through machine learning, enhancing their ability to handle complex and specialized subjects. Businesses can leverage these tools to reduce costs associated with large writing teams and boost productivity by automating repetitive writing tasks. This allows human writers to focus on more creative and strategic aspects of content creation. However, while AI demonstrates significant potential, it lacks the nuanced understanding, emotional depth, and creativity inherent in human writers. The optimal approach involves a collaborative integration of AI and human expertise, leveraging the strengths of both to produce exceptional content.  Ethical considerations, such as transparency regarding AI-generated content and upholding quality standards, are paramount. While AI excels at generating large volumes of content efficiently, human oversight remains essential to ensure authenticity and emotional resonance. As AI technology advances, it is poised to become an indispensable tool in content creation, augmenting human capabilities and shaping the future of writing. In essence, AI's role in content creation is rapidly expanding, presenting numerous advantages. However, striking a balance between automation and human creativity, while addressing ethical considerations, is crucial to achieving optimal outcomes.`;
// const text = `Advanced content-generation-tools like GPT-4 demonstrate the ability to produce high-quality.`;

let text2 = hotPatch(text);
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

function hotPatch(text) {
    let result = text.replaceAll("\n\n", "\n");
    result = result.replaceAll("(", "\u301D");
    result = result.replaceAll(")", "\u301E");
    result = result.replaceAll(":", ": \u200d");
    result = result.replaceAll(".", ". \u200d");
    result = result.replaceAll("**", "\u200d**\u200d");

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
    const trick1 = 'n\u2007';
    const trick2 = 's\u2007';
    const trick3 = 'd\u2007';
    const trick4 = ',\u2008';
    const trick5 = '.\u2007';
    const trick_a = '\u10E7';
    const trick_i = '\u{1D5C4}';
    const trick_o = '\u10FF';
    const trick_s = '\u1949';
    const trick_e = '\u1971';
    // const trick_e = '\u19C9';

    const patch1 = '(';
    const patch2 = ')';
    const patch3 = ' ';

    // let output = replaceSpaces(doc.text(), spacechar, 6);
    // let output = doc.replaceAll(', ', trick4);
    let output = doc.replaceAll('\u301D', patch1);
    output = output.replaceAll('\u301E', patch2);
    output = output.replaceAll('  ', patch3);
    // output = output.replaceAll('\" ', '\"');
    output = output.replaceAll(' \u200d', '');
    // output = output.replaceAll(':', patch3);
    // output = output.replaceAll('. \u200d', patch4);
    output = output.replaceAll('\u200d', '')
    // output = output.replaceAll(' \u200d**', patch4);
    // output = output.replaceAll('s ', trick2);
    // output = output.replaceAll('d ', trick3);
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