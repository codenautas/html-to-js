html.form({id: "loginForm", action: "/login", method: "post"}, [
    html.table([
        html.tr([
            html.td([
                html.label({"for": "username"}, "Usuario:"),
            ]),
            html.td([
                html.input({
                    id: "username",
                    autofocus: "autofocus",
                    disabled: "disabled"
                    name: "username",
                    type: "text",
                }),
                html.td({rowspan: "4"}, [
                    html.img({src: "./unlogged/Oxygen480-actions-key-enter.svg.png", style: "height:128px"})
                ]),
            ]),
        ]),
        html.tr([
            html.td([
                html.label({"for": "password"}, "Clave:")
            ]),
            html.td([
                html.input({
                    id: "password", 
                    disabled: "disabled"
                    name: "password", 
                    type: "password", 
                })
            ]),
        ]),
        html.tr([
            html.td([
                html.input({type: "submit", value: "Log In"}),
            ]),
        ]),
    ]),
]),
html.script({src: "unlogged/login.js"}),
