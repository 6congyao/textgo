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
    adverbSynonyms = load_synonyms('./synonyms/adverbs.json')
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
                // console.log(verbs);
                verbs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (verbsDict[clean]) {
                        const synonyms = verbsDict[clean];
                        console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap verbs: ' + clean + ' -> '+ synonyms);
                        this.swap(clean, synonym);
                    }
                });
            }


            // swap adjectives
            if (adjsDict) {
                let m3 = this.match('#Adjective');
                m3.compute('root');
                let adjs = m3.text('root').split(' ');
                // console.log(adjs);
                adjs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (adjsDict[clean]) {
                        const synonyms = adjsDict[clean];
                        // console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap adjectives: ' + clean + ' -> '+ synonyms);
                        this.swap(clean, synonym);
                    }
                });
            }


            // swap advs
            if (adverbsDict) {
                let m4 = this.match('#Adverb');
                m4.compute('root');
                let adverbs = m4.text('root').split(' ');
                // console.log(adverbs);

                adverbs.forEach(term => {
                    const clean = term.replace(/\p{P}/gu, "")

                    if (adverbsDict[clean]) {
                        const synonyms = adverbsDict[clean];
                        // console.log(clean + ': ' + synonyms);
                        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
                        console.log('#Swap adverbs: ' + clean + ' -> '+ synonyms);
                        this.swap(clean, synonym);
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
const text = `Navigating the Complex Terrain of Artificial Intelligence Detectors

In today's era of rapid technological progress, Artificial Intelligence (AI) has emerged as a game-changer, influencing sectors as diverse as healthcare, finance, security, and entertainment. Yet, as AI deployment expands, the urgency to oversee, comprehend, and govern these systems intensifies. This is where AI detectors step in. These mechanisms scrutinize and verify AI models, ensuring they function correctly and ethically. This article explores the intricacies of AI detectors, their uses, and the hurdles they face.

Grasping AI Detectors

AI detectors are specialized tools designed to recognize and evaluate the behavior or output of AI models. These systems can determine if content like text, images, or videos is AI-generated. Additionally, they monitor AI operations for irregularities or behaviors deviating from expected standards, thereby upholding the integrity, fairness, and safety of AI applications. Machine learning often underpins the technology of AI detectors, where models are trained to differentiate between human and AI-generated outputs. For example, AI detectors in the context of deepfakes—digitally altered videos and images—analyze features such as facial movements, lighting, and other elements that might not align with natural human behavior.

Applications of AI Detectors

Here are some key applications of AI detection tools:

Content Validation
As AI-generated content becomes more lifelike, distinguishing between authentic and synthetic creations is crucial. AI detectors play a significant role in journalism and media by verifying the genuineness of information, thus maintaining trust and accuracy.

Security
In the realm of cybersecurity, AI detectors are essential for identifying and mitigating AI-driven threats, such as automated hacking attempts or malicious bots. These detectors discern patterns indicative of AI involvement that differ from human-centric attack methods.

Compliance and Oversight
In heavily regulated industries like finance and healthcare, AI detectors ensure that AI tools adhere to ethical norms and legal frameworks. This is vital for preventing biases in AI-driven decisions related to credit scoring or medical diagnostics.

Research and Innovation
In academia and research, AI detectors aid in understanding AI model decision-making processes. This transparency is key to enhancing model reliability and fostering ethical and explainable innovations.

Technological Foundations of AI Detectors

AI detectors' technological backbone consists of advanced machine learning algorithms designed to recognize patterns and anomalies not easily detectable by humans. These technologies form the core of AI detection systems, utilizing various sophisticated methodologies to ensure precise identification of AI-generated content or behaviors. Here’s a deeper look at these methodologies:

Supervised Learning
This approach involves training AI detectors using extensive labeled datasets, indicating whether the content is AI or human-generated. Through this, the model learns to identify specific features distinctive of each category. For example, in detecting AI-generated text, the model may discern nuances in language or syntax typical of AI language models rather than natural human writing.

Neural Networks: Especially useful for complex inputs like images or sequential data such as text. Convolutional Neural Networks (CNNs), for example, are extensively used in detecting deepfakes by analyzing inconsistencies in image features.

Decision Trees and Random Forests: Utilized for classification tasks requiring simplicity and clarity. These models predict the value of a target variable by learning decision rules from data features.

Unsupervised Learning
When labeled data is absent, unsupervised learning algorithms can detect outliers or anomalies, suggesting AI manipulations or the presence of AI-driven content.

Clustering: Methods like K-means or DBSCAN group similar data points and identify outliers as potential anomalies, useful in spotting unusual patterns without prior labeling.

Autoencoders: Neural networks used for anomaly detection by learning efficient data compression and decompression. Significant reconstruction errors indicate anomalies, suggesting deviations from normative data.

Semi-Supervised Learning
This technique leverages a small amount of labeled data alongside a large volume of unlabeled data during training. It is practical when labeled data is scarce or costly to obtain. Semi-supervised learning enhances AI detector accuracy by better understanding data distribution and refining predictions.

Challenges Confronting AI Detectors

Overcoming significant obstacles is intrinsic to the realm of AI detectors.

Evolving AI Proficiencies
AI systems' ever-enhancing ability to mimic human behavior and evade detection necessitates continuous adaptation and evolution of AI detectors to keep pace with sophisticated AI outputs.

Ethical Implications
The creation and employment of AI detectors must prioritize ethical considerations, particularly regarding privacy, consent, and transparency. Preventing AI detectors from becoming surveillance or control tools is vital.

Error Management
AI detectors are fallible, potentially yielding false positives (flagging legitimate AI activities as malicious) and false negatives (failing to detect malicious activities). Balancing sensitivity and specificity is crucial for effectiveness.

Resource and Complexity Demands
Developing potent AI detectors requires substantial computational resources and expertise, posing a challenge for smaller entities or developing countries and potentially creating disparities in global AI monitoring and regulation capabilities.

Conclusion

AI detectors are indispensable in today's digital landscape, where AI's pervasive influence necessitates safe, ethical, and efficient deployment. They provide mechanisms to detect, scrutinize, and rectify AI systems. As AI evolves, the significance of AI detectors will rise, necessitating persistent research, development, and mindful consideration of their implications. Addressing these challenges and seizing the opportunities is vital for harnessing AI's potential while mitigating associated risks.`;

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
    const trick1 = '\u2008';
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
    let output = doc.replaceAll(' ', trick1);
    // output = output.replaceAll('e', trick_e);
    // output = output.replaceAll('i', trick_i);
    // output = output.replaceAll('o', trick_o);
    // output = output.replaceAll('u', trick_u);
    
    // output = output.replaceAll(". ", spacechar2);
    // console.log(output);

    return output;
    // return doc;
    // return output.replaceAll(' ', trick2);
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