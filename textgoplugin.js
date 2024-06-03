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
                        console.log('#Swap nouns: ' + clean + ' -> '+ synonyms);
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
                        // console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap verbs: ' + clean + ' -> '+ synonyms);
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
                        console.log('#Swap adjectives: ' + clean + ' -> '+ synonyms);
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
                        console.log('#Swap adverbs: ' + clean + ' -> '+ synonyms);
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
const text = `Elon Musk is a big name in innovation today. He's known for his game-changing companies that have started conversations around the world about where humanity is headed. You can see his influence in many fields, from electric cars with Tesla to the ambitious goal of having people live on Mars with SpaceX. But Musk's journey hasn't been easy, and his bold ideas often face doubt and criticism. Let's take a closer look at Musk's life, what he's achieved, and the controversies surrounding him.

Musk was born in Pretoria, South Africa, on June 28, 1971. Even his early years gave clues to his future as a tech star. He loved computers and technology, which led him to learn programming when he was young, setting the stage for his future as an entrepreneur. Musk's first company was Zip2, an online city guide software company he started with someone else in 1996. Zip2's success paved the way for Musk's later ventures and established him as a major player in the tech world.

In 1999, Musk co-founded X.com, an online payment company that eventually turned into PayPal after merging with other companies. PayPal changed how online transactions worked, making it simpler and safer for people and businesses to handle financial transactions online. Musk's part in PayPal's success made him very wealthy, giving him the resources to chase even bigger dreams.

Musk founded SpaceX in 2002 with the goal of making space exploration more accessible and less expensive. He wanted to challenge the traditional control of space exploration by government agencies and bring in a new era of private space travel. Even though people in the industry were skeptical and there were many setbacks, Musk's determination and resilience pushed SpaceX to amazing heights.

One of SpaceX's biggest achievements happened in 2008 when the Falcon 1 rocket became the first privately funded rocket using liquid fuel to reach orbit. Since then, SpaceX has achieved a lot, like developing the Falcon 9 rocket and the Dragon spacecraft, which are used to send cargo to the International Space Station. In 2020, SpaceX made history again by launching the first crewed mission to the ISS on the Crew Dragon spacecraft, a huge step for commercial spaceflight.

Musk wants to go beyond Earth's orbit. He imagines a self-sustaining colony on Mars. His goal is to make humanity a multi-planetary species, ensuring our survival if something catastrophic were to happen to Earth. While there's debate about whether Musk's Mars colonization plans are realistic, his unwavering dedication to pushing the boundaries of space exploration has inspired people all over the world.

In addition to space, Musk has made significant contributions to sustainable energy and transportation through Tesla. As CEO of Tesla, he has been a leader in developing electric vehicles that combine performance, efficiency, and environmental sustainability. Tesla's cars have changed the automotive industry, challenging the dominance of traditional gasoline-powered cars and speeding up the move to clean energy.

Musk's vision goes beyond electric vehicles to include renewable energy solutions and energy storage. Through Tesla Energy, the company makes solar panels and energy storage systems, making it possible for people and businesses to use solar power and rely less on fossil fuels. Products like the Tesla Powerwall have become popular ways to store solar energy to use when demand is high or during power outages.

Even with all his accomplishments, Musk has been criticized for being outspoken and for provocative statements on social media. His tweets have often caused controversy, affecting stock prices, and starting public debate on a variety of topics. Some people admire his willingness to challenge the status quo, while others think his behavior is reckless and irresponsible.

One of the most controversial things about Musk is his views on artificial intelligence (AI) and how it might impact society. He acknowledges how much AI can change things, but he's also worried about the potential risks. He's even said that AI is a bigger threat to humanity than nuclear weapons. Because of these concerns, Musk co-founded OpenAI, a research organization dedicated to promoting and developing AI in a safe and beneficial way.

Besides space exploration, sustainable energy, and AI, Musk is interested in many other things, including high-speed transportation, brain-computer interfaces, and underground tunnels to reduce traffic jams. His company, The Boring Company, wants to change transportation by building tunnels for electric vehicles and hyperloop systems.

In conclusion, there's no denying Elon Musk's impact on technology, business, and society. Through his visionary leadership and pursuit of ambitious goals, Musk has transformed industries, inspired innovation, and sparked debate about the future of humanity. Even though there have been controversies and challenges along the way, Musk's contributions to space exploration, sustainable energy, and AI have made him one of the most influential people of the 21st century. Whether he's trying to colonize Mars, revolutionize transportation, or advocate for responsible AI development, Elon Musk continues to shape history and inspire future generations of entrepreneurs and innovators.
`;

let doc = nlp(text);

// Replace words with synonyms
let output = doc.replaceWithSynonyms(nounSynonyms, adjSynonyms, verbSynonyms, adverbSynonyms);

// Output the modified text
console.log('**:' + addTricks(capitalizeFirstLetterOfEachSentence(output)));
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
    const trick3 = 'd\u2007';
    const trick4 = ',\u2007';
    const trick5 = '.\u2008';
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
    // output = output.replaceAll('. ', trick5);
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