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
const text = `Elon Musk is like the Tony Stark of our time, famous for shaking things up with his futuristic companies.  He's involved in everything from electric cars with Tesla to trying to get people on Mars with SpaceX. But Musk isn't all sunshine and rainbows; he's a bit controversial too, because his big ideas sometimes get met with raised eyebrows. Let's dive into the life of this fascinating guy, his achievements, and yes, even the controversies. 

Musk was born in South Africa in 1971, and it seems like he was destined to be a tech whiz.  He loved computers and taught himself to code when he was just a kid. This paved the way for his first company, Zip2, which was like an early online city guide. Zip2's success proved Musk was a big deal in the tech world and gave him the cash to chase even bigger dreams.

In 1999, he co-founded X.com, which later morphed into PayPal, you know, the online payment system we all use now. PayPal made it super easy and safe to send money online, and Musk made a fortune from it.  This gave him the freedom to go after some seriously ambitious goals.

SpaceX was born in 2002 because Musk wanted to make space travel more accessible and less crazy expensive. He wasn't afraid to challenge the big government space agencies and kickstart a new era of space exploration. Even though people doubted him and things went wrong along the way, Musk's stubbornness and resilience helped SpaceX reach incredible heights.

One of their biggest wins? In 2008, SpaceX's Falcon 1 rocket became the first privately funded liquid-fueled rocket to actually make it to orbit. Talk about a game-changer! Since then, they've hit milestone after milestone, like developing the Falcon 9 rocket and the Dragon spacecraft, which sends cargo to the International Space Station. And get this, in 2020, SpaceX made history again by sending the first crewed mission to the ISS on their Crew Dragon spacecraft. That's a giant leap for commercial spaceflight!

But Musk isn't stopping at Earth's orbit.  He wants to build a whole colony on Mars!  He's talking about making humans a multi-planetary species so that if something catastrophic happens on Earth, we've got a backup plan.  Now, whether or not we can actually live on Mars is debatable, but you have to admire Musk's dedication to pushing the boundaries of what's possible in space. 

Of course, Musk is also famous for his work with Tesla, where he's leading the charge in sustainable energy and transportation. As Tesla's CEO, he's been the driving force behind those sleek electric cars that are both powerful and good for the environment. Tesla has really shaken up the car industry, challenging the gas-guzzling cars we're used to and speeding up the move towards clean energy.

But Tesla isn't just about cars.  Musk also wants to change how we use energy.  Through Tesla Energy, they're making solar panels and those big Powerwall batteries that let people store solar energy to use whenever they need it, like when the power goes out. 

Now, even though Musk has accomplished amazing things, he's also known for being a bit of a loose cannon, especially on social media.  His tweets have started arguments, messed with stock prices, and gotten people talking about all sorts of things. Some people love that he's not afraid to speak his mind, while others think he needs to chill out a bit.

One of the most controversial things about Musk is his take on artificial intelligence (AI).  He knows AI has the power to change the world, but he's also worried about what could happen if it gets out of control. He's even said that AI is potentially more dangerous than nuclear weapons!  That's why he co-founded OpenAI, an organization dedicated to making sure AI is developed safely and ethically.

Besides space travel, sustainable energy, and AI, Musk is interested in all sorts of other cool stuff, like super-fast transportation, connecting our brains to computers, and even digging underground tunnels to avoid traffic.  His company, The Boring Company, is trying to revolutionize transportation with tunnels for electric vehicles and those futuristic Hyperloop systems.

So, there you have it.  Elon Musk is a total game-changer.  He's a visionary leader who's not afraid to chase crazy dreams and has already changed the world in countless ways.  He's faced his share of controversy, but there's no denying that Elon Musk is one of the most influential people of the 21st century.  Whether he's sending people to Mars, building better cars, or trying to save us from a robot apocalypse, one thing's for sure: Elon Musk keeps us on the edge of our seats, wondering what he'll do next.`;

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