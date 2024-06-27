const nlp = require('compromise');

const raw_input = `Conclusion
To maximize ROI with targeted social media advertising, a strategic approach is essential. This involves combining audience insights, compelling content, and continuous optimization. By utilizing the advanced targeting options offered by social media platforms and developing high-quality, engaging ads, businesses can effectively connect with their target audience and achieve significant results.
Real-world success stories highlight the effectiveness of targeted social media advertising. Brands such as Glossier, Airbnb, and Peloton exemplify how precise targeting coupled with compelling content can elevate brand awareness, boost engagement, and generate substantial returns on investment.
By implementing actionable tips and best practices, businesses of all sizes can unlock the potential of social media advertising to attain their objectives and maximize ROI. In the ever-evolving digital landscape, staying informed, adaptable, and innovative is crucial for success in the competitive realm of social media advertising.`;
// const raw_input = "To maximize ROI with targeted social media advertising, a strategic approach is essential. This involves combining audience insights, compelling content, and continuous optimization. By utilizing the advanced targeting options offered by social media platforms and developing high-quality, engaging ads, businesses can effectively connect with their target audience and achieve significant results.";
let text = preHandle(raw_input);

// nlp.verbose(true);
// let word = nlp(text);
// let json = word.json();
// let os = JSON.stringify(json[0].terms, null, 2);
// console.log(os);

const sentences = nlp(text).sentences();
// let senjson = sentences.json();

sentences.map(s => {
    s = sentenceHandle(s);
    return s;
})

console.log('Result: ' + postHandle(sentences.text()));

function sentenceHandle(sentence) {
    let m = sentence.match('(#Modal+|#Copula+|#Preposition+|#Conjunction+|#Pronoun+|#Determiner+)');
    console.log(m.out('array'));
    m.map(v => {
        console.log("##:" + v.text());
        const target = v.text() + '\u200c';
        // const target = v.text() + '@@';
        // const target = v.text() + 'e';
        console.log(target + ' <-> ' + v.text());
        v.replace(v.text(), target);
        return v;
    })
    return sentence;
}

function preHandle(content) {
    let result = content.replaceAll("\n\n", "\n");

    return result;
}

function postHandle(content) {
    let result = content.replaceAll("\u200c ", "\u2007");
    result = result.replaceAll(", ", ",\u2008")

    return result;
}