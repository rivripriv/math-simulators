

/**
 * @typedef {HTMLElement & {title: string,  writeln: function(any), write: function(any), delete: function(void), clear: function(void), linear: boolean}} LoggerElement
 * 
 * 
 * Moveable logger window, keep the ref!
 * @param {string} title window title
 * @param {{fontcolor: string, fontsize: string, left: string, top: string}} mod style modifier
 * @returns {LoggerElement}
*/
function createLogger(title = null, mod = null) {
    const tmp = document.createElement("template");
    const inh = "inherit";
    let stl = `font-size:${mod?.fontsize ?? inh}; user-select:none; cursor: move; position:absolute; white-space: pre-wrap; color:${mod?.fontcolor ?? inh}; left:${mod?.left ?? inh}; top:${mod?.top ?? inh}`;
    tmp.innerHTML = `<div title="click to clear" style="${stl}"><div>${title ?? "log"}</div><div></div><div></div></div>`;

    /**@type {HTMLElement} */
    const log = tmp.content.children[0];

    Object.defineProperty(log, "title", {

        get: function () {
            return log.firstChild.textContent;
        },

        set: function (v) {
            log.firstChild.textContent = v;
            pad();
        }

    });

    log["linear"] = false;
    log["write"] = (o) => log.lastChild.textContent += (typeof o === "object" ? JSON.stringify(o, null, log.linear ? null : 2) : o.toString());
    log["writeln"] = (o) => { log.write(o); log.lastChild.textContent += "\r\n"; }

    var t2 = 0, dy = 0, dx = 0;
    log.addEventListener("pointerdown", (e) => {
        //const r = log.getBoundingClientRect();

        //clientX give position of pointer event whether it's within or outside boundingClient (relative to topleft)
        //dx = e.clientX - r.left;
        //dy = e.clientY - r.top;

        dx = e.offsetX;
        dy = e.offsetY;

        log.setPointerCapture(e.pointerId);
        t2 = performance.now();
    })

    log.addEventListener("pointerup", (e) => {
        log.releasePointerCapture(e.pointerId);
        t2 = performance.now() - t2;
    });

    log.addEventListener("pointermove", (e) => {
        if (t2 > 120 && log.hasPointerCapture(e.pointerId)) {
            let py = (e.clientY - dy) / window.innerHeight * 100;
            let px = (e.clientX - dx) / window.innerWidth * 100;
            log.style.left = (px < 5 ? 5 : px) + "vw";
            log.style.top = (py < 5 ? 5 : py) + "vh";
        }
    });

    const pad = () => log.firstChild.nextSibling.textContent = "".padStart(log.title.length, "-");
        



    log["clear"] = () => log.lastChild.textContent = null;

    log.addEventListener("click", (e) => {
        if (t2 < 120)
            log.clear();
    });


    log["delete"] = () => document.body.removeChild(log);

    document.body.appendChild(tmp.content);   
    pad();
    
    return log;
}