html.html([
    html.head([
        html.link({href: "pdemo.css", rel: "stylesheet", type: "text/css"}),
    ]),
    html.body({id: "elBody"}, [
        html.h1("tedede 'demo' for browser"),
        html.div([
            html.input({id: "bool1", type: "checkbox"}),
            html.label({"for": "bool1"}, "has tri-state booleans"),
        ]),
        html.div([
            html.label({"for": "text1"}, "text with empty"),
            html.input({id:"text1", accesskey: "t", type: "text"}),
        ]),
        html.div({id:"bool2", "tedede-option-group": "bool2"},[
            html.input({
                id: "bool2-true",
                name: "bool2",
                type: "radio",
                value: "true",
            }),
            html.label({id: "label-bool2-true", "for": "bool2-true"}, "Sí"),
            html.br(),
            html.input({
                id: "bool2-false",
                name: "bool2",
                type: "radio",
                value: "false",
            }),
            html.label({id: "label-bool2-false", "for": "bool2-false"}, "No"),
        ]),
        html.input({id: "txtEmiter", type: "text"}),
        html.pre({id: "messages"}),
        html.script({src:"lib3/best-globals.js"}),
        html.script({src:"lib2/js-to-html.js"}),
        html.script({src:"lib/tedede.js"}),
        html.script({src:"pdemo-client.js"}),
    ]),
])