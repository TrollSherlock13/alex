/*!
 *
 * # BiB/i Extension: JaTEx
 *
 * - "Japanes Typesetting Extra"
 * - Copyright (c) Satoru MATSUSHIMA - http://bibi.epub.link/ or https://github.com/satorumurmur/bibi
 * - Licensed under the MIT license. - http://www.opensource.org/licenses/mit-license.php
 */
Bibi.x({
    name: "JaTEx",
    description: "Japanese Typesetting Extra",
    author: "Satoru MATSUSHIMA (@satorumurmur)",
    version: "0.1.0",
    build: 20150722.1424,
    HTMLString: "",
    Current: 0,
    Log: !1,
    LogCorrection: !1,
    LogCancelation: !1,
    parse: function (e, t) {
        return e && "object" == typeof e && e.tagName && (e = e.innerHTML), e && "string" == typeof e ? (this.HTMLString = e, this.Current = 0, this.Log && (this.log(1, "BiB/i JaTEx"), this.log(2, "parse"), this.log(3, "HTMLString: " + this.HTMLString)), this.parseInnerHTML()) : null
    },
    parseInnerHTML: function () {
        for (var e = (this.Current, []), t = this.parsePart(); null !== t && (e.push(t), t = this.parsePart());) ;
        return e.length ? e : null
    },
    parsePart: function () {
        var e = (this.Current, {}), t = this.parseString(/^<[^>]*?>/);
        if (t) return /^<!--/.test(t) ? e.Type = "Comment" : (e.Type = "Tag", /^<ruby[ >]/.test(t) ? e.Detail = "ruby:open" : /^<\/ruby>/.test(t) ? e.Detail = "ruby:close" : /^<span[ >]/.test(t) && / class="([\w\d\-]+[\s\t]+)*(tcy|sideways|upright)([\s\t]+[\w\d\-]+)*"/.test(t) ? e.Detail = "span.x:open" : /^<span[ >]/.test(t) ? e.Detail = "span:open" : /^<\/span>/.test(t) && (e.Detail = "span:close")), e.Content = t, e;
        var n = this.parseString(/[^<]+/);
        return n ? (e.Type = "Text", e.Content = n, e) : null
    },
    parseString: function (e) {
        var t = null, n = !1;
        if (e instanceof RegExp) {
            var a = this.HTMLString.substr(this.Current, this.HTMLString.length - this.Current);
            e.test(a) && (n = !0, e = a.match(e)[0])
        } else this.HTMLString.substr(this.Current, e.length) === e && (n = !0);
        return n && (this.Current += e.length, t = e), this.correct(t)
    },
    markupEnclosure: function (e, t) {
        for (var n = 0, a = t.length; n < a && t[n]; n++) {
            for (var r = t[n][0], i = t[n][1], s = t[n][2], o = new RegExp("(" + r + ")([^" + r + i + "]+)(" + i + ")", "g"); o.test(e);) e = e.replace(o, "<o>$2<c>");
            e = e.replace(/<o>/g, '<span class="enclosed ' + s + '">' + r).replace(/<c>/g, i + "</span>")
        }
        return e
    },
    markupCharacters: function (e, t, n) {
        for (var a = 0, r = t.length; a < r && t[a]; a++) e = e.replace(new RegExp("(" + t[a][0] + ")", "g"), '</span><span class="' + t[a][1] + '">' + n + "</span><span>");
        return e
    },
    markupPlural: function (e, t) {
        return this.markupCharacters(e, t, "<span>$1</span>")
    },
    markupSingle: function (e, t) {
        return this.markupCharacters(e, t, "$1")
    },
    correct: function (e) {
        return this.Log && this.LogCorrection && e && this.log(3, e), e
    },
    cancel: function (e, t) {
        return this.Log && this.LogCancelation && this.log(4, "cancel: parse" + t + " (" + e + "-" + this.Current + "/" + this.HTMLString.length + ")"), "number" == typeof e && (this.Current = e), null
    },
    log: function (e, t) {
        this.Log && console && console.log && (0 == e ? t = "[ERROR] " + t : 1 == e ? t = "---------------- " + t + " ----------------" : 2 == e ? t = t : 3 == e ? t = " - " + t : 4 == e && (t = "   . " + t), console.log("BiB/i JaTEx: " + t))
    },
    defineMode: function (e) {
        if (e.JaTEx = {Markup: !1, Layout: !1}, "ja" == B.Language) {
            var t = e.HTML.getAttribute("data-bibi-jatex") || e.ItemRef["bibi:jatex"];
            if (t) switch (t) {
                case"markup":
                    e.JaTEx.Markup = !0;
                    break;
                case"layout":
                    e.JaTEx.Layout = !0;
                    break;
                case"markup-layout":
                case"layout-markup":
                    e.JaTEx.Markup = !0, e.JaTEx.Layout = !0
            }
        }
    },
    Selector: "p, li, dd"
})(function () {
    E.bind("bibi:is-going-to:postprocess-item-content", function (e) {
        X.JaTEx.defineMode(e), e.JaTEx.Markup && (e.stamp("JaTEx Preprocess Start"), sML.each(e.Body.querySelectorAll(X.JaTEx.Selector), function () {
            var e = this,
                t = X.JaTEx.markupEnclosure(e.innerHTML, [["\\(", "\\)", "parenthesized with-parentheses"], ["（", "）", "parenthesized with-fullwidth-parentheses"], ["「", "」", "bracketed with-corner-brackets"], ["『", "』", "bracketed with-double-corner-brackets"], ["“", "”", "quoted with-double-quotation-marks"], ["〝", "〟", "quoted with-double-prime-quotation-marks"], null]);
            e.innerHTML = t;
            var n = X.JaTEx.parse(e.innerHTML);
            if (n && n.length) {
                var a = "", r = 0, i = 0;
                sML.each(n, function () {
                    var e = this;
                    "Comment" == e.Type || ("Tag" == e.Type ? "ruby:open" == e.Detail ? r++ : "ruby:close" == e.Detail ? r-- : "span.x:open" == e.Detail ? i++ : "span:open" == e.Detail && (r || i ? i++ : "span:close" == e.Detail && (r || i) && i--) : r || i || (e.Content = e.Content.replace(/⋯/g, "…").replace(/―/g, "—"), e.Content = X.JaTEx.markupPlural(e.Content, [["…{3,}", "repeated horizontal-ellipses"], ["……", "repeated as-doublewidth-horizontal-ellipsis"], ["—{3,}", "repeated em-dashes"], ["——", "repeated as-doublewidth-em-dash"], ["！{3,}", "repeated fullwidth-exclamation-marks"], ["？{3,}", "repeated fullwidth-question-marks"], ["！！", "coupled as-double-exclamation-mark"], ["？？", "coupled as-double-question-mark"], ["！？", "coupled as-exclamation-question-mark"], ["？！", "coupled as-question-exclamation-mark"], null]), e.Content = X.JaTEx.markupSingle(e.Content, [["\\(", "encloser parenthesis left-parenthesis"], ["\\)", "encloser parenthesis right-parenthesis"], ["（", "encloser fullwidth-parenthesis fullwidth-left-parenthesis"], ["）", "encloser fullwidth-parenthesis fullwidth-right-parenthesis"], ["「", "encloser corner-bracket left-corner-bracket"], ["」", "encloser corner-bracket right-corner-bracket"], ["『", "encloser white-corner-bracket left-white-corner-bracket"], ["』", "encloser white-corner-bracket right-white-corner-bracket"], ["“", "encloser double-quotation-mark left-double-quotation-mark"], ["”", "encloser double-quotation-mark right-double-quotation-mark"], ["〝", "encloser double-prime-quotation-mark reversed-double-prime-quotation-mark"], ["〟", "encloser double-prime-quotation-mark low-double-prime-quotation-mark"], ["　", "ideographic-space"], ["、", "ideographic-comma"], ["。", "ideographic-full-stop"], ["…", "horizontal-ellipsis"], ["—", "em-dash"], ["！", "fullwidth-exclamation-mark"], ["？", "fullwidth-question-mark"], null]), e.Content = "<span>" + e.Content + "</span>")), a += e.Content
                }), e.innerHTML = a.replace(/<span[^>]*><\/span>/g, ""), sML.each(e.querySelectorAll(".repeated"), function () {
                    this.innerHTML = this.innerHTML.replace(/<[^>]+>/g, "")
                }), sML.each(e.querySelectorAll(".coupled"), function () {
                    this.innerHTML = this.innerHTML.replace(/<[^>]+>/g, "")
                })
            }
        }), e.stamp("JaTEx Preprocess End"))
    }), E.bind("bibi:postprocessed-item", function (e) {
        e.RubyParents = [], sML.each(e.Body.querySelectorAll("ruby"), function () {
            for (var t = this.parentNode; "block" != getComputedStyle(t).display && t != e.Body;) t = t.parentNode;
            t != e.Body && e.RubyParents[e.RubyParents.length - 1] != t && (e.RubyParents.push(t), t.WritingMode = O.getWritingMode(t), t.LiningLength = /^tb/.test(t.WritingMode) ? "Width" : "Height", t.LiningBefore = /tb$/.test(t.WritingMode) ? "Top" : /rl$/.test(t.WritingMode) ? "Right" : "Left", t.DefaultFontSize = parseFloat(getComputedStyle(t).fontSize), t.OriginalCSSText = t.style.cssText)
        })
    }), E.bind("bibi:postprocessed-item", function (e) {
        e.JaTEx.Layout && (sML.appendStyleRule(".jatex-checker", "display: block;", e.contentDocument), sML.appendStyleRule(".jatex-checker >span", "display: block;", e.contentDocument), sML.appendStyleRule(".jatex-checker >span:last-child", "text-align: right;", e.contentDocument), sML.appendStyleRule(".jatex-checker >span:first-child", "text-align: left;", e.contentDocument), sML.appendStyleRule(".jatex-checker >span >span", "display: inline-block; width: 0; height: 0;", e.contentDocument), sML.appendStyleRule(".jatex-test", "display: inline-block; text-indent: 0;", e.contentDocument), sML.appendStyleRule(".jatex-burasage-tate", "display: inline-block; position: relative; margin-top: -1em; top: 1em;", e.contentDocument), sML.appendStyleRule(".jatex-burasage-yoko", "display: inline-block; position: relative; margin-left: -1em; left: 1em;", e.contentDocument))
    }), E.bind("bibi:is-going-to:adjust-content", function (e) {
        if (sML.UA.Safari || sML.UA.Chrome) {
            var t = [];
            e.RubyParents.forEach(function (e) {
                e.style.cssText = e.OriginalCSSText, t.push(e["offset" + e.LiningLength])
            });
            var n = sML.appendStyleRule("rt", "display: none !important;", e.contentDocument);
            e.RubyParents.forEach(function (e, n) {
                var a = t[n] - e["offset" + e.LiningLength];
                if (a > 0 && a < e.DefaultFontSize) {
                    var r = getComputedStyle(e);
                    e.style["margin" + e.LiningBefore] = parseFloat(r["margin" + e.LiningBefore]) - a + "px"
                }
            }), sML.deleteStyleRule(n, e.contentDocument)
        }
    }), E.bind("bibi:is-going-to:reset-item", function (e) {
        if (e.JaTEx.Layout) {
            e.stamp("JaTEx Reset Start");
            /^tb/.test(e.HTML.WritingMode);
            sML.each(e.Body.querySelectorAll(".ideographic-space, .ideographic-comma, .ideographic-full-stop"), function () {
                this.className = this.className.replace(/ *jatex[^ ]+/g, "")
            }), e.stamp("JaTEx Reset End")
        }
    }), E.bind("bibi:reset-item", function (e) {
        if (e.JaTEx.Layout) {
            e.stamp("JaTEx Layout Start");
            var t = /^tb/.test(e.HTML.WritingMode), n = t ? "Top" : "Left";
            sML.each(e.Body.querySelectorAll(X.JaTEx.Selector), function () {
                var e = this.appendChild(sML.create("span", {className: "jatex-checker"}));
                this.StartPoint = e.appendChild(sML.create("span")).appendChild(sML.create("span"))["offset" + n], this.EndPoint = e.appendChild(sML.create("span")).appendChild(sML.create("span"))["offset" + n], this.removeChild(e);
                var a = this;
                sML.each(this.querySelectorAll(".ideographic-space, .ideographic-comma, .ideographic-full-stop"), function () {
                    sML.addClass(this, "jatex-test"), this["offset" + n] == a.StartPoint && sML.addClass(this, "jatex-burasage-" + (t ? "tate" : "yoko")), sML.removeClass(this, "jatex-test")
                })
            }), e.stamp("JaTEx Layout End")
        }
    })
});