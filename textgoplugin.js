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
    // adjSynonyms = load_synonyms('./synonyms/adjectives.json')
    verbSynonyms = load_synonyms('./synonyms/verbs.json')
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

            console.log('->:' + addTricks(text_masked));
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

            sentences_filled['sentences'].forEach((sentence, index) => {
                text_masked = text_masked.replace(sentences_masked[index], sentence)
            });

            console.log('->:' + addTricks(text_masked));
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
            let m = this.match('#Adjective+');
            let done = false;
            console.log(m.out('array'));
            m.map(v => {
                if (!done) {
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
                    const clean = v.text('normal').replace(/\p{P}/gu, "");
                    // console.log(clean);
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
// const text = `Driven by population growth and migration from urban rural areas seeking better economic prospects, cities in these countries are expanding at an unprecedented pace.`;
// const text = `He is like a boy. He liked that girl, anyway he likes. Elon Musk stands as a titan of modern innovation.`;
// const text = `Why Temperatures Are Increasing in Developing Nations – Essay 2\nDeveloping countries, often called the Third World, face a significant challenge: rising temperatures. This global issue has far-reaching consequences for these nations.  Several factors contribute to this warming trend, including climate change, rapid urbanization, deforestation, and socio-economic hurdles. This essay will examine these factors, exploring their interconnectedness and the implications they hold for the affected regions.\nClimate Change: A Global Catalyst\nClimate change is the primary force behind rising global temperatures, and developing countries are no exception.  Human actions, especially the burning of fossil fuels, deforestation, and industrial processes, have dramatically increased greenhouse gas (GHG) concentrations in the atmosphere.  Carbon dioxide (CO2), methane (CH4), and nitrous oxide (N2O) are the main offenders, trapping heat and causing a gradual rise in global temperatures.\nThe Earth's average temperature has increased by about 1.2 degrees Celsius since the late 19th century, according to the Intergovernmental Panel on Climate Change (IPCC).  This warming, however, is not uniform.  Due to complex interactions between atmospheric circulation patterns, geographic features, and regional climate systems, some regions, including many developing countries, are experiencing greater-than-average temperature increases.\nThe Urban Heat Island Effect and Urbanization\nRapid urbanization in developing nations has significantly contributed to rising temperatures.  Driven by population growth and migration from rural areas seeking better economic prospects, cities in these countries are expanding at an unprecedented pace. This urban sprawl frequently results in a phenomenon known as the Urban Heat Island (UHI) effect.\nThe UHI effect occurs when urban areas become significantly hotter than surrounding rural areas due to human activities. Replacing natural vegetation with concrete, asphalt, and buildings increases solar radiation absorption, while reducing green spaces limits cooling through evapotranspiration. Moreover, the high concentration of buildings and human activities generates heat, further raising urban temperatures.\nCities like Lagos in Nigeria, Dhaka in Bangladesh, and Mumbai in India, for example, have seen significant temperature increases in recent decades. The lack of sufficient urban planning and green infrastructure exacerbates the UHI effect, resulting in hotter urban environments and significant health risks for residents.\nDeforestation and Shifting Land Use Patterns\nDeforestation and land use changes are major contributors to rising temperatures in developing countries. Forests play a critical role in climate regulation by absorbing CO2, releasing oxygen, and providing cooling through transpiration. However, widespread deforestation for agriculture, logging, and urban development has resulted in the loss of these critical ecological services.\nDeforestation rates are alarmingly high in regions such as the Amazon Basin, Southeast Asia, and Central Africa.  Converting forests to agricultural land or pasture not only reduces carbon sequestration but also alters local weather patterns. Trees and vegetation release moisture into the atmosphere, which aids in cloud formation and precipitation. Without forests, these areas become drier and hotter, exacerbating the effects of global warming.\nFurthermore, land use changes such as wetland drainage, monoculture plantation expansion, and grassland degradation disrupt local ecosystems and their ability to regulate temperatures. These changes frequently result in a feedback loop, in which rising temperatures further degrade the land, resulting in more deforestation and higher temperatures.\nResource Constraints and Socio-Economic Challenges\nDeveloping countries face distinct socio-economic challenges that exacerbate the effects of rising temperatures. Limited financial resources, inadequate infrastructure, and weak governance structures make it difficult for these countries to implement effective climate change mitigation and adaptation strategies.\nMany Third World countries, for example, rely heavily on agriculture for their livelihoods. Agriculture is highly vulnerable to temperature changes, with rising temperatures resulting in lower crop yields, water scarcity, and increased pest and disease outbreaks. These regions are particularly vulnerable to the effects of rising temperatures due to a lack of resources to invest in climate-resilient agricultural practices.\nFurthermore, rapid population growth in many developing countries puts a strain on natural resources and infrastructure.  As populations grow, so does the demand for energy, water, and food, frequently leading to overexploitation and environmental degradation. This vicious cycle of resource depletion and environmental degradation contributes to rising temperatures and the vulnerability of these regions.`;
const text = `Why Temperatures in the Third World Are Rising – Essay 2
A pressing global issue, the phenomenon of rising temperatures carries profound implications for the Third World, often referred to as developing countries. It is a combination of factors, including climate change, urbanization, deforestation, and socio-economic challenges, that can be attributed to the increase in temperatures in these regions. This essay delves into the various reasons behind rising temperatures in the Third World, exploring not only how these factors interplay but also their implications for the affected regions.
Climate Change: The Global Driver
What primarily drives rising temperatures globally, including in the Third World, is climate change.  Human activities, particularly the burning of fossil fuels, deforestation, and industrial processes, have caused a significant increase in the concentration of greenhouse gases (GHGs) in the atmosphere. Trapping heat and leading to a gradual increase in global temperatures are the main culprits: carbon dioxide (CO2), methane (CH4), and nitrous oxide (N2O).
The Earth's average temperature has risen by approximately 1.2 degrees Celsius since the late 19th century, according to the Intergovernmental Panel on Climate Change (IPCC).  Not evenly distributed is this warming; certain regions, including many parts of the Third World, are experiencing higher than average temperature increases.  Involving atmospheric circulation patterns, geographical features, and regional climate systems, the reasons for this uneven warming are complex.
Urbanization and the Urban Heat Island Effect
Rising temperatures have been significantly contributed to by rapid urbanization in the Third World.  Driven by population growth and migration from rural areas in search of better economic opportunities, cities in developing countries are expanding at an unprecedented rate.  Often leading to the phenomenon known as the Urban Heat Island (UHI) effect is this urban expansion.
When urban areas become significantly warmer than their rural surroundings due to human activities, the UHI effect occurs.  Increasing the absorption of solar radiation is the replacement of natural vegetation with concrete, asphalt, and buildings, while the reduction of green spaces limits cooling through evapotranspiration.  Additionally, generating heat and further raising temperatures in urban areas is the high density of buildings and human activities.
Substantial increases in temperature over recent decades have been witnessed in cities like Lagos in Nigeria, Dhaka in Bangladesh, and Mumbai in India, for instance.  Leading to hotter urban environments and posing significant health risks to residents is the lack of adequate urban planning and green infrastructure, exacerbating the UHI effect.
Deforestation and Land Use Changes
Critical factors contributing to rising temperatures in the Third World are deforestation and land use changes.  Playing a vital role in regulating the Earth's climate by absorbing CO2, releasing oxygen, and providing cooling through transpiration are forests.  However, what has led to the loss of these essential ecological services is extensive deforestation for agriculture, logging, and urban development.
Alarmingly high are deforestation rates in regions like the Amazon Basin, Southeast Asia, and Central Africa.  Not only reducing carbon sequestration but also altering local weather patterns is the conversion of forests into agricultural land or pasture.  Contributing to cloud formation and precipitation is the release of moisture into the atmosphere by trees and vegetation.  Without forests, exacerbating the effects of global warming are these areas that become drier and hotter.
Furthermore, disrupting local ecosystems and their ability to regulate temperatures are land use changes such as the drainage of wetlands, the expansion of monoculture plantations, and the degradation of grasslands. Often resulting in a feedback loop where rising temperatures further degrade the land, leading to more deforestation and higher temperatures, are these changes.
Socio-Economic Challenges and Resource Constraints
A unique set of socio-economic challenges that exacerbate the impact of rising temperatures is faced by developing countries.  Hindering these countries' ability to implement effective climate mitigation and adaptation strategies are limited financial resources, inadequate infrastructure, and weak governance structures. 
For instance, it is agriculture that many Third World countries rely heavily on for their livelihoods. Highly sensitive to temperature changes is agriculture, with rising temperatures leading to reduced crop yields, water scarcity, and increased pest and disease outbreaks.  Making these regions particularly vulnerable to the impacts of rising temperatures is the lack of resources to invest in climate-resilient agricultural practices.
Moreover, putting additional pressure on natural resources and infrastructure is the rapid population growth in many developing countries.  Often leading to overexploitation and degradation of the environment is the increase in demand for energy, water, and food as populations grow.  Further contributing to rising temperatures and the vulnerability of these regions is this vicious cycle of resource depletion and environmental degradation. `;

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

    // sentences.map(s => {
    //     s = sentenceHandle(s);
    //     return s;
    // })

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