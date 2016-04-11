html.body([
    html.h1("El título"),
    html.p([
        "El primer párrafo que incluye texto ",
        html.b("con formato"),
        ".\n"+
        "     Y otras cosas ",
        html.i("así"),
        ":\n",
    ]),
    html.pre(
        "\n"+
        "Array.prototype.forEach.call(document.body.childNodes, function(node){\n"+
        "    console.log(JSON.stringify(node.textContent));\n"+
        "});\n"
    ),
]),
