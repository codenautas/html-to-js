html.body([
    html.h1("El título"),
    html.p([
        "El primer párrafo que incluye texto ",
        html.b("con formato"),
        `.
     Y otras cosas `,
        html.i("así"),
        `:
`,
    ]),
    html.pre(`Array.prototype.forEach.call(document.body.childNodes, function(node){
    console.log(JSON.stringify(node.textContent));
});
`),
]),
