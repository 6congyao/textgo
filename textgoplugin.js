const nlp = require('compromise');
const fs = require('fs');


let nounSynonyms;
let adjSynonyms;

function init() {
    nounSynonyms = load_synonyms('./synonyms/nouns.json')
    adjSynonyms = load_synonyms('./synonyms/adjectives.json')
}

// Plugin to replace words with synonyms
const synonymPlugin = {
    api: function (View) {
        View.prototype.replaceWithSynonyms = function (nounsDict, adjsDict) {
            // swap nouns
            let m1 = this.match('#Noun+');
            m1.compute('root');
            
            nouns = m1.text('root').split(' ');
            console.log(nouns);
            nouns.forEach(term => {
                // const word = term.text();
                if (nounsDict[term]) {
                    const synonyms = nounsDict[term];
                    console.log(synonyms);
                    const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                    this.swap(term, synonym);
                }
            });

            // swap adjectives
            let m2 = this.match('#Adjective');
            m2.compute('root');

            adjs = m2.text('root').split(' ');
            console.log(adjs);

            adjs.forEach(term => {
                // const word = term.text();
                if (adjsDict[term]) {
                    const synonyms = adjsDict[term];
                    console.log(synonyms);
                    const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                    this.swap(term, synonym);
                }
            });
            return this;
        };
    }
};

init();
// Extend Compromise with the plugin
nlp.extend(synonymPlugin);

// Example text
const text = "The better monitor's cat jumps over the red cars.";
let doc = nlp(text);

// Replace words with synonyms
doc.replaceWithSynonyms(nounSynonyms, adjSynonyms);

// Output the modified text
console.log(doc.text());

function load_synonyms(file) {
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    }
    catch (err) {
        console.error('File read failed:', err);
    }
}