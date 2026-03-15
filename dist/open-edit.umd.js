(function(e,t){typeof exports==`object`&&typeof module<`u`?t(exports):typeof define==`function`&&define.amd?define([`exports`],t):(e=typeof globalThis<`u`?globalThis:e||self,t(e.OpenEdit={}))})(this,function(e){Object.defineProperties(e,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});var t=200,n=class{undoStack=[];redoStack=[];_paused=!1;push(e){this._paused||(this.undoStack.push(r(e)),this.undoStack.length>t&&this.undoStack.shift(),this.redoStack=[])}undo(e){return this.undoStack.length===0?null:(this.redoStack.push(r(e)),this.undoStack.pop())}redo(e){return this.redoStack.length===0?null:(this.undoStack.push(r(e)),this.redoStack.pop())}canUndo(){return this.undoStack.length>0}canRedo(){return this.redoStack.length>0}pause(){this._paused=!0}resume(){this._paused=!1}clear(){this.undoStack=[],this.redoStack=[]}};function r(e){return structuredClone(e)}function i(e){return{children:e??[a()]}}function a(e=``){return{type:`paragraph`,children:e?[s(e)]:[s(``)]}}function o(e,t=``){return{type:`heading`,level:e,children:[s(t)]}}function s(e,t=[]){return{type:`text`,text:e,marks:t}}function c(e=``){return{type:`list_item`,children:[s(e)]}}function l(e=[``]){return{type:`bullet_list`,children:e.map(c)}}function u(e=[``]){return{type:`ordered_list`,children:e.map(c)}}function d(e=``){return{type:`blockquote`,children:[a(e)]}}function f(e=``,t){return{type:`code_block`,lang:t,children:[s(e)]}}function p(e=``,t=`info`){return{type:`callout`,variant:t,children:[s(e)]}}function m(){return i([a(``)])}var h=[`info`,`success`,`warning`,`danger`];function g(e){if(!e||e.trim()===``)return m();let t=document.createElement(`div`);t.innerHTML=_(e);let n=v(t);return n.length===0?m():{children:n}}function _(e){return e.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,``).replace(/\s+on\w+="[^"]*"/gi,``).replace(/\s+on\w+='[^']*'/gi,``)}function v(e){let t=[];for(let n of Array.from(e.childNodes)){if(n.nodeType===Node.TEXT_NODE){let e=(n.textContent??``).trim();e&&t.push(a(e));continue}if(n.nodeType!==Node.ELEMENT_NODE)continue;let e=n,r=y(e,e.tagName.toLowerCase());r&&t.push(r)}return t}function y(e,t){switch(t){case`p`:return b(e);case`h1`:case`h2`:case`h3`:case`h4`:case`h5`:case`h6`:return x(e,parseInt(t[1]));case`blockquote`:return ee(e);case`pre`:return te(e);case`ul`:return ne(e);case`ol`:return re(e);case`img`:return oe(e);case`hr`:return{type:`hr`};case`div`:return e.classList.contains(`oe-callout`)?ae(e):v(e)[0]??null;case`section`:case`article`:case`main`:return v(e)[0]??null;case`br`:return a(``);default:return b(e)}}function b(e){let t=C(e),n=S(e);return{type:`paragraph`,...t?{align:t}:{},children:n}}function x(e,t){let n=C(e),r=S(e);return{type:`heading`,level:t,...n?{align:n}:{},children:r}}function ee(e){let t=v(e);return t.length===0&&t.push(a(``)),{type:`blockquote`,children:t}}function te(e){let t=e.querySelector(`code`),n=t?t.textContent??``:e.textContent??``,r=t?.className.match(/language-(\w+)/)?.[1];return{type:`code_block`,...r?{lang:r}:{},children:[s(n)]}}function ne(e){let t=Array.from(e.querySelectorAll(`:scope > li`)).map(ie);return t.length===0&&t.push({type:`list_item`,children:[s(``)]}),{type:`bullet_list`,children:t}}function re(e){let t=parseInt(e.getAttribute(`start`)??`1`),n=Array.from(e.querySelectorAll(`:scope > li`)).map(ie);return n.length===0&&n.push({type:`list_item`,children:[s(``)]}),{type:`ordered_list`,...t===1?{}:{start:t},children:n}}function ie(e){return{type:`list_item`,children:S(e)}}function ae(e){let t=e.getAttribute(`data-callout-variant`);return{type:`callout`,variant:h.includes(t)?t:h.find(t=>e.classList.contains(`oe-callout-${t}`))??`info`,children:S(e)}}function oe(e){return{type:`image`,src:e.getAttribute(`src`)??``,alt:e.getAttribute(`alt`)??void 0,width:e.getAttribute(`width`)?parseInt(e.getAttribute(`width`)):void 0,height:e.getAttribute(`height`)?parseInt(e.getAttribute(`height`)):void 0}}function S(e,t=[]){let n=[];for(let r of Array.from(e.childNodes)){if(r.nodeType===Node.TEXT_NODE){let e=r.textContent??``;e&&n.push(s(e,[...t]));continue}if(r.nodeType!==Node.ELEMENT_NODE)continue;let e=r,i=e.tagName.toLowerCase(),a=se(i,e,t);if(i===`br`){n.push({type:`hardbreak`});continue}if(i===`img`){n.push(s(`[image]`,t));continue}n.push(...S(e,a))}return n.length===0&&n.push(s(``,t)),n}function se(e,t,n){let r=[...n];switch(e){case`strong`:case`b`:r.some(e=>e.type===`bold`)||r.push({type:`bold`});break;case`em`:case`i`:r.some(e=>e.type===`italic`)||r.push({type:`italic`});break;case`u`:r.some(e=>e.type===`underline`)||r.push({type:`underline`});break;case`s`:case`del`:case`strike`:r.some(e=>e.type===`strikethrough`)||r.push({type:`strikethrough`});break;case`code`:r.some(e=>e.type===`code`)||r.push({type:`code`});break;case`a`:{let e={type:`link`,href:t.getAttribute(`href`)??``,target:t.getAttribute(`target`)===`_blank`?`_blank`:`_self`};r.some(e=>e.type===`link`)||r.push(e);break}case`mark`:break}return r}function C(e){let t=(e.getAttribute(`style`)??``).match(/text-align\s*:\s*(left|center|right|justify)/);return t?t[1]:void 0}function w(e){return e.children.map(T).join(`
`)}function T(e){switch(e.type){case`paragraph`:{let t=E(e.children);return`<p${e.align&&e.align!==`left`?` style="text-align:${e.align}"`:``}>${t||`<br>`}</p>`}case`heading`:{let t=E(e.children),n=e.align&&e.align!==`left`?` style="text-align:${e.align}"`:``;return`<h${e.level}${n}>${t}</h${e.level}>`}case`blockquote`:return`<blockquote>\n${e.children.map(T).join(`
`)}\n</blockquote>`;case`code_block`:{let t=de(e.children.map(e=>e.text).join(``));return`<pre><code${e.lang?` class="language-${e.lang}"`:``}>${t}</code></pre>`}case`bullet_list`:return`<ul>\n${e.children.map(e=>`  <li>${E(e.children)}</li>`).join(`
`)}\n</ul>`;case`ordered_list`:return`<ol${e.start&&e.start!==1?` start="${e.start}"`:``}>\n${e.children.map(e=>`  <li>${E(e.children)}</li>`).join(`
`)}\n</ol>`;case`image`:{let t=e.alt?` alt="${D(e.alt)}"`:``,n=e.width?` width="${e.width}"`:``,r=e.height?` height="${e.height}"`:``;return`<img src="${D(e.src)}"${t}${n}${r}>`}case`hr`:return`<hr>`;case`callout`:{let t=E(e.children);return`<div class="oe-callout oe-callout-${e.variant}" data-callout-variant="${e.variant}">${t||`<br>`}</div>`}default:return``}}function E(e){return e.map(ce).join(``)}function ce(e){if(e.type===`hardbreak`)return`<br>`;let t=de(e.text);if(t===``&&e.marks.length===0)return``;let n=[...e.marks].sort(le);for(let e of n)t=ue(t,e);return t}function le(e,t){let n=[`strikethrough`,`underline`,`italic`,`bold`,`link`,`code`];return n.indexOf(e.type)-n.indexOf(t.type)}function ue(e,t){switch(t.type){case`bold`:return`<strong>${e}</strong>`;case`italic`:return`<em>${e}</em>`;case`underline`:return`<u>${e}</u>`;case`code`:return`<code>${e}</code>`;case`strikethrough`:return`<s>${e}</s>`;case`link`:{let n=t,r=n.target===`_blank`?` target="_blank" rel="noopener noreferrer"`:``,i=n.title?` title="${D(n.title)}"`:``;return`<a href="${D(n.href)}"${r}${i}>${e}</a>`}default:return e}}function de(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function D(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`)}function O(e){return e.children.map(fe).filter(Boolean).join(`

`)}function fe(e){switch(e.type){case`paragraph`:return k(e.children);case`heading`:return`${`#`.repeat(e.level)} ${k(e.children)}`;case`blockquote`:return e.children.map(fe).join(`

`).split(`
`).map(e=>`> ${e}`).join(`
`);case`code_block`:return`\`\`\`${e.lang??``}\n${e.children.map(e=>e.text).join(``)}\n\`\`\``;case`bullet_list`:return e.children.map(e=>`- ${k(e.children)}`).join(`
`);case`ordered_list`:{let t=e.start??1;return e.children.map((e,n)=>`${t+n}. ${k(e.children)}`).join(`
`)}case`image`:return`![${e.alt??``}](${e.src})`;case`hr`:return`---`;case`callout`:return`> [!${e.variant??`info`}]\n${k(e.children).split(`
`).map(e=>e?`> ${e}`:`>`).join(`
`)}`;default:return``}}function k(e){return e.map(pe).join(``)}function pe(e){if(e.type===`hardbreak`)return`
`;let t=e.text,n=[...e.marks].sort((e,t)=>{let n=[`link`,`bold`,`italic`,`strikethrough`,`underline`,`code`];return n.indexOf(e.type)-n.indexOf(t.type)});for(let e of n)switch(e.type){case`bold`:t=`**${t}**`;break;case`italic`:t=`*${t}*`;break;case`code`:t=`\`${t}\``;break;case`strikethrough`:t=`~~${t}~~`;break;case`underline`:t=`<u>${t}</u>`;break;case`link`:{let n=e,r=n.title?` "${n.title}"`:``;t=`[${t}](${n.href}${r})`;break}}return t}function A(e){if(!e||e.trim()===``)return m();let t=me(e);return t.length>0?{children:t}:m()}function me(e){let t=e.split(`
`),n=[],r=0;for(;r<t.length;){let e=t[r];if(e.trim()===``){r++;continue}let i=e.match(/^(`{3,}|~{3,})(.*)/);if(i){let e=i[1],a=i[2].trim();r++;let o=[];for(;r<t.length&&!t[r].startsWith(e);)o.push(t[r]),r++;r<t.length&&r++,n.push({type:`code_block`,...a?{lang:a}:{},children:[s(o.join(`
`))]});continue}let o=e.match(/^(#{1,6})\s+(.*)/);if(o){let e=o[1].length;n.push({type:`heading`,level:e,children:j(o[2].trim())}),r++;continue}if(/^[-*_]{3,}\s*$/.test(e.trim())){n.push({type:`hr`}),r++;continue}if(e.startsWith(`>`)){let e=[];for(;r<t.length&&t[r].startsWith(`>`);)e.push(t[r].slice(1).trimStart()),r++;let i=e[0]?.match(/^\[!(info|success|warning|danger)\]$/i);if(i){let t=i[1].toLowerCase(),r=e.slice(1).join(`
`);n.push({type:`callout`,variant:t,children:j(r)});continue}let o=me(e.join(`
`));n.push({type:`blockquote`,children:o.length>0?o:[a(``)]});continue}if(/^[-*+] /.test(e)){let e=[];for(;r<t.length&&/^[-*+] /.test(t[r]);)e.push({type:`list_item`,children:j(t[r].replace(/^[-*+]\s+/,``))}),r++;n.push({type:`bullet_list`,children:e});continue}if(/^\d+\. /.test(e)){let i=[],a=e.match(/^(\d+)\./),o=a?parseInt(a[1]):1;for(;r<t.length&&/^\d+\. /.test(t[r]);)i.push({type:`list_item`,children:j(t[r].replace(/^\d+\.\s+/,``))}),r++;n.push({type:`ordered_list`,...o===1?{}:{start:o},children:i});continue}let c=e.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);if(c){n.push({type:`image`,alt:c[1]||void 0,src:c[2]}),r++;continue}let l=[];for(;r<t.length&&t[r].trim()!==``&&!he(t[r]);)l.push(t[r]),r++;l.length>0&&n.push({type:`paragraph`,children:j(l.join(` `))})}return n}function he(e){return/^#{1,6}\s/.test(e)||/^(`{3,}|~{3,})/.test(e)||e.startsWith(`>`)||/^[-*+] /.test(e)||/^\d+\. /.test(e)||/^[-*_]{3,}\s*$/.test(e.trim())}var ge=[{re:/`([^`]+)`/,priority:0,handler:e=>[s(e[1],[{type:`code`}])]},{re:/\[([^\]]+)\]\(([^) "]+)(?:\s+"([^"]*)")?\)/,priority:1,handler:e=>{let t=j(e[1]),n={type:`link`,href:e[2],target:`_self`,...e[3]?{title:e[3]}:{}};return t.map(e=>e.type===`text`?s(e.text,[...e.marks,n]):e)}},{re:/!\[([^\]]*)\]\(([^)]+)\)/,priority:1,handler:e=>[s(`[${e[1]||`image`}]`,[])]},{re:/\*\*([^*]+)\*\*|__([^_]+)__/,priority:2,handler:e=>M(e[1]??e[2],{type:`bold`})},{re:/\*([^*]+)\*|_([^_]+)_/,priority:3,handler:e=>M(e[1]??e[2],{type:`italic`})},{re:/~~([^~]+)~~/,priority:2,handler:e=>M(e[1],{type:`strikethrough`})},{re:/<u>([^<]+)<\/u>/,priority:2,handler:e=>M(e[1],{type:`underline`})}];function j(e){if(!e)return[s(``,[])];let t=[],n=e;for(;n.length>0;){let e=null;for(let t of ge){let r=new RegExp(t.re.source,t.re.flags.replace(`g`,``)).exec(n);if(r===null)continue;let i=r.index;(!e||i<e.index||i===e.index&&t.priority<e.pattern.priority||i===e.index&&t.priority===e.pattern.priority&&r[0].length>e.match[0].length)&&(e={index:i,match:r,pattern:t})}if(!e){t.push(s(n,[]));break}e.index>0&&t.push(s(n.slice(0,e.index),[])),t.push(...e.pattern.handler(e.match)),n=n.slice(e.index+e.match[0].length)}return t.length>0?t:[s(e,[])]}function M(e,t){return j(e).map(e=>e.type===`text`?s(e.text,[...e.marks,t]):e)}function N(e,t){let n=document.createDocumentFragment();for(let t of e.children){let e=P(t);n.appendChild(e)}t.innerHTML=``,t.appendChild(n)}function P(e){switch(e.type){case`paragraph`:{let t=document.createElement(`p`);return e.align&&e.align!==`left`&&(t.style.textAlign=e.align),F(e.children,t),t}case`heading`:{let t=document.createElement(`h${e.level}`);return e.align&&e.align!==`left`&&(t.style.textAlign=e.align),F(e.children,t),t}case`blockquote`:{let t=document.createElement(`blockquote`);for(let n of e.children)t.appendChild(P(n));return t}case`code_block`:{let t=document.createElement(`pre`),n=document.createElement(`span`);n.className=`oe-code-lang-badge`,n.contentEditable=`false`,n.textContent=e.lang||`plain`,t.appendChild(n);let r=document.createElement(`code`);return e.lang&&(r.className=`language-${e.lang}`),r.textContent=e.children.map(e=>e.text).join(``),t.appendChild(r),t}case`bullet_list`:{let t=document.createElement(`ul`);for(let n of e.children){let e=document.createElement(`li`);F(n.children,e),t.appendChild(e)}return t}case`ordered_list`:{let t=document.createElement(`ol`);e.start&&e.start!==1&&t.setAttribute(`start`,String(e.start));for(let n of e.children){let e=document.createElement(`li`);F(n.children,e),t.appendChild(e)}return t}case`image`:{let t=document.createElement(`div`);t.className=`oe-image-wrapper`;let n=document.createElement(`img`);return n.src=e.src,e.alt&&(n.alt=e.alt),e.width&&(n.width=e.width),e.height&&(n.height=e.height),n.draggable=!1,t.appendChild(n),t}case`hr`:return document.createElement(`hr`);case`callout`:{let t=document.createElement(`div`);return t.className=`oe-callout oe-callout-${e.variant}`,t.dataset.calloutVariant=e.variant,F(e.children,t),t}default:{let e=document.createElement(`p`);return e.textContent=``,e}}}function F(e,t){if(e.length===0||e.length===1&&e[0].type===`text`&&e[0].text===``){t.appendChild(document.createElement(`br`));return}for(let n of e){if(n.type===`hardbreak`){t.appendChild(document.createElement(`br`));continue}let e=document.createTextNode(n.text),r=[...n.marks];for(let t of r.reverse())e=_e(e,t);t.appendChild(e)}}function _e(e,t){let n;switch(t.type){case`bold`:n=document.createElement(`strong`);break;case`italic`:n=document.createElement(`em`);break;case`underline`:n=document.createElement(`u`);break;case`strikethrough`:n=document.createElement(`s`);break;case`code`:n=document.createElement(`code`);break;case`link`:{let e=t,r=document.createElement(`a`);r.href=e.href,e.target===`_blank`&&(r.target=`_blank`,r.rel=`noopener noreferrer`),e.title&&(r.title=e.title),n=r;break}default:n=document.createElement(`span`)}return n.appendChild(e),n}function I(e){let t=e.innerHTML;return g(t)}function L(e,t){document.execCommand(e,!1,t??void 0)}function ve(e,t,n,r){let i=[...e.children],s=i[t];if(!s)return e;let c=z(s),m;switch(n){case`paragraph`:m={...a(c),...r??{}};break;case`heading`:m=o(r?.level??1,c);break;case`h1`:case`H1`:m=o(1,c);break;case`h2`:case`H2`:m=o(2,c);break;case`h3`:case`H3`:m=o(3,c);break;case`h4`:case`H4`:m=o(4,c);break;case`h5`:case`H5`:m=o(5,c);break;case`h6`:case`H6`:m=o(6,c);break;case`blockquote`:case`BLOCKQUOTE`:m=d(c);break;case`code_block`:case`PRE`:m=f(c,r?.lang);break;case`bullet_list`:m=l([c]);break;case`ordered_list`:m=u([c]);break;case`callout`:m=p(c,r?.variant??`info`);break;case`CALLOUT-info`:case`CALLOUT-success`:case`CALLOUT-warning`:case`CALLOUT-danger`:{let e=n.split(`-`)[1];m=p(c,e);break}default:m=a(c)}return i[t]=m,{children:i}}function ye(e,t,n){let r=[...e.children],i=r[t];if(!i)return e;if(i.type===n){let e=i.children.map(e=>a(e.children.map(e=>e.type===`text`?e.text:``).join(``)));r.splice(t,1,...e)}else if(i.type===`bullet_list`||i.type===`ordered_list`){let e=i;n===`bullet_list`?r[t]={type:`bullet_list`,children:e.children}:r[t]={type:`ordered_list`,children:e.children}}else{let e=z(i);r[t]=n===`bullet_list`?l([e]):u([e])}return{children:r}}function be(e,t,n){let r=[...e.children],i=r[t];return i?((i.type===`paragraph`||i.type===`heading`)&&(r[t]={...i,align:n}),{children:r}):e}function R(e,t,n,r){let i=[...e.children],o={type:`image`,src:n,alt:r};return i.splice(t+1,0,o,a(``)),{children:i}}function xe(e,t){let n=[...e.children];return n.splice(t+1,0,{type:`hr`},a(``)),{children:n}}function z(e){return e.type===`paragraph`||e.type===`heading`||e.type===`list_item`||e.type===`code_block`||e.type===`callout`?e.children.map(e=>e.type===`text`?e.text:``).join(``):e.type===`bullet_list`||e.type===`ordered_list`?e.children.map(e=>e.children.map(e=>e.type===`text`?e.text:``).join(``)).join(` `):e.type===`blockquote`?e.children.map(z).join(` `):``}function Se(e){let t=window.getSelection();if(!t||t.rangeCount===0)return`p`;let n=t.anchorNode;for(;n&&n.parentNode!==e;)n=n.parentNode;if(!n||n.nodeType!==Node.ELEMENT_NODE)return`p`;let r=n.tagName.toLowerCase();return r===`h1`?`H1`:r===`h2`?`H2`:r===`h3`?`H3`:r===`h4`?`H4`:r===`blockquote`?`BLOCKQUOTE`:r===`pre`?`PRE`:r===`ul`?`bullet_list`:r===`ol`?`ordered_list`:r===`div`&&n.classList?.contains(`oe-callout`)?`CALLOUT-${n.dataset?.calloutVariant??`info`}`:`P`}function Ce(e,t){document.execCommand(`createLink`,!1,e);let n=window.getSelection();if(n&&n.rangeCount>0){let e=n.getRangeAt(0).startContainer.parentElement?.closest(`a`);e&&(e.target=t,t===`_blank`&&(e.rel=`noopener noreferrer`))}}function B(e,t){let n=window.getSelection();if(!n||n.rangeCount===0)return null;let r=n.getRangeAt(0);if(!e.contains(r.commonAncestorContainer))return null;let i=we(e,n.anchorNode,n.anchorOffset),a=we(e,n.focusNode,n.focusOffset);return!i||!a?null:{anchor:i,focus:a,isCollapsed:n.isCollapsed}}function we(e,t,n){let r=null,i=t;for(;i&&i!==e;){if(i.parentNode===e&&i.nodeType===Node.ELEMENT_NODE){r=i;break}i=i.parentNode}if(!r)return null;let a=Array.from(e.children).indexOf(r);if(a<0)return null;let o=Ee(r,t,n),s=Te(t,r);if(s){let e=s.parentElement;return{blockIndex:a,itemIndex:Array.from(e.children).indexOf(s),offset:o}}return{blockIndex:a,offset:o}}function Te(e,t){let n=e;for(;n&&n!==t;){if(n.nodeType===Node.ELEMENT_NODE&&n.tagName===`LI`)return n;n=n.parentNode}return null}function Ee(e,t,n){return V(e,t,n,{count:0,done:!1,result:0}).result}function V(e,t,n,r){if(r.done)return r;if(e===t)return r.result=r.count+(e.nodeType===Node.TEXT_NODE?n:0),r.done=!0,r;if(e.nodeType===Node.TEXT_NODE)return r.count+=(e.textContent??``).length,r;if(e.nodeType===Node.ELEMENT_NODE&&e.tagName.toLowerCase()===`br`)return e===t&&(r.result=r.count,r.done=!0),r;for(let i of Array.from(e.childNodes))if(r=V(i,t,n,r),r.done)break;return r}function H(e){let t=window.getSelection();if(!t||t.rangeCount===0)return 0;let n=t.anchorNode;for(;n&&n.parentNode!==e;)n=n.parentNode;return n?Array.from(e.children).indexOf(n):0}function U(e){let t=window.getSelection(),n=new Set;if(!t||t.rangeCount===0)return n;let r=t.getRangeAt(0);if(!e.contains(r.commonAncestorContainer))return n;let i=t.anchorNode;for(;i&&i!==e;){if(i.nodeType===Node.ELEMENT_NODE){let e=i.tagName.toLowerCase();(e===`strong`||e===`b`)&&n.add(`bold`),(e===`em`||e===`i`)&&n.add(`italic`),e===`u`&&n.add(`underline`),(e===`s`||e===`del`)&&n.add(`strikethrough`),e===`code`&&n.add(`code`),e===`a`&&n.add(`link`)}i=i.parentNode}return n}var W={toolbar:{undo:`Undo (Ctrl+Z)`,redo:`Redo (Ctrl+Y)`,textFormat:`Text Format`,paragraph:`Paragraph`,heading:e=>`Heading ${e}`,quote:`Quote`,codeBlock:`Code Block`,bold:`Bold (Ctrl+B)`,italic:`Italic (Ctrl+I)`,underline:`Underline (Ctrl+U)`,inlineCode:"Inline Code (Ctrl+`)",alignLeft:`Align Left`,alignCenter:`Align Center`,alignRight:`Align Right`,justify:`Justify`,bulletList:`Bullet List`,orderedList:`Ordered List`,insertLink:`Insert Link`,insertImage:`Insert Image`,blockquote:`Blockquote`,horizontalRule:`Horizontal Rule`,htmlSource:`Toggle HTML Source`,calloutInfo:`Callout: Info`,calloutSuccess:`Callout: Success`,calloutWarning:`Callout: Warning`,calloutDanger:`Callout: Danger`,insertCallout:`Insert Callout`},statusBar:{words:`Words`,characters:`Characters`,htmlSource:`HTML`},dialogs:{linkUrl:`Link URL:`,openInNewTab:`Open in new tab?`,imageUrl:`Image URL:`,imageAlt:`Alt text (optional):`},plugins:{ai:{panelTitle:`AI Assistant`,noSelection:`(No text selected — entire document will be used)`,customPromptPlaceholder:`Enter custom instruction…`,runButton:`Run`,applyButton:`Apply`,generating:`⏳ Generating…`,noApiKey:`⚠️ No API key configured. Pass apiKey or endpoint when creating the plugin.`,errorPrefix:`❌ Error: `,actions:{improve:`Improve`,shorten:`Shorten`,expand:`Expand`,summarize:`Summarize`,toGerman:`🇩🇪 To German`,toEnglish:`🇬🇧 To English`}},emoji:{buttonTitle:`Insert emoji`,categories:{faces:`Faces`,hearts:`Hearts`,gestures:`Gestures`,nature:`Nature`,food:`Food`,objects:`Objects`,symbols:`Symbols`}}}},De=`width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;function G(e){return`<svg ${De}>${e}</svg>`}var Oe={undo:G(`<path d="M3 7h10a6 6 0 0 1 0 12H9"/><path d="M3 7l4-4M3 7l4 4"/>`),redo:G(`<path d="M21 7H11a6 6 0 0 0 0 12h4"/><path d="M21 7l-4-4M21 7l-4 4"/>`),bold:G(`<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>`),italic:G(`<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>`),underline:G(`<path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/>`),strikethrough:G(`<path d="M17.3 12H12m-6 0h3"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M7 7.5C7 5.6 9 4 12 4s5 1.6 5 3.5c0 .7-.3 1.4-.8 2"/><path d="M17 16.5C17 18.4 15 20 12 20s-5-1.6-5-3.5"/>`),code_inline:G(`<polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>`),link:G(`<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`),image:G(`<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>`),blockquote:G(`<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>`),hr:G(`<line x1="5" y1="12" x2="19" y2="12"/>`),alignLeft:G(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>`),alignCenter:G(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>`),alignRight:G(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/>`),alignJustify:G(`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`),bulletList:G(`<circle cx="4" cy="7" r="1.5" fill="currentColor"/><line x1="8" y1="7" x2="21" y2="7"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><line x1="8" y1="12" x2="21" y2="12"/><circle cx="4" cy="17" r="1.5" fill="currentColor"/><line x1="8" y1="17" x2="21" y2="17"/>`),orderedList:G(`<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>`),htmlToggle:G(`<path d="M10 9l-3 3 3 3"/><path d="M14 15l3-3-3-3"/><rect x="2" y="3" width="20" height="18" rx="2"/>`),maximize:G(`<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>`),callout:G(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`)};function K(e){let t=e.toolbar;return[{type:`button`,id:`undo`,icon:`undo`,title:t.undo,command:`undo`},{type:`button`,id:`redo`,icon:`redo`,title:t.redo,command:`redo`},{type:`separator`},{type:`select`,id:`blockType`,title:t.textFormat,command:`setBlock`,options:[{label:t.paragraph,value:`P`},{label:t.heading(1),value:`H1`},{label:t.heading(2),value:`H2`},{label:t.heading(3),value:`H3`},{label:t.heading(4),value:`H4`},{label:t.quote,value:`BLOCKQUOTE`},{label:t.codeBlock,value:`PRE`},{label:t.calloutInfo,value:`CALLOUT-info`},{label:t.calloutSuccess,value:`CALLOUT-success`},{label:t.calloutWarning,value:`CALLOUT-warning`},{label:t.calloutDanger,value:`CALLOUT-danger`}],getValue:e=>e.getActiveBlockType()},{type:`separator`},{type:`button`,id:`bold`,icon:`bold`,title:t.bold,command:`bold`,isActive:e=>e.isMarkActive(`bold`)},{type:`button`,id:`italic`,icon:`italic`,title:t.italic,command:`italic`,isActive:e=>e.isMarkActive(`italic`)},{type:`button`,id:`underline`,icon:`underline`,title:t.underline,command:`underline`,isActive:e=>e.isMarkActive(`underline`)},{type:`button`,id:`code`,icon:`code_inline`,title:t.inlineCode,command:`code`,isActive:e=>e.isMarkActive(`code`)},{type:`separator`},{type:`button`,id:`alignLeft`,icon:`alignLeft`,title:t.alignLeft,command:`alignLeft`},{type:`button`,id:`alignCenter`,icon:`alignCenter`,title:t.alignCenter,command:`alignCenter`},{type:`button`,id:`alignRight`,icon:`alignRight`,title:t.alignRight,command:`alignRight`},{type:`button`,id:`alignJustify`,icon:`alignJustify`,title:t.justify,command:`alignJustify`},{type:`separator`},{type:`button`,id:`bulletList`,icon:`bulletList`,title:t.bulletList,command:`bulletList`,isActive:e=>e.getActiveBlockType()===`bullet_list`},{type:`button`,id:`orderedList`,icon:`orderedList`,title:t.orderedList,command:`orderedList`,isActive:e=>e.getActiveBlockType()===`ordered_list`},{type:`separator`},{type:`button`,id:`link`,icon:`link`,title:t.insertLink,command:`link`},{type:`button`,id:`image`,icon:`image`,title:t.insertImage,command:`image`},{type:`button`,id:`blockquote`,icon:`blockquote`,title:t.blockquote,command:`blockquote`},{type:`button`,id:`hr`,icon:`hr`,title:t.horizontalRule,command:`hr`},{type:`button`,id:`callout`,icon:`callout`,title:t.insertCallout,command:`callout`,isActive:e=>e.getActiveBlockType().startsWith(`CALLOUT-`)}]}K(W);function ke(e,t=W){let n=K(t).filter(t=>t.type===`separator`||t.type===`spacer`?!0:`id`in t&&e.includes(t.id)),r=[];for(let e of n)if(e.type===`separator`){let t=r[r.length-1];if(!t||t.type===`separator`||t.type===`spacer`)continue;r.push(e)}else r.push(e);for(;r.length>0;){let e=r[r.length-1];if(e.type===`separator`||e.type===`spacer`)r.pop();else break}return r}var Ae=`oe-callout-picker-styles`;function je(){if(document.getElementById(Ae))return;let e=document.createElement(`style`);e.id=Ae,e.textContent=`
.oe-callout-picker {
  position: fixed;
  z-index: 10000;
  background: var(--oe-bg, #ffffff);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 160px;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
.oe-callout-picker-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--oe-text, #1c1917);
  user-select: none;
  transition: background 80ms;
}
.oe-callout-picker-item:hover {
  background: var(--oe-btn-hover-bg, #f5f5f4);
}
.oe-callout-picker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
`,document.head.appendChild(e)}var Me=[{variant:`info`,label:`Info`,color:`#3b82f6`},{variant:`success`,label:`Success`,color:`#22c55e`},{variant:`warning`,label:`Warning`,color:`#f59e0b`},{variant:`danger`,label:`Danger`,color:`#ef4444`}],Ne=class{el;editor;config;itemEls=new Map;disabled=!1;locale;calloutPickerEl=null;calloutPickerCleanup=null;constructor(e,t,n,r,i=W){this.el=e,this.editor=t,this.locale=i,n?this.config=n:r?this.config=ke(r,i):this.config=K(i),this.render()}render(){this.el.innerHTML=``,this.el.className=`oe-toolbar`;for(let e of this.config){let t=this.renderItem(e);this.el.appendChild(t)}}renderItem(e){switch(e.type){case`separator`:{let e=document.createElement(`div`);return e.className=`oe-toolbar-sep`,e}case`spacer`:{let e=document.createElement(`div`);return e.className=`oe-toolbar-spacer`,e}case`select`:{let t=document.createElement(`div`);t.className=`oe-toolbar-select-wrap`;let n=document.createElement(`select`);n.className=`oe-toolbar-select`,n.title=e.title;for(let t of e.options){let e=document.createElement(`option`);e.value=t.value,e.textContent=t.label,n.appendChild(e)}return n.addEventListener(`change`,()=>{let e=n.value;this.handleBlockTypeChange(e),setTimeout(()=>this.editor.focus(),0)}),t.appendChild(n),this.itemEls.set(e.id,n),t}case`button`:{let t=document.createElement(`button`);return t.type=`button`,t.className=`oe-toolbar-btn`,t.title=e.title,t.innerHTML=Oe[e.icon]??e.icon,t.addEventListener(`mousedown`,e=>{e.preventDefault()}),t.addEventListener(`click`,()=>{this.handleCommand(e.command,e)}),this.itemEls.set(e.id,t),t}}}handleCommand(e,t){let n=this.editor;switch(e){case`bold`:n.chain().toggleMark(`bold`).run();break;case`italic`:n.chain().toggleMark(`italic`).run();break;case`underline`:n.chain().toggleMark(`underline`).run();break;case`code`:n.chain().toggleMark(`code`).run();break;case`bulletList`:n.chain().toggleList(`bullet_list`).run();break;case`orderedList`:n.chain().toggleList(`ordered_list`).run();break;case`blockquote`:n.chain().setBlock(`blockquote`).run();break;case`hr`:n.chain().insertHr().run();break;case`callout`:{let e=t?this.itemEls.get(t.id):null;e&&this.toggleCalloutPicker(e);break}case`undo`:n.chain().undo().run();break;case`redo`:n.chain().redo().run();break;case`alignLeft`:n.chain().setAlign(`left`).run();break;case`alignCenter`:n.chain().setAlign(`center`).run();break;case`alignRight`:n.chain().setAlign(`right`).run();break;case`alignJustify`:n.chain().setAlign(`justify`).run();break;case`link`:this.handleLinkCommand();break;case`image`:this.handleImageCommand();break;case`htmlToggle`:n.toggleHTMLMode?.();break}}toggleCalloutPicker(e){if(this.calloutPickerEl){this.closeCalloutPicker();return}je();let t=document.createElement(`div`);t.className=`oe-callout-picker`,this.calloutPickerEl=t;for(let{variant:e,label:n,color:r}of Me){let i=document.createElement(`div`);i.className=`oe-callout-picker-item`,i.innerHTML=`<span class="oe-callout-picker-dot" style="background:${r}"></span>${n}`,i.addEventListener(`mousedown`,t=>{t.preventDefault(),this.closeCalloutPicker(),this.editor.chain().setBlock(`callout`,{variant:e}).run()}),t.appendChild(i)}document.body.appendChild(t);let n=e.getBoundingClientRect();t.style.top=`${n.bottom+4}px`,t.style.left=`${n.left}px`,requestAnimationFrame(()=>{if(!t.isConnected)return;let e=window.innerWidth;n.left+t.offsetWidth>e-8&&(t.style.left=`${e-t.offsetWidth-8}px`)});let r=n=>{!t.contains(n.target)&&n.target!==e&&(this.closeCalloutPicker(),document.removeEventListener(`mousedown`,r,!0))};setTimeout(()=>document.addEventListener(`mousedown`,r,!0),0);let i=()=>{this.closeCalloutPicker()};window.addEventListener(`scroll`,i,{passive:!0,capture:!0}),this.calloutPickerCleanup=()=>{window.removeEventListener(`scroll`,i,!0)}}closeCalloutPicker(){this.calloutPickerCleanup?.(),this.calloutPickerCleanup=null,this.calloutPickerEl?.remove(),this.calloutPickerEl=null}handleBlockTypeChange(e){switch(e){case`P`:this.editor.chain().setBlock(`paragraph`).run();return;case`H1`:case`H2`:case`H3`:case`H4`:case`H5`:case`H6`:this.editor.chain().setBlock(`heading`,{level:Number(e[1])}).run();return;case`BLOCKQUOTE`:this.editor.chain().setBlock(`blockquote`).run();return;case`PRE`:this.editor.chain().setBlock(`code_block`).run();return;case`bullet_list`:case`ordered_list`:this.editor.chain().setBlock(e).run();return;case`CALLOUT-info`:case`CALLOUT-success`:case`CALLOUT-warning`:case`CALLOUT-danger`:{let t=e.split(`-`)[1];this.editor.chain().setBlock(`callout`,{variant:t}).run();return}default:this.editor.chain().setBlock(`paragraph`).run()}}handleLinkCommand(){let e=window.getSelection(),t=e&&!e.isCollapsed?e.toString():``,n=this.locale.dialogs,r=window.prompt(n.linkUrl,t.startsWith(`http`)?t:`https://`);if(!r)return;let i=window.confirm(n.openInNewTab)?`_blank`:`_self`;this.editor.chain().toggleMark(`link`,{href:r,target:i}).run()}handleImageCommand(){let e=this.locale.dialogs,t=window.prompt(e.imageUrl,`https://`);if(!t)return;let n=window.prompt(e.imageAlt,``)??``;this.editor.chain().insertImage(t,n||void 0).run()}updateActiveState(){if(this.disabled)return;let e=U(this.editor.editorEl),t=this.editor.getActiveBlockType();for(let[n,r]of this.itemEls){let i=this.config.find(e=>(e.type===`button`||e.type===`select`)&&`id`in e&&e.id===n);if(i){if(i.type===`select`){r.value=t;continue}if(i.type===`button`){let a=i.isActive?i.isActive(this.editor):n===`bold`&&e.has(`bold`)||n===`italic`&&e.has(`italic`)||n===`underline`&&e.has(`underline`)||n===`code`&&e.has(`code`)||n===`link`&&e.has(`link`)||n===`bulletList`&&t===`bullet_list`||n===`orderedList`&&t===`ordered_list`;r.classList.toggle(`oe-active`,a)}}}}setDisabled(e){this.disabled=e,this.el.classList.toggle(`oe-toolbar-disabled`,e);for(let t of this.itemEls.values())t instanceof HTMLButtonElement&&(t.disabled=e),t instanceof HTMLSelectElement&&(t.disabled=e)}},Pe=class{el;editor;locale;hideTimer=null;constructor(e,t,n=W){this.el=e,this.editor=t,this.locale=n,this.render()}get editorEl(){return this.editor.editorEl}render(){this.el.className=`oe-bubble-toolbar`;let e=this.locale.toolbar,t=this.locale.dialogs,n=[{id:`bold`,icon:`bold`,title:e.bold,action:()=>this.editor.chain().toggleMark(`bold`).run(),isActive:()=>this.editor.isMarkActive(`bold`)},{id:`italic`,icon:`italic`,title:e.italic,action:()=>this.editor.chain().toggleMark(`italic`).run(),isActive:()=>this.editor.isMarkActive(`italic`)},{id:`underline`,icon:`underline`,title:e.underline,action:()=>this.editor.chain().toggleMark(`underline`).run(),isActive:()=>this.editor.isMarkActive(`underline`)},{id:`code_inline`,icon:`code_inline`,title:e.inlineCode,action:()=>this.editor.chain().toggleMark(`code`).run(),isActive:()=>this.editor.isMarkActive(`code`)},{id:`link`,icon:`link`,title:e.insertLink,action:()=>{let e=window.prompt(t.linkUrl,`https://`);if(!e)return;let n=window.confirm(t.openInNewTab)?`_blank`:`_self`;this.editor.chain().toggleMark(`link`,{href:e,target:n}).run()},isActive:()=>this.editor.isMarkActive(`link`)}];for(let e of n){let t=document.createElement(`button`);t.type=`button`,t.className=`oe-bubble-btn`,t.title=e.title,t.innerHTML=Oe[e.icon]??e.icon,t.dataset.btnId=e.id,t.addEventListener(`mousedown`,e=>{e.preventDefault()}),t.addEventListener(`click`,()=>{e.action(),this.updateActiveState()}),this.el.appendChild(t)}}onSelectionChange(){let e=window.getSelection();if(!e||e.isCollapsed||!this.editorEl.contains(e.anchorNode)){this.hide();return}this.hideTimer&&clearTimeout(this.hideTimer),setTimeout(()=>{let e=window.getSelection();if(!e||e.isCollapsed){this.hide();return}this.showAtSelection(),this.updateActiveState()},100)}showAtSelection(){let e=window.getSelection();if(!e||e.rangeCount===0)return;let t=e.getRangeAt(0).getBoundingClientRect();if(!t.width&&!t.height){this.hide();return}let n=window.scrollY,r=window.scrollX,i=t.top+n-44-8,a=t.left+r+t.width/2-280/2;i<n+8&&(i=t.bottom+n+8),a<8&&(a=8),a+280>window.innerWidth-8&&(a=window.innerWidth-280-8),this.el.style.top=`${i}px`,this.el.style.left=`${a}px`,this.el.classList.add(`oe-bubble-visible`)}hide(){this.hideTimer=setTimeout(()=>{this.el.classList.remove(`oe-bubble-visible`)},200)}updateActiveState(){let e=U(this.editorEl);this.el.querySelectorAll(`.oe-bubble-btn`).forEach(t=>{let n=t.dataset.btnId??``,r=n===`bold`&&e.has(`bold`)||n===`italic`&&e.has(`italic`)||n===`underline`&&e.has(`underline`)||n===`code_inline`&&e.has(`code`)||n===`link`&&e.has(`link`);t.classList.toggle(`oe-active`,r)})}destroy(){this.hideTimer&&clearTimeout(this.hideTimer),this.el.remove()}},Fe=`openedit-styles`;function Ie(e){if(document.getElementById(Fe))return;let t=document.createElement(`style`);t.id=Fe,t.textContent=Le(),document.head.appendChild(t)}function Le(){return`
/* ── CSS Custom Properties (Light Mode defaults) ────────────────────── */
:root {
  --oe-bg: #ffffff;
  --oe-bg-toolbar: #fafaf9;
  --oe-bg-statusbar: #fafaf9;
  --oe-bg-code: #1c1917;
  --oe-bg-html: #1c1917;
  --oe-border: #e7e5e4;
  --oe-border-inner: #e7e5e4;
  --oe-text: #1c1917;
  --oe-text-muted: #78716c;
  --oe-text-light: #a8a29e;
  --oe-text-code: #f5f5f4;
  --oe-btn-active-bg: #1c1917;
  --oe-btn-active-fg: #ffffff;
  --oe-btn-hover-bg: #f5f5f4;
  --oe-shadow: 0 4px 16px rgba(0,0,0,0.07);
  --oe-radius: 16px;
  --oe-radius-sm: 8px;
  --oe-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --oe-font-mono: "Fira Code", "Cascadia Code", "Courier New", monospace;
  --oe-focus-ring: 0 0 0 4px rgba(28,25,23,0.05);
  --oe-link-color: #2563eb;
  --oe-mark-bg: rgba(251,191,36,0.4);
  --oe-blockquote-border: #d6d3d1;
}

/* Dark mode via attribute */
[data-oe-theme="dark"] .oe-container,
.oe-container[data-oe-theme="dark"] {
  --oe-bg: #1c1917;
  --oe-bg-toolbar: #1c1917;
  --oe-bg-statusbar: #161412;
  --oe-bg-code: #0c0a09;
  --oe-bg-html: #0c0a09;
  --oe-border: #3a3330;
  --oe-border-inner: #2c2a28;
  --oe-text: #e7e5e4;
  --oe-text-muted: #a8a29e;
  --oe-text-light: #78716c;
  --oe-btn-active-bg: #e7e5e4;
  --oe-btn-active-fg: #1c1917;
  --oe-btn-hover-bg: #292524;
  --oe-shadow: 0 4px 16px rgba(0,0,0,0.4);
  --oe-link-color: #60a5fa;
  --oe-mark-bg: rgba(180,130,0,0.3);
  --oe-blockquote-border: #57534e;
}

/* Auto dark mode (follows OS preference) */
@media (prefers-color-scheme: dark) {
  [data-oe-theme="auto"] .oe-container,
  .oe-container[data-oe-theme="auto"] {
    --oe-bg: #1c1917;
    --oe-bg-toolbar: #1c1917;
    --oe-bg-statusbar: #161412;
    --oe-bg-code: #0c0a09;
    --oe-bg-html: #0c0a09;
    --oe-border: #3a3330;
    --oe-border-inner: #2c2a28;
    --oe-text: #e7e5e4;
    --oe-text-muted: #a8a29e;
    --oe-text-light: #78716c;
    --oe-btn-active-bg: #e7e5e4;
    --oe-btn-active-fg: #1c1917;
    --oe-btn-hover-bg: #292524;
    --oe-shadow: 0 4px 16px rgba(0,0,0,0.4);
    --oe-link-color: #60a5fa;
    --oe-mark-bg: rgba(180,130,0,0.3);
    --oe-blockquote-border: #57534e;
  }
}

/* ── Container ──────────────────────────────────────────────────────── */
.oe-container {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--oe-border);
  border-radius: var(--oe-radius);
  overflow: hidden;
  background: var(--oe-bg);
  box-shadow: var(--oe-shadow);
  font-family: var(--oe-font);
  color: var(--oe-text);
  box-sizing: border-box;
  transition: box-shadow 0.15s, border-color 0.15s;
}

.oe-container.oe-focused {
  box-shadow: var(--oe-shadow), var(--oe-focus-ring);
  border-color: #a8a29e;
}

/* ── Toolbar ────────────────────────────────────────────────────────── */
.oe-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--oe-border);
  background: var(--oe-bg-toolbar);
  border-radius: var(--oe-radius) var(--oe-radius) 0 0;
  min-height: 50px;
  box-sizing: border-box;
}

.oe-toolbar-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.oe-toolbar-sep {
  width: 1px;
  height: 24px;
  background: var(--oe-border);
  margin: 0 6px;
  flex-shrink: 0;
}

.oe-toolbar-spacer {
  flex: 1;
}

.oe-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--oe-radius-sm);
  background: transparent;
  color: var(--oe-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s, color 0.1s;
}

.oe-toolbar-btn:hover {
  background: var(--oe-btn-hover-bg);
  color: var(--oe-text);
}

.oe-toolbar-btn.oe-active {
  background: var(--oe-btn-active-bg);
  color: var(--oe-btn-active-fg);
}

.oe-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.oe-toolbar-select-wrap {
  position: relative;
}

.oe-toolbar-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--oe-border);
  border-radius: var(--oe-radius-sm);
  background: var(--oe-bg);
  color: var(--oe-text);
  font-family: var(--oe-font);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  min-width: 130px;
  transition: border-color 0.1s;
}

.oe-toolbar-select:hover {
  border-color: var(--oe-text-light);
}

.oe-toolbar-select:focus {
  border-color: var(--oe-text-muted);
}

/* ── Content wrapper ────────────────────────────────────────────────── */
.oe-content-wrap {
  flex: 1;
  position: relative;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

/* ── Editor (contenteditable) ───────────────────────────────────────── */
.oe-editor {
  flex: 1;
  padding: 28px 32px;
  outline: none;
  min-height: 300px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--oe-text);
  background: var(--oe-bg);
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

/* Placeholder */
.oe-editor.oe-empty::before {
  content: attr(data-placeholder);
  color: var(--oe-text-light);
  pointer-events: none;
  position: absolute;
  top: 28px;
  left: 32px;
}

/* Content styles */
.oe-editor h1 { font-size: 1.875rem; font-weight: 700; margin: 0 0 1rem; color: var(--oe-text); }
.oe-editor h2 { font-size: 1.5rem;   font-weight: 600; margin: 1.4rem 0 0.75rem; color: var(--oe-text); }
.oe-editor h3 { font-size: 1.25rem;  font-weight: 600; margin: 1.2rem 0 0.6rem;  color: var(--oe-text); }
.oe-editor h4 { font-size: 1.125rem; font-weight: 600; margin: 1rem 0 0.5rem;    color: var(--oe-text); }
.oe-editor h1:first-child,
.oe-editor h2:first-child { margin-top: 0; }
.oe-editor p  { margin: 0 0 0.875rem; }
.oe-editor p:last-child { margin-bottom: 0; }
.oe-editor strong, .oe-editor b { font-weight: 600; color: var(--oe-text); }
.oe-editor em, .oe-editor i { font-style: italic; }
.oe-editor u { text-decoration: underline; text-underline-offset: 2px; }
.oe-editor s, .oe-editor del { text-decoration: line-through; color: var(--oe-text-muted); }
.oe-editor code {
  background: rgba(0,0,0,0.06);
  color: #c2410c;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: var(--oe-font-mono);
  font-size: 0.875em;
}
.oe-editor pre {
  background: var(--oe-bg-code);
  color: var(--oe-text-code);
  border-radius: 10px;
  padding: 16px 20px;
  padding-top: 32px;
  font-family: var(--oe-font-mono);
  font-size: 0.875rem;
  overflow-x: auto;
  margin: 0.875rem 0;
  line-height: 1.6;
  position: relative;
}
.oe-editor pre code { background: transparent; color: inherit; padding: 0; border-radius: 0; }
/* Prevent highlight.js from overriding the <pre> background */
.oe-editor pre code.hljs { background: transparent; }

/* ── Code language badge ─────────────────────────────────────────────────── */
.oe-code-lang-badge {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-weight: 500;
  color: rgba(255,255,255,0.35);
  background: transparent;
  cursor: pointer;
  user-select: none;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: color 120ms, border-color 120ms;
  line-height: 1.5;
  letter-spacing: 0.02em;
}
.oe-code-lang-badge:hover {
  color: rgba(255,255,255,0.7);
  border-color: rgba(255,255,255,0.2);
}

/* ── Code language picker ────────────────────────────────────────────────── */
.oe-code-lang-picker {
  position: fixed;
  z-index: 10000;
  background: var(--oe-bg, #ffffff);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
  padding: 6px;
  min-width: 180px;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
.oe-code-lang-picker-input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 6px;
  padding: 6px 9px;
  font-size: 13px;
  font-family: inherit;
  background: var(--oe-bg, #fff);
  color: var(--oe-text, #1c1917);
  outline: none;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.oe-code-lang-picker-input:focus {
  border-color: var(--oe-btn-active-bg, #1c1917);
}
.oe-code-lang-picker-list {
  overflow-y: auto;
  flex: 1;
}
.oe-code-lang-picker-item {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--oe-text, #1c1917);
  font-family: var(--oe-font-mono, monospace);
  user-select: none;
  transition: background 80ms;
}
.oe-code-lang-picker-item:hover,
.oe-code-lang-picker-item.oe-active {
  background: var(--oe-btn-hover-bg, #f5f5f4);
}
.oe-code-lang-picker-item.oe-active {
  background: var(--oe-btn-active-bg, #1c1917);
  color: var(--oe-btn-active-fg, #ffffff);
}
.oe-editor blockquote {
  border-left: 4px solid var(--oe-blockquote-border);
  padding: 4px 0 4px 16px;
  margin: 0.875rem 0;
  color: var(--oe-text-muted);
  font-style: italic;
  background: rgba(0,0,0,0.02);
  border-radius: 0 6px 6px 0;
}
.oe-editor ul { list-style: disc; padding-left: 1.5rem; margin: 0.875rem 0; }
.oe-editor ol { list-style: decimal; padding-left: 1.5rem; margin: 0.875rem 0; }
.oe-editor li { margin-bottom: 0.25rem; }
.oe-editor a { color: var(--oe-link-color); text-decoration: underline; text-underline-offset: 2px; }
.oe-editor mark { background: var(--oe-mark-bg); border-radius: 3px; padding: 0 3px; color: var(--oe-text); }
.oe-editor hr { border: none; border-top: 2px solid var(--oe-border); margin: 1.5rem 0; }
.oe-editor img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid var(--oe-border); cursor: pointer; transition: box-shadow 0.15s; }
.oe-editor img:hover { box-shadow: 0 0 0 3px rgba(59,130,246,0.35); }
.oe-image-wrapper { margin: 0.875rem 0; display: block; }

/* ── Callout Blocks ─────────────────────────────────────────────────── */
.oe-editor .oe-callout {
  display: block;
  position: relative;
  padding: 12px 16px 12px 20px;
  margin: 0.875rem 0;
  border-left: 4px solid var(--oe-callout-border, #3b82f6);
  border-radius: 0 8px 8px 0;
  background: var(--oe-callout-bg, rgba(59,130,246,0.07));
  color: var(--oe-text);
  font-style: normal;
  line-height: 1.6;
}

/* Info */
.oe-editor .oe-callout-info {
  --oe-callout-border: #3b82f6;
  --oe-callout-bg: rgba(59,130,246,0.07);
  --oe-callout-icon-color: #3b82f6;
}
.oe-editor .oe-callout-info::before {
  content: 'ℹ';
  position: absolute;
  left: -1.45rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85em;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Success */
.oe-editor .oe-callout-success {
  --oe-callout-border: #22c55e;
  --oe-callout-bg: rgba(34,197,94,0.07);
  --oe-callout-icon-color: #22c55e;
}
.oe-editor .oe-callout-success::before {
  content: '✓';
  position: absolute;
  left: -1.3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85em;
  font-weight: 700;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Warning */
.oe-editor .oe-callout-warning {
  --oe-callout-border: #f59e0b;
  --oe-callout-bg: rgba(245,158,11,0.07);
  --oe-callout-icon-color: #f59e0b;
}
.oe-editor .oe-callout-warning::before {
  content: '⚠';
  position: absolute;
  left: -1.45rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Danger */
.oe-editor .oe-callout-danger {
  --oe-callout-border: #ef4444;
  --oe-callout-bg: rgba(239,68,68,0.07);
  --oe-callout-icon-color: #ef4444;
}
.oe-editor .oe-callout-danger::before {
  content: '✕';
  position: absolute;
  left: -1.3rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  font-weight: 700;
  color: var(--oe-callout-icon-color);
  line-height: 1;
}

/* Dark mode adjustments */
[data-oe-theme="dark"] .oe-editor .oe-callout-info,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-info {
  --oe-callout-bg: rgba(59,130,246,0.12);
}
[data-oe-theme="dark"] .oe-editor .oe-callout-success,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-success {
  --oe-callout-bg: rgba(34,197,94,0.12);
}
[data-oe-theme="dark"] .oe-editor .oe-callout-warning,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-warning {
  --oe-callout-bg: rgba(245,158,11,0.12);
}
[data-oe-theme="dark"] .oe-editor .oe-callout-danger,
.oe-container[data-oe-theme="dark"] .oe-editor .oe-callout-danger {
  --oe-callout-bg: rgba(239,68,68,0.12);
}
@media (prefers-color-scheme: dark) {
  [data-oe-theme="auto"] .oe-editor .oe-callout-info { --oe-callout-bg: rgba(59,130,246,0.12); }
  [data-oe-theme="auto"] .oe-editor .oe-callout-success { --oe-callout-bg: rgba(34,197,94,0.12); }
  [data-oe-theme="auto"] .oe-editor .oe-callout-warning { --oe-callout-bg: rgba(245,158,11,0.12); }
  [data-oe-theme="auto"] .oe-editor .oe-callout-danger { --oe-callout-bg: rgba(239,68,68,0.12); }
}

/* ── Template Tags (K13) ────────────────────────────────────────────── */
.oe-template-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 6px;
  padding: 0 6px;
  font-size: 0.8em;
  font-family: var(--oe-font-mono);
  font-weight: 500;
  cursor: default;
  user-select: none;
  white-space: nowrap;
  vertical-align: baseline;
  line-height: 1.6;
}
[data-oe-theme="dark"] .oe-template-tag {
  background: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
  border-color: rgba(129, 140, 248, 0.3);
}

/* ── HTML Source View ───────────────────────────────────────────────── */
.oe-html-source {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.oe-html-textarea {
  flex: 1;
  min-height: 300px;
  padding: 28px 32px;
  background: var(--oe-bg-html);
  color: #a5f3fc;
  font-family: var(--oe-font-mono);
  font-size: 13px;
  line-height: 1.7;
  border: none;
  outline: none;
  resize: none;
  tab-size: 2;
  box-sizing: border-box;
}

/* ── Status bar ─────────────────────────────────────────────────────── */
.oe-statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--oe-bg-statusbar);
  border-top: 1px solid var(--oe-border);
  border-radius: 0 0 var(--oe-radius) var(--oe-radius);
  font-size: 12px;
  color: var(--oe-text-muted);
  min-height: 38px;
  box-sizing: border-box;
}

.oe-statusbar-path {
  font-family: var(--oe-font-mono);
  font-size: 11px;
  color: var(--oe-text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 40%;
}

.oe-statusbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.oe-word-count,
.oe-char-count {
  white-space: nowrap;
}

.oe-statusbar-divider {
  width: 1px;
  height: 14px;
  background: var(--oe-border);
}

.oe-html-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  background: none;
  border: none;
  color: var(--oe-text-muted);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--oe-font);
  font-weight: 500;
  transition: color 0.1s;
}

.oe-html-toggle:hover {
  color: var(--oe-text);
  text-decoration: underline;
}

.oe-html-toggle.oe-active {
  color: var(--oe-text);
}

/* ── Bubble toolbar ─────────────────────────────────────────────────── */
.oe-bubble-toolbar {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--oe-text);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  z-index: 9999;
  white-space: nowrap;
}

.oe-bubble-toolbar.oe-bubble-visible {
  opacity: 1;
  pointer-events: all;
}

.oe-bubble-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--oe-btn-active-fg);
  cursor: pointer;
  transition: background 0.1s;
}

.oe-bubble-btn:hover {
  background: rgba(255,255,255,0.15);
}

.oe-bubble-btn.oe-active {
  background: rgba(255,255,255,0.25);
}
`}var Re=class{editorEl;syncCallback;overlay=null;selectedImg=null;scrollParents=[];boundUpdatePos=null;constructor(e,t){this.editorEl=e,this.syncCallback=t,e.addEventListener(`click`,this.onEditorClick),document.addEventListener(`mousedown`,this.onDocMousedown,!0)}destroy(){this.editorEl.removeEventListener(`click`,this.onEditorClick),document.removeEventListener(`mousedown`,this.onDocMousedown,!0),this.hideOverlay()}onEditorClick=e=>{e.target instanceof HTMLImageElement&&(e.stopPropagation(),this.selectImage(e.target))};onDocMousedown=e=>{if(!this.overlay)return;let t=e.target;this.overlay.contains(t)||t===this.selectedImg||this.hideOverlay()};selectImage(e){this.hideOverlay(),this.selectedImg=e;let t=document.createElement(`div`);t.className=`oe-img-overlay`,Object.assign(t.style,{position:`fixed`,border:`2px solid #3b82f6`,borderRadius:`3px`,zIndex:`9900`,pointerEvents:`none`,boxSizing:`border-box`});for(let n of[`nw`,`ne`,`sw`,`se`]){let r=document.createElement(`div`);r.className=`oe-img-handle oe-img-handle-${n}`,Object.assign(r.style,{position:`absolute`,width:`10px`,height:`10px`,background:`#ffffff`,border:`2px solid #3b82f6`,borderRadius:`2px`,boxSizing:`border-box`,pointerEvents:`all`,cursor:`${n}-resize`,...ze(n)}),r.addEventListener(`mousedown`,t=>{t.preventDefault(),t.stopPropagation(),this.startResize(t,e,n)}),t.appendChild(r)}let n=document.createElement(`div`);n.className=`oe-img-label`,Object.assign(n.style,{position:`absolute`,bottom:`-26px`,right:`0`,background:`rgba(28,25,23,0.85)`,color:`#fff`,fontSize:`11px`,fontFamily:`monospace`,padding:`2px 6px`,borderRadius:`4px`,whiteSpace:`nowrap`,pointerEvents:`none`}),t.appendChild(n),document.body.appendChild(t),this.overlay=t;let r=()=>{if(!e.isConnected){this.hideOverlay();return}let r=e.getBoundingClientRect();Object.assign(t.style,{top:`${r.top}px`,left:`${r.left}px`,width:`${r.width}px`,height:`${r.height}px`}),n.textContent=`${Math.round(r.width)} × ${Math.round(r.height)}`};r(),this.boundUpdatePos=r,window.addEventListener(`scroll`,r,{passive:!0,capture:!0}),window.addEventListener(`resize`,r,{passive:!0})}hideOverlay(){this.overlay&&=(this.overlay.remove(),null),this.boundUpdatePos&&=(window.removeEventListener(`scroll`,this.boundUpdatePos,!0),window.removeEventListener(`resize`,this.boundUpdatePos),null),this.selectedImg=null}startResize(e,t,n){let r=e.clientX,i=e.clientY,a=t.getBoundingClientRect().width,o=a/(t.getBoundingClientRect().height||1),s=document.body.style.userSelect;document.body.style.userSelect=`none`;let c=e=>{let s=e.clientX-r,c=e.clientY-i,l=n===`ne`||n===`se`,u=n===`sw`||n===`se`,d=l?s:-s,f=u?c:-c,p=Math.abs(d)>=Math.abs(f)?d:f*o,m=Math.max(40,Math.round(a+p)),h=Math.max(20,Math.round(m/o));t.style.width=`${m}px`,t.style.height=`auto`,t.setAttribute(`width`,String(m)),t.setAttribute(`height`,String(h)),this.boundUpdatePos?.()},l=()=>{document.removeEventListener(`mousemove`,c),document.removeEventListener(`mouseup`,l),document.body.style.userSelect=s,this.syncCallback()};document.addEventListener(`mousemove`,c),document.addEventListener(`mouseup`,l)}};function ze(e){let t=`-6px`;switch(e){case`nw`:return{top:t,left:t};case`ne`:return{top:t,right:t};case`sw`:return{bottom:t,left:t};case`se`:return{bottom:t,right:t}}}var Be=`plain.bash.c.cpp.csharp.css.dockerfile.go.graphql.html.java.javascript.json.kotlin.markdown.php.python.ruby.rust.scss.shell.sql.swift.typescript.xml.yaml`.split(`.`),Ve=class{editorEl;editor;pickerEl=null;activeIndex=0;filtered=[];targetPreEl=null;onOutside=null;onOutsideTimer=null;onScroll=null;constructor(e,t){this.editorEl=e,this.editor=t,this.editorEl.addEventListener(`mousedown`,this.onBadgeMousedown,!0),this.editorEl.addEventListener(`click`,this.onBadgeClick,!0)}onBadgeMousedown=e=>{e.target.classList.contains(`oe-code-lang-badge`)&&(e.preventDefault(),e.stopPropagation())};onBadgeClick=e=>{let t=e.target;if(!t.classList.contains(`oe-code-lang-badge`))return;e.preventDefault(),e.stopPropagation();let n=t.closest(`pre`);if(n){if(this.pickerEl&&this.targetPreEl===n){this.closePicker();return}this.closePicker(),this.targetPreEl=n,this.openPicker(t,n)}};openPicker(e,t){let n=document.createElement(`div`);n.className=`oe-code-lang-picker`,this.pickerEl=n;let r=document.createElement(`input`);r.type=`text`,r.className=`oe-code-lang-picker-input`,r.placeholder=`Filter…`,n.appendChild(r);let i=document.createElement(`div`);i.className=`oe-code-lang-picker-list`,n.appendChild(i),document.body.appendChild(n),this.renderList(i,``);let a=e.getBoundingClientRect();n.style.top=`${a.bottom+4}px`,n.style.left=`${a.left}px`,requestAnimationFrame(()=>{if(!n.isConnected)return;let e=window.innerWidth;a.left+n.offsetWidth>e-8&&(n.style.left=`${e-n.offsetWidth-8}px`),r.focus()}),r.addEventListener(`keydown`,e=>{if(e.key===`ArrowDown`)e.preventDefault(),this.activeIndex=Math.min(this.activeIndex+1,this.filtered.length-1),this.updateActive(i);else if(e.key===`ArrowUp`)e.preventDefault(),this.activeIndex=Math.max(this.activeIndex-1,0),this.updateActive(i);else if(e.key===`Enter`){e.preventDefault();let n=this.filtered[this.activeIndex];n!==void 0&&this.selectLang(n,t)}else e.key===`Escape`&&this.closePicker()}),r.addEventListener(`input`,()=>{this.activeIndex=0,this.renderList(i,r.value.trim().toLowerCase())}),this.onOutside=e=>{n.contains(e.target)||this.closePicker()},this.onOutsideTimer=setTimeout(()=>{this.onOutsideTimer=null,this.onOutside&&document.addEventListener(`mousedown`,this.onOutside,!0)},0),this.onScroll=()=>{this.closePicker()},window.addEventListener(`scroll`,this.onScroll,{passive:!0,capture:!0})}renderList(e,t){this.filtered=t?Be.filter(e=>e.includes(t)):Be,e.innerHTML=``,this.filtered.forEach((t,n)=>{let r=document.createElement(`div`);r.className=`oe-code-lang-picker-item`+(n===this.activeIndex?` oe-active`:``),r.textContent=t,r.addEventListener(`mousedown`,e=>{e.preventDefault(),this.selectLang(t,this.targetPreEl)}),e.appendChild(r)})}updateActive(e){e.querySelectorAll(`.oe-code-lang-picker-item`).forEach((e,t)=>{e.classList.toggle(`oe-active`,t===this.activeIndex),t===this.activeIndex&&e.scrollIntoView({block:`nearest`})})}selectLang(e,t){this.closePicker();let n=t.querySelector(`code`);if(n){let e=window.getSelection();if(e){let t=document.createRange();t.setStart(n,0),t.collapse(!0),e.removeAllRanges(),e.addRange(t)}}let r=e===`plain`?void 0:e;this.editor.chain().setBlock(`code_block`,{lang:r}).run()}closePicker(){this.onOutsideTimer!==null&&(clearTimeout(this.onOutsideTimer),this.onOutsideTimer=null),this.onOutside&&=(document.removeEventListener(`mousedown`,this.onOutside,!0),null),this.onScroll&&=(window.removeEventListener(`scroll`,this.onScroll,!0),null),this.pickerEl?.remove(),this.pickerEl=null,this.targetPreEl=null,this.activeIndex=0,this.filtered=[]}destroy(){this.closePicker(),this.editorEl.removeEventListener(`mousedown`,this.onBadgeMousedown,!0),this.editorEl.removeEventListener(`click`,this.onBadgeClick,!0)}},q={toolbar:{undo:`Rückgängig (Ctrl+Z)`,redo:`Wiederholen (Ctrl+Y)`,textFormat:`Textformat`,paragraph:`Absatz`,heading:e=>`Überschrift ${e}`,quote:`Zitat`,codeBlock:`Code-Block`,bold:`Fett (Ctrl+B)`,italic:`Kursiv (Ctrl+I)`,underline:`Unterstrichen (Ctrl+U)`,inlineCode:"Inline-Code (Ctrl+`)",alignLeft:`Linksbündig`,alignCenter:`Zentriert`,alignRight:`Rechtsbündig`,justify:`Blocksatz`,bulletList:`Aufzählungsliste`,orderedList:`Nummerierte Liste`,insertLink:`Link einfügen`,insertImage:`Bild einfügen`,blockquote:`Zitat`,horizontalRule:`Trennlinie`,htmlSource:`HTML-Quellcode anzeigen`,calloutInfo:`Hinweis: Info`,calloutSuccess:`Hinweis: Erfolg`,calloutWarning:`Hinweis: Warnung`,calloutDanger:`Hinweis: Gefahr`,insertCallout:`Hinweisbox einfügen`},statusBar:{words:`Wörter`,characters:`Zeichen`,htmlSource:`HTML`},dialogs:{linkUrl:`Link-URL:`,openInNewTab:`In neuem Tab öffnen?`,imageUrl:`Bild-URL:`,imageAlt:`Alternativtext (optional):`},plugins:{ai:{panelTitle:`KI-Assistent`,noSelection:`(Kein Text ausgewählt — gesamtes Dokument wird verwendet)`,customPromptPlaceholder:`Eigene Anweisung eingeben…`,runButton:`Ausführen`,applyButton:`Übernehmen`,generating:`⏳ Wird generiert…`,noApiKey:`⚠️ Kein API-Key konfiguriert. Übergib apiKey oder endpoint beim Erstellen des Plugins.`,errorPrefix:`❌ Fehler: `,actions:{improve:`Verbessern`,shorten:`Kürzen`,expand:`Erweitern`,summarize:`Zusammenfassen`,toGerman:`🇩🇪 Auf Deutsch`,toEnglish:`🇬🇧 To English`}},emoji:{buttonTitle:`Emoji einfügen`,categories:{faces:`Gesichter`,hearts:`Herzen`,gestures:`Gesten`,nature:`Natur`,food:`Essen`,objects:`Objekte`,symbols:`Symbole`}}}},He={de:q};function Ue(){return He[(typeof navigator<`u`?navigator.language:``).split(`-`)[0].toLowerCase()]??W}function We(e){return{toolbar:{...W.toolbar,...e.toolbar},statusBar:{...W.statusBar,...e.statusBar},dialogs:{...W.dialogs,...e.dialogs},plugins:{ai:{...W.plugins.ai,actions:{...W.plugins.ai.actions,...e.plugins?.ai?.actions},...e.plugins?.ai},emoji:{...W.plugins.emoji,categories:{...W.plugins.emoji.categories,...e.plugins?.emoji?.categories},...e.plugins?.emoji}}}}var Ge=class{doc;history;root;editorEl;containerEl;toolbar=null;bubbleToolbar=null;imageResizer=null;codeLangPicker=null;plugins=[];options;locale;listeners={change:new Set,selectionchange:new Set,focus:new Set,blur:new Set};isComposing=!1;_isFocused=!1;isUpdating=!1;syncTimer=null;constructor(e){this.options=e,this.locale=e.locale?We(e.locale):Ue(),this.history=new n;let t=typeof e.element==`string`?document.querySelector(e.element):e.element;if(!t)throw Error(`[OpenEdit] Element not found: ${e.element}`);this.root=t,this.doc=e.content?g(e.content):m(),this.containerEl=this.buildContainer(),this.editorEl=this.buildEditorEl(),this.root.appendChild(this.containerEl),Ie(e.theme??`auto`),N(this.doc,this.editorEl),this.toolbar=new Ne(this.containerEl.querySelector(`.oe-toolbar`),this,e.toolbar,e.toolbarItems,this.locale);let r=document.createElement(`div`);r.className=`oe-bubble-toolbar`,document.body.appendChild(r),this.bubbleToolbar=new Pe(r,this,this.locale),this.imageResizer=new Re(this.editorEl,()=>this.scheduleSyncFromDOM()),this.codeLangPicker=new Ve(this.editorEl,this),this.updatePlaceholder(),this.attachEvents(),this.applyTheme(e.theme??`auto`)}buildContainer(){let e=document.createElement(`div`);e.className=`oe-container`,e.innerHTML=`
      <div class="oe-toolbar"></div>
      <div class="oe-content-wrap">
        <div class="oe-editor" contenteditable="true" spellcheck="true"></div>
        <div class="oe-html-source" style="display:none">
          <textarea class="oe-html-textarea" spellcheck="false"></textarea>
        </div>
      </div>
      <div class="oe-statusbar">
        <div class="oe-statusbar-path"></div>
        <div class="oe-statusbar-right">
          <span class="oe-word-count">${this.locale.statusBar.words}: 0</span>
          <span class="oe-char-count">${this.locale.statusBar.characters}: 0</span>
          <div class="oe-statusbar-divider"></div>
          <button type="button" class="oe-html-toggle" title="${this.locale.toolbar.htmlSource}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9l-3 3 3 3"/><path d="M14 15l3-3-3-3"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>
            ${this.locale.statusBar.htmlSource}
          </button>
        </div>
      </div>
    `;let t=this.options.statusBar;return t===!1?e.querySelector(`.oe-statusbar`)?.remove():t!==void 0&&typeof t==`object`&&(t.wordCount===!1&&e.querySelector(`.oe-word-count`)?.remove(),t.charCount===!1&&e.querySelector(`.oe-char-count`)?.remove(),t.elementPath===!1&&e.querySelector(`.oe-statusbar-path`)?.remove(),t.htmlToggle===!1&&(e.querySelector(`.oe-html-toggle`)?.remove(),e.querySelector(`.oe-statusbar-divider`)?.remove())),e}buildEditorEl(){let e=this.containerEl.querySelector(`.oe-editor`);return this.options.placeholder&&(e.dataset.placeholder=this.options.placeholder),this.options.readOnly&&(e.contentEditable=`false`),e}attachEvents(){let e=this.editorEl;e.addEventListener(`input`,this.onInput),e.addEventListener(`compositionstart`,this.onCompositionStart),e.addEventListener(`compositionend`,this.onCompositionEnd),document.addEventListener(`selectionchange`,this.onSelectionChange),e.addEventListener(`focus`,this.onFocus),e.addEventListener(`blur`,this.onBlur),e.addEventListener(`keydown`,this.onKeydown),e.addEventListener(`keydown`,this.onTabInCodeBlock),this.containerEl.querySelector(`.oe-html-toggle`).addEventListener(`click`,this.onHTMLToggleClick),e.addEventListener(`paste`,this.onPaste),e.addEventListener(`drop`,this.onDrop)}onInput=()=>{this.isComposing||this.isUpdating||this.scheduleSyncFromDOM()};onCompositionStart=()=>{this.isComposing=!0};onCompositionEnd=()=>{this.isComposing=!1,this.scheduleSyncFromDOM()};onHTMLToggleClick=()=>{this.toggleHTMLMode()};scheduleSyncFromDOM(){this.syncTimer&&clearTimeout(this.syncTimer),this.syncTimer=setTimeout(()=>{this.history.push(this.doc),this.doc=I(this.editorEl),this.updatePlaceholder(),this.updateStatusBar(),this.emit(`change`,this.doc),this.options.onChange?.(this.getHTML())},0)}syncModelFromDOM(){this.syncTimer&&clearTimeout(this.syncTimer),this.syncTimer=setTimeout(()=>{this.doc=I(this.editorEl),this.updatePlaceholder(),this.updateStatusBar()},0)}onSelectionChange=()=>{if(!this.editorEl.contains(document.activeElement)&&document.activeElement!==this.editorEl)return;this.toolbar?.updateActiveState(),this.bubbleToolbar?.onSelectionChange(),this.updateElementPath();let e=B(this.editorEl,this.doc);this.emit(`selectionchange`,e)};onFocus=()=>{this._isFocused=!0,this.containerEl.classList.add(`oe-focused`),this.emit(`focus`,void 0)};onBlur=()=>{this._isFocused=!1,this.containerEl.classList.remove(`oe-focused`),this.emit(`blur`,void 0)};onKeydown=e=>{let t=e.ctrlKey||e.metaKey;if(t&&e.key===`z`){e.preventDefault(),this.chain().undo().run();return}if(t&&(e.key===`y`||e.key===`Z`)){e.preventDefault(),this.chain().redo().run();return}if(t&&e.key===`b`){e.preventDefault(),this.chain().toggleMark(`bold`).run();return}if(t&&e.key===`i`){e.preventDefault(),this.chain().toggleMark(`italic`).run();return}if(t&&e.key===`u`){e.preventDefault(),this.chain().toggleMark(`underline`).run();return}if(t&&e.key==="`"){e.preventDefault(),this.chain().toggleMark(`code`).run();return}for(let t of this.plugins)if(t.keymaps){for(let[n,r]of Object.entries(t.keymaps))if(Ye(n,e)){e.preventDefault(),r(this);return}}};onTabInCodeBlock=e=>{if(e.key!==`Tab`)return;let t=window.getSelection();if(!t||t.rangeCount===0)return;let n=t.anchorNode;for(;n&&n!==this.editorEl;){if(n.nodeType===Node.ELEMENT_NODE&&n.tagName===`PRE`){e.preventDefault(),L(`insertText`,e.shiftKey?``:`  `);return}n=n.parentNode}};onPaste=e=>{e.preventDefault();let t=e.clipboardData?.getData(`text/html`),n=e.clipboardData?.getData(`text/plain`)??``;if(this.history.push(this.doc),t&&t.trim())L(`insertHTML`,w(g(t)));else if(n){let e=n.trim();if(Ke(e)){let t=window.getSelection(),n=t&&!t.isCollapsed?t.toString():``;n?L(`insertHTML`,`<a href="${Je(e)}" target="_blank" rel="noopener noreferrer">${n}</a>`):L(`insertHTML`,`<a href="${Je(e)}" target="_blank" rel="noopener noreferrer">${e}</a>`)}else qe(n)?L(`insertHTML`,w(A(n))):L(`insertText`,n)}this.scheduleSyncFromDOM()};onDrop=e=>{let t=e.dataTransfer?.files;if(!t||t.length===0)return;let n=Array.from(t).find(e=>e.type.startsWith(`image/`));n&&this.options.onImageUpload&&(e.preventDefault(),this.options.onImageUpload(n).then(e=>{let t=H(this.editorEl);this.history.push(this.doc),this.doc=R(this.doc,t,e,n.name),this.rerender()}).catch(()=>{}))};isHTMLMode=!1;toggleHTMLMode(){this.containerEl.querySelector(`.oe-content-wrap`);let e=this.editorEl,t=this.containerEl.querySelector(`.oe-html-source`),n=this.containerEl.querySelector(`.oe-html-textarea`),r=this.containerEl.querySelector(`.oe-html-toggle`);if(!this.isHTMLMode)n.value=this.getHTML(),e.style.display=`none`,t.style.display=``,this.isHTMLMode=!0,r.classList.add(`oe-active`),this.toolbar?.setDisabled(!0);else{let i=n.value;this.history.push(this.doc),this.doc=g(i),e.style.display=``,t.style.display=`none`,this.isHTMLMode=!1,r.classList.remove(`oe-active`),this.toolbar?.setDisabled(!1),this.rerender()}}chain(){let e=[],t=!1,n=this,r={toggleMark(t,i){return e.push(()=>{n.editorEl.focus();let e={bold:`bold`,italic:`italic`,underline:`underline`,strikethrough:`strikethrough`};if(t===`code`)if(U(n.editorEl).has(`code`)){let e=window.getSelection();if(e&&e.rangeCount>0){let t=e.getRangeAt(0).startContainer.parentElement.closest(`code`);if(t){let e=t.textContent??``;t.replaceWith(document.createTextNode(e))}}}else{let e=window.getSelection();if(e&&!e.isCollapsed){let t=e.getRangeAt(0),n=document.createElement(`code`);t.surroundContents(n)}}else if(t===`link`){if(i?.href){let e=i.target??`_self`;Ce(i.href,e)}}else{let n=e[t];n&&L(n)}}),r},setBlock(i,a){return t=!0,e.push(()=>{n.doc=I(n.editorEl);let e=H(n.editorEl);n.history.push(n.doc),n.doc=ve(n.doc,e,i,a)}),r},setAlign(i){return t=!0,e.push(()=>{n.doc=I(n.editorEl);let e=H(n.editorEl);n.history.push(n.doc),n.doc=be(n.doc,e,i)}),r},insertImage(i,a){return t=!0,e.push(()=>{n.doc=I(n.editorEl);let e=H(n.editorEl);n.history.push(n.doc),n.doc=R(n.doc,e,i,a)}),r},insertHr(){return t=!0,e.push(()=>{n.doc=I(n.editorEl);let e=H(n.editorEl);n.history.push(n.doc),n.doc=xe(n.doc,e)}),r},toggleList(i){return t=!0,e.push(()=>{n.doc=I(n.editorEl);let e=H(n.editorEl);n.history.push(n.doc),n.doc=ye(n.doc,e,i)}),r},undo(){return t=!0,e.push(()=>{let e=n.history.undo(n.doc);e&&(n.doc=e)}),r},redo(){return t=!0,e.push(()=>{let e=n.history.redo(n.doc);e&&(n.doc=e)}),r},run(){n.isUpdating=!0;for(let t of e)t();n.isUpdating=!1,t?n.rerender():n.syncModelFromDOM(),n.toolbar?.updateActiveState(),n.emit(`change`,n.doc),n.options.onChange?.(n.getHTML())}};return r}rerender(){B(this.editorEl,this.doc),N(this.doc,this.editorEl),this.updatePlaceholder(),this.updateStatusBar(),this.editorEl.focus()}updateStatusBar(){let e=this.editorEl.innerText??``,t=e.trim().split(/\s+/).filter(e=>e.length>0),n=this.containerEl.querySelector(`.oe-word-count`),r=this.containerEl.querySelector(`.oe-char-count`);n&&(n.textContent=`${this.locale.statusBar.words}: ${t.length}`),r&&(r.textContent=`${this.locale.statusBar.characters}: ${e.length}`)}updateElementPath(){let e=this.containerEl.querySelector(`.oe-statusbar-path`);if(!e)return;let t=window.getSelection();if(!t||t.rangeCount===0)return;let n=[],r=t.anchorNode;for(;r&&r!==this.editorEl;)r.nodeType===Node.ELEMENT_NODE&&n.unshift(r.tagName.toLowerCase()),r=r.parentNode;e.textContent=n.join(` › `)}updatePlaceholder(){if(!this.options.placeholder)return;let e=this.editorEl.innerText.trim()===``&&this.editorEl.querySelectorAll(`img, hr`).length===0;this.editorEl.classList.toggle(`oe-empty`,e)}getHTML(){return w(this.doc)}setHTML(e){this.history.push(this.doc),this.doc=g(e),this.rerender()}getMarkdown(){return O(this.doc)}setMarkdown(e){this.history.push(this.doc),this.doc=A(e),this.rerender()}getDocument(){return this.doc}use(e){return this.plugins.push(e),e.onInit?.(this),this}on(e,t){this.listeners[e].add(t)}off(e,t){this.listeners[e].delete(t)}emit(e,t){this.listeners[e].forEach(e=>e(t))}destroy(){this.syncTimer&&clearTimeout(this.syncTimer),document.removeEventListener(`selectionchange`,this.onSelectionChange),this.editorEl.removeEventListener(`input`,this.onInput),this.editorEl.removeEventListener(`compositionstart`,this.onCompositionStart),this.editorEl.removeEventListener(`compositionend`,this.onCompositionEnd),this.editorEl.removeEventListener(`focus`,this.onFocus),this.editorEl.removeEventListener(`blur`,this.onBlur),this.editorEl.removeEventListener(`keydown`,this.onKeydown),this.editorEl.removeEventListener(`keydown`,this.onTabInCodeBlock),this.editorEl.removeEventListener(`paste`,this.onPaste),this.editorEl.removeEventListener(`drop`,this.onDrop),this.containerEl.querySelector(`.oe-html-toggle`)?.removeEventListener(`click`,this.onHTMLToggleClick),this.bubbleToolbar?.destroy(),this.imageResizer?.destroy(),this.codeLangPicker?.destroy(),this.plugins.forEach(e=>e.onDestroy?.(this)),this.root.innerHTML=``}focus(){this.editorEl.focus()}blur(){this.editorEl.blur()}isFocused(){return this._isFocused}getSelection(){return B(this.editorEl,this.doc)}isMarkActive(e){return U(this.editorEl).has(e)}getActiveBlockType(){return Se(this.editorEl)}isEmpty(){return this.editorEl.innerText.trim()===``&&this.editorEl.querySelectorAll(`img, hr`).length===0}applyTheme(e){this.containerEl.dataset.oeTheme=e}};function Ke(e){return/^https?:\/\/[^\s]{4,}$/.test(e)}function qe(e){return/^#{1,6} /m.test(e)||/\*\*[^*]+\*\*/.test(e)||/^```/m.test(e)||/^[-*+] /m.test(e)||/^\d+\. /m.test(e)||/^> /m.test(e)||/~~[^~]+~~/.test(e)}function Je(e){return e.replace(/&/g,`&amp;`).replace(/"/g,`&quot;`).replace(/</g,`&lt;`)}function Ye(e,t){let n=e.toLowerCase().split(`+`),r=n[n.length-1],i=n.includes(`ctrl`)||n.includes(`meta`),a=n.includes(`shift`),o=n.includes(`alt`);return t.key.toLowerCase()===r&&(t.ctrlKey||t.metaKey)===i&&t.shiftKey===a&&t.altKey===o}var J=null;function Xe(){return J||(J=new Promise((e,t)=>{if(window.hljs){e(window.hljs);return}let n=document.createElement(`script`);n.src=`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js`,n.crossOrigin=`anonymous`,n.onload=()=>e(window.hljs),n.onerror=t,document.head.appendChild(n)}),J)}var Ze=`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/`,Qe=`${Ze}atom-one-dark.min.css`,$e=`${Ze}atom-one-light.min.css`;function et(e,t){let n=`oe-hljs-theme`,r=document.getElementById(n),i;if(i=typeof t==`string`?t:typeof t==`object`?e?t.dark:t.light:e?Qe:$e,r){r.href=i;return}let a=document.createElement(`link`);a.id=n,a.rel=`stylesheet`,a.href=i,a.crossOrigin=`anonymous`,document.head.appendChild(a)}function tt(e={}){let t,n=null;function r(e){if(!t)return;let n=e.querySelectorAll(`pre code`),r=document.getSelection()?.anchorNode??null;n.forEach(e=>{let n=e.closest(`pre`);n&&r&&n.contains(r)||(delete e.dataset.highlighted,e.removeAttribute(`data-highlighted`),t.highlightElement(e))})}function i(e){n&&clearTimeout(n),n=setTimeout(()=>r(e),400)}return{name:`highlight`,onInit(n){let a=n.editorEl,o=n.containerEl;et(e.theme===`dark`||!e.theme&&o?.dataset.oeTheme===`dark`,e.themeUrl),Xe().then(e=>{t=e,t?.configure({ignoreUnescapedHTML:!0}),r(a),n.on(`change`,()=>i(a))}).catch(()=>{console.warn(`[OpenEdit] highlight.js failed to load from CDN`)})},onDestroy(){n&&clearTimeout(n)}}}var nt={faces:`😀.😄.😅.😂.🤣.😊.😇.🙂.🙃.😉.😍.🥰.😘.😎.🤓.🤩.🥳.😏.😔.😢.😭.😤.😠.🥺.🤔.🤗.😴.🤯.🥸.😶`.split(`.`),hearts:[`❤️`,`🧡`,`💛`,`💚`,`💙`,`💜`,`🖤`,`🤍`,`🤎`,`💕`,`💞`,`💓`,`💗`,`💖`,`💝`,`💘`,`❣️`,`💔`,`❤️‍🔥`,`💟`],gestures:[`👋`,`🤚`,`🖐`,`✋`,`🖖`,`👌`,`🤌`,`✌️`,`🤞`,`🤟`,`🤘`,`👈`,`👉`,`👆`,`👇`,`☝️`,`👍`,`👎`,`✊`,`👏`,`🙌`,`🫶`,`🤝`,`🙏`],nature:`🌸.🌺.🌻.🌹.🌷.🍀.🌿.🌱.🌲.🌳.🌴.🍁.🍂.🍃.🌊.🌈.☀️.🌙.⭐.🌟.💫.⚡.🔥.💧.🌍.🦋.🐾`.split(`.`),food:[`🍎`,`🍊`,`🍋`,`🍇`,`🍓`,`🍒`,`🍑`,`🥝`,`🍕`,`🍔`,`🌮`,`🌯`,`🍜`,`🍣`,`🍰`,`🎂`,`☕`,`🍵`,`🧃`,`🥤`,`🍺`,`🥂`,`🍾`],objects:[`💡`,`🔑`,`🎵`,`🎮`,`📱`,`💻`,`📷`,`🎯`,`🏆`,`💎`,`🔮`,`📚`,`✏️`,`📝`,`📌`,`🔔`,`💬`,`📧`,`🚀`,`🎁`,`🧩`,`⚙️`,`🔧`,`🎨`],symbols:[`✅`,`❌`,`⚠️`,`ℹ️`,`💯`,`🔴`,`🟡`,`🟢`,`🔵`,`⚫`,`⚪`,`🔶`,`🔷`,`🔸`,`🔹`,`▶️`,`◀️`,`🔝`,`🔛`,`🆕`,`🆒`,`🆓`,`🆙`,`🏳️`,`🏴`]};function rt(e){let t=e.plugins.emoji.categories;return Object.keys(nt).map(e=>({label:t[e],emojis:nt[e]}))}var it=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`;function at(){let e=null,t=null,n=null,r=null,i=W,a=null;function o(){e&&=(e.remove(),null),document.removeEventListener(`click`,s,!0),a?.(),a=null}function s(n){let r=n.target;e&&!e.contains(r)&&!t?.contains(r)&&o()}function c(e){let t=window.getSelection();r&&t?(t.removeAllRanges(),t.addRange(r)):n&&n.focus(),document.execCommand(`insertText`,!1,e),o(),n?.focus()}function l(t){o(),e=document.createElement(`div`),e.className=`oe-emoji-popup`,Object.assign(e.style,{position:`fixed`,zIndex:`99999`,background:`var(--oe-bg, #ffffff)`,border:`1px solid var(--oe-border, #e7e5e4)`,borderRadius:`12px`,boxShadow:`0 8px 32px rgba(0,0,0,0.14)`,padding:`10px 12px`,width:`300px`,maxHeight:`260px`,overflowY:`auto`,fontFamily:`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`});for(let t of rt(i)){let n=document.createElement(`div`);Object.assign(n.style,{fontSize:`10px`,fontWeight:`600`,color:`var(--oe-muted, #78716c)`,textTransform:`uppercase`,letterSpacing:`0.06em`,margin:`6px 0 4px`}),n.textContent=t.label,e.appendChild(n);let r=document.createElement(`div`);Object.assign(r.style,{display:`flex`,flexWrap:`wrap`,gap:`1px`});for(let e of t.emojis){let t=document.createElement(`button`);t.type=`button`,t.textContent=e,t.title=e,Object.assign(t.style,{background:`none`,border:`none`,cursor:`pointer`,padding:`4px`,borderRadius:`6px`,fontSize:`18px`,lineHeight:`1`,transition:`background 0.1s`}),t.addEventListener(`mouseenter`,()=>{t.style.background=`var(--oe-btn-hover-bg, #f5f5f4)`}),t.addEventListener(`mouseleave`,()=>{t.style.background=`none`}),t.addEventListener(`mousedown`,t=>{t.preventDefault(),c(e)}),r.appendChild(t)}e.appendChild(r)}document.body.appendChild(e);let n=t.getBoundingClientRect(),r=n.bottom+4,l=n.left;l+300>window.innerWidth-8&&(l=window.innerWidth-308),l<8&&(l=8),r+260>window.innerHeight-8&&(r=n.top-260-4),e.style.top=`${r}px`,e.style.left=`${l}px`,setTimeout(()=>{document.addEventListener(`click`,s,!0)},0);let u=()=>{o()};window.addEventListener(`scroll`,u,{passive:!0,capture:!0}),a=()=>{window.removeEventListener(`scroll`,u,!0)}}return{name:`emoji`,onInit(a){n=a,i=a.locale??W;let s=a.editorEl,c=a.containerEl?.querySelector(`.oe-toolbar`);if(!c)return;document.addEventListener(`selectionchange`,()=>{let e=window.getSelection();e&&e.rangeCount>0&&s.contains(e.anchorNode)&&(r=e.getRangeAt(0).cloneRange())});let u=document.createElement(`button`);u.type=`button`,u.className=`oe-toolbar-btn`,u.title=i.plugins.emoji.buttonTitle,u.innerHTML=it,t=u,u.addEventListener(`mousedown`,t=>{t.preventDefault();let n=window.getSelection();n&&n.rangeCount>0&&s.contains(n.anchorNode)&&(r=n.getRangeAt(0).cloneRange()),e?o():l(u)}),c.appendChild(u)},onDestroy(){o(),n=null,r=null}}}var Y=/\{\{([^{}]+)\}\}/g;function ot(e){let t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(e){let t=e.parentElement;return!t||t.classList.contains(`oe-template-tag`)||t.tagName===`TEXTAREA`||t.tagName===`SCRIPT`?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),n=[],r;for(;r=t.nextNode();)(r.textContent??``).includes(`{{`)&&n.push(r);for(let e of n){let t=e.textContent??``;if(Y.lastIndex=0,!Y.test(t))continue;Y.lastIndex=0;let n=[],r=0,i;for(;(i=Y.exec(t))!==null;)i.index>r&&n.push({type:`text`,value:t.slice(r,i.index)}),n.push({type:`tag`,value:i[0]}),r=Y.lastIndex;r<t.length&&n.push({type:`text`,value:t.slice(r)});let a=document.createDocumentFragment();for(let e of n)if(e.type===`tag`){let t=document.createElement(`span`);t.className=`oe-template-tag`,t.contentEditable=`false`,t.textContent=e.value,a.appendChild(t)}else e.value&&a.appendChild(document.createTextNode(e.value));e.parentNode?.replaceChild(a,e)}}function st(){let e=null;function t(t){e&&clearTimeout(e),e=setTimeout(()=>ot(t),200)}return{name:`template-tags`,onInit(e){let n=e.editorEl;e.on(`change`,()=>t(n)),setTimeout(()=>ot(n),100)},onDestroy(){e&&clearTimeout(e)}}}var ct=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,X={improve:`Improve the following text stylistically and grammatically. Return only the improved text, no explanations.`,shorten:`Shorten the following text to approximately 50% of its length, keeping all important information. Return only the shortened text.`,expand:`Expand the following text with more details, examples, and context. Return only the expanded text.`,summarize:`Summarize the following text in 2-3 concise sentences. Return only the summary.`,toGerman:`Translate the following text to German. Return only the translation.`,toEnglish:`Translate the following text to English. Return only the translation, no explanations.`};function lt(e){let t=e.plugins.ai.actions;return[{label:t.improve,prompt:X.improve},{label:t.shorten,prompt:X.shorten},{label:t.expand,prompt:X.expand},{label:t.summarize,prompt:X.summarize},{label:t.toGerman,prompt:X.toGerman},{label:t.toEnglish,prompt:X.toEnglish}]}async function ut(e,t){let n=t.endpoint??`https://api.anthropic.com/v1/messages`,r=t.model??`claude-sonnet-4-6`,i={"content-type":`application/json`};t.apiKey&&!t.endpoint&&(i[`x-api-key`]=t.apiKey,i[`anthropic-version`]=`2023-06-01`,i[`anthropic-dangerous-direct-browser-access`]=`true`);let a=JSON.stringify({model:r,max_tokens:t.maxTokens??2048,system:`You are a professional writing assistant. Follow the user's instruction exactly and return only the desired result — no introduction, no explanation, no commentary.`,messages:[{role:`user`,content:e}]}),o=await fetch(n,{method:`POST`,headers:i,body:a});if(!o.ok){let e=await o.text().catch(()=>o.statusText);throw Error(`API error ${o.status}: ${e}`)}let s=(await o.json())?.content?.[0]?.text;if(!s)throw Error(`Unexpected response format`);return s}function Z(e,t){Object.assign(e.style,t)}function dt(e={}){!e.apiKey&&!e.endpoint&&console.warn(`[OpenEdit AI] No apiKey or endpoint provided — plugin inactive.`);let t=null,n=null,r=null,i=null,a=``,o=W;function s(){t&&=(t.remove(),null),document.removeEventListener(`click`,c,!0)}function c(e){let r=e.target;t&&!t.contains(r)&&!n?.contains(r)&&s()}function l(e){let t=window.getSelection();t&&t.rangeCount>0&&e.contains(t.anchorNode)?(i=t.getRangeAt(0).cloneRange(),a=t.toString().trim()):(i=null,a=r?.getHTML()??``)}function u(e){if(!r)return;let t=window.getSelection();if(i&&t&&a){t.removeAllRanges(),t.addRange(i);let n=w(g(e));document.execCommand(`insertHTML`,!1,n)}else r.setHTML(e);r.focus()}function d(e){s(),t=document.createElement(`div`),Z(t,{position:`fixed`,zIndex:`99999`,background:`var(--oe-bg, #fff)`,border:`1px solid var(--oe-border, #e7e5e4)`,borderRadius:`14px`,boxShadow:`0 12px 40px rgba(0,0,0,0.16)`,padding:`16px`,width:`360px`,fontFamily:`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`});let n=o.plugins.ai,i=document.createElement(`div`);Z(i,{display:`flex`,alignItems:`center`,gap:`8px`,marginBottom:`12px`}),i.innerHTML=`${ct}<span style="font-size:13px;font-weight:600;color:var(--oe-text,#1c1917)">${n.panelTitle}</span>`,t.appendChild(i);let l=document.createElement(`div`),d=a||n.noSelection;Z(l,{fontSize:`12px`,color:`var(--oe-text-muted, #78716c)`,background:`var(--oe-btn-hover-bg, #f5f5f4)`,borderRadius:`8px`,padding:`8px 10px`,marginBottom:`12px`,maxHeight:`64px`,overflow:`hidden`,lineHeight:`1.5`}),l.textContent=d.length>140?d.slice(0,140)+`…`:d,t.appendChild(l);let p=document.createElement(`div`);Z(p,{display:`flex`,flexWrap:`wrap`,gap:`6px`,marginBottom:`12px`});for(let e of lt(o)){let t=document.createElement(`button`);t.type=`button`,t.textContent=e.label,Z(t,{padding:`5px 10px`,fontSize:`12px`,fontWeight:`500`,border:`1px solid var(--oe-border, #e7e5e4)`,borderRadius:`6px`,background:`var(--oe-bg, #fff)`,color:`var(--oe-text, #1c1917)`,cursor:`pointer`,fontFamily:`inherit`,transition:`background 0.1s`}),t.addEventListener(`mouseenter`,()=>{t.style.background=`var(--oe-btn-hover-bg, #f5f5f4)`}),t.addEventListener(`mouseleave`,()=>{t.style.background=`var(--oe-bg, #fff)`}),t.addEventListener(`click`,()=>{let t=a||r?.getHTML()||``;f(`${e.prompt}\n\n${t}`,_,v)}),p.appendChild(t)}t.appendChild(p);let m=document.createElement(`div`);Z(m,{display:`flex`,gap:`6px`,marginBottom:`12px`});let h=document.createElement(`textarea`);h.placeholder=n.customPromptPlaceholder,h.rows=2,Z(h,{flex:`1`,padding:`8px 10px`,fontSize:`12px`,border:`1px solid var(--oe-border, #e7e5e4)`,borderRadius:`8px`,background:`var(--oe-bg, #fff)`,color:`var(--oe-text, #1c1917)`,fontFamily:`inherit`,resize:`none`,outline:`none`});let g=document.createElement(`button`);g.type=`button`,g.textContent=n.runButton,Z(g,{padding:`0 14px`,fontSize:`12px`,fontWeight:`600`,border:`none`,borderRadius:`8px`,background:`#1c1917`,color:`#fff`,cursor:`pointer`,fontFamily:`inherit`,alignSelf:`stretch`}),g.addEventListener(`click`,()=>{let e=a||r?.getHTML()||``,t=h.value.trim();t&&f(`${t}\n\n${e}`,_,v)}),m.appendChild(h),m.appendChild(g),t.appendChild(m);let _=document.createElement(`div`);Z(_,{display:`none`,fontSize:`12px`,color:`var(--oe-text, #1c1917)`,background:`var(--oe-btn-hover-bg, #f5f5f4)`,borderRadius:`8px`,padding:`10px`,marginBottom:`10px`,lineHeight:`1.6`,maxHeight:`120px`,overflowY:`auto`}),t.appendChild(_);let v=document.createElement(`button`);v.type=`button`,v.textContent=n.applyButton,v.style.display=`none`,Z(v,{width:`100%`,padding:`9px`,fontSize:`13px`,fontWeight:`600`,border:`none`,borderRadius:`8px`,background:`#1c1917`,color:`#fff`,cursor:`pointer`,fontFamily:`inherit`}),v.addEventListener(`click`,()=>{let e=_.dataset.result??``;e&&(u(e),s())}),t.appendChild(v),document.body.appendChild(t);let y=e.getBoundingClientRect(),b=y.bottom+4,x=y.left;x+360>window.innerWidth-8&&(x=window.innerWidth-368),x<8&&(x=8),b+400>window.innerHeight-8&&(b=y.top-400-4),t.style.top=`${b}px`,t.style.left=`${x}px`,setTimeout(()=>{document.addEventListener(`click`,c,!0)},0)}async function f(t,n,r){let i=o.plugins.ai;if(!e.apiKey&&!e.endpoint){n.style.display=`block`,n.textContent=i.noApiKey;return}n.style.display=`block`,n.textContent=i.generating,r.style.display=`none`;try{let i=await ut(t,e);n.textContent=i.length>400?i.slice(0,400)+`…`:i,n.dataset.result=i,r.style.display=`block`}catch(e){n.textContent=`${i.errorPrefix}${e instanceof Error?e.message:String(e)}`}}return{name:`ai-assistant`,onInit(e){r=e,o=e.locale??W;let c=e.editorEl,u=e.containerEl?.querySelector(`.oe-toolbar`);if(!u)return;document.addEventListener(`selectionchange`,()=>{let e=window.getSelection();e&&e.rangeCount>0&&c.contains(e.anchorNode)&&(i=e.getRangeAt(0).cloneRange(),a=e.isCollapsed?``:e.toString().trim())});let f=document.createElement(`div`);f.className=`oe-toolbar-sep`;let p=document.createElement(`button`);p.type=`button`,p.className=`oe-toolbar-btn`,p.title=o.plugins.ai.panelTitle,p.innerHTML=ct,Z(p,{color:`rgb(99,102,241)`}),n=p,p.addEventListener(`mousedown`,e=>{e.preventDefault(),l(c),t?s():d(p)}),u.appendChild(f),u.appendChild(p),c.addEventListener(`keydown`,e=>{if(e.key===`Enter`&&!e.shiftKey){let t=window.getSelection();if(!t||t.rangeCount===0)return;let n=t.getRangeAt(0),r=n.startContainer.textContent??``;if(r.trim()===`/ai`){e.preventDefault();let t=document.createRange();t.setStart(n.startContainer,0),t.setEnd(n.startContainer,r.length),t.deleteContents(),l(c),d(p)}}})},onDestroy(){s(),r=null}}}var ft={"/callout":`info`,"/callout-info":`info`,"/callout-success":`success`,"/callout-warning":`warning`,"/callout-danger":`danger`};function pt(){let e=null,t=null,n=n=>{if(n.key!==`Enter`||n.shiftKey||!e)return;let r=window.getSelection();if(!r||r.rangeCount===0)return;let i=r.getRangeAt(0);if(!i.collapsed)return;let a=i.startContainer;for(;a&&a.parentNode!==e;)a=a.parentNode;if(!a||a.nodeType!==Node.ELEMENT_NODE)return;let o=ft[(a.textContent?.trim()??``).toLowerCase()];o&&(n.preventDefault(),a.innerHTML=``,t?.chain().setBlock(`callout`,{variant:o}).run())};return{name:`callout`,onInit(r){t=r,e=r.editorEl,e&&e.addEventListener(`keydown`,n)},onDestroy(r){e&&e.removeEventListener(`keydown`,n),e=null,t=null},keymaps:{"ctrl+shift+i":e=>(e.chain().setBlock(`callout`,{variant:`info`}).run(),!0)}}}var mt=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 4v16"/><path d="M17 4H9.5a4.5 4.5 0 0 0 0 9H13"/></svg>`,ht=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,gt=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,_t=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>`,vt=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="9" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">1.</text><text x="2" y="15" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">2.</text><text x="2" y="21" font-size="7" fill="currentColor" stroke="none" font-family="sans-serif" font-weight="700">3.</text></svg>`,yt=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="2" y1="12" x2="22" y2="12"/></svg>`,bt=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,xt=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,St=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,Ct=`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;function Q(e){return`<span style="font-size:11px;font-weight:700;letter-spacing:-0.5px;line-height:1">H${e}</span>`}function wt(){return[{id:`paragraph`,title:`Paragraph`,description:`Plain text block`,icon:mt,keywords:[`paragraph`,`text`,`p`,`normal`],execute:e=>e.chain().setBlock(`paragraph`).run()},{id:`h1`,title:`Heading 1`,description:`Large section title`,icon:Q(1),keywords:[`heading`,`h1`,`heading1`,`title`,`1`],execute:e=>e.chain().setBlock(`heading`,{level:1}).run()},{id:`h2`,title:`Heading 2`,description:`Medium section title`,icon:Q(2),keywords:[`heading`,`h2`,`heading2`,`2`],execute:e=>e.chain().setBlock(`heading`,{level:2}).run()},{id:`h3`,title:`Heading 3`,description:`Small section title`,icon:Q(3),keywords:[`heading`,`h3`,`heading3`,`3`],execute:e=>e.chain().setBlock(`heading`,{level:3}).run()},{id:`h4`,title:`Heading 4`,icon:Q(4),keywords:[`heading`,`h4`,`heading4`,`4`],execute:e=>e.chain().setBlock(`heading`,{level:4}).run()},{id:`h5`,title:`Heading 5`,icon:Q(5),keywords:[`heading`,`h5`,`heading5`,`5`],execute:e=>e.chain().setBlock(`heading`,{level:5}).run()},{id:`h6`,title:`Heading 6`,icon:Q(6),keywords:[`heading`,`h6`,`heading6`,`6`],execute:e=>e.chain().setBlock(`heading`,{level:6}).run()},{id:`quote`,title:`Blockquote`,description:`Indented citation block`,icon:ht,keywords:[`quote`,`blockquote`,`bq`,`citation`],execute:e=>e.chain().setBlock(`blockquote`).run()},{id:`code`,title:`Code Block`,description:`Monospace preformatted code`,icon:gt,keywords:[`code`,`codeblock`,`pre`,`monospace`,`snippet`],execute:e=>e.chain().setBlock(`code_block`).run()},{id:`bullet`,title:`Bullet List`,description:`Unordered list with dots`,icon:_t,keywords:[`ul`,`bullet`,`bulletlist`,`unordered`,`list`,`-`],execute:e=>e.chain().toggleList(`bullet_list`).run()},{id:`numbered`,title:`Numbered List`,description:`Ordered numbered list`,icon:vt,keywords:[`ol`,`numbered`,`orderedlist`,`ordered`,`list`,`1`],execute:e=>e.chain().toggleList(`ordered_list`).run()},{id:`hr`,title:`Divider`,description:`Horizontal rule`,icon:yt,keywords:[`hr`,`divider`,`separator`,`rule`,`---`],execute:e=>e.chain().insertHr().run()},{id:`callout-info`,title:`Callout: Info`,description:`Blue informational callout`,icon:bt,keywords:[`callout`,`info`,`note`,`callout-info`],execute:e=>e.chain().setBlock(`callout`,{variant:`info`}).run()},{id:`callout-success`,title:`Callout: Success`,description:`Green success callout`,icon:xt,keywords:[`callout`,`success`,`done`,`callout-success`],execute:e=>e.chain().setBlock(`callout`,{variant:`success`}).run()},{id:`callout-warning`,title:`Callout: Warning`,description:`Yellow warning callout`,icon:St,keywords:[`callout`,`warning`,`warn`,`caution`,`callout-warning`],execute:e=>e.chain().setBlock(`callout`,{variant:`warning`}).run()},{id:`callout-danger`,title:`Callout: Danger`,description:`Red danger or error callout`,icon:Ct,keywords:[`callout`,`danger`,`error`,`callout-danger`],execute:e=>e.chain().setBlock(`callout`,{variant:`danger`}).run()}]}var Tt=`oe-slash-menu-styles`;function Et(){if(document.getElementById(Tt))return;let e=document.createElement(`style`);e.id=Tt,e.textContent=`
.oe-slash-menu {
  position: fixed;
  z-index: 10000;
  background: var(--oe-bg, #ffffff);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07);
  padding: 5px;
  min-width: 230px;
  max-height: 300px;
  overflow-y: auto;
  font-family: var(--oe-font, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-size: 13px;
  scrollbar-width: thin;
  scrollbar-color: var(--oe-border, #e7e5e4) transparent;
}
.oe-slash-menu-empty {
  padding: 10px 12px;
  color: var(--oe-text-muted, #78716c);
  font-size: 13px;
}
.oe-slash-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 80ms;
}
.oe-slash-menu-item:hover {
  background: var(--oe-btn-hover-bg, #f5f5f4);
}
.oe-slash-menu-item.oe-slash-active {
  background: var(--oe-btn-active-bg, #1c1917);
  color: var(--oe-btn-active-fg, #ffffff);
}
.oe-slash-menu-item.oe-slash-active .oe-slash-menu-desc {
  color: rgba(255,255,255,0.6);
}
.oe-slash-menu-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--oe-btn-hover-bg, #f5f5f4);
  border: 1px solid var(--oe-border, #e7e5e4);
  border-radius: 6px;
  flex-shrink: 0;
  color: var(--oe-text, #1c1917);
}
.oe-slash-menu-item.oe-slash-active .oe-slash-menu-icon {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
  color: #ffffff;
}
.oe-slash-menu-text { flex: 1; min-width: 0; }
.oe-slash-menu-title {
  font-weight: 500;
  color: var(--oe-text, #1c1917);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.oe-slash-menu-item.oe-slash-active .oe-slash-menu-title {
  color: var(--oe-btn-active-fg, #ffffff);
}
.oe-slash-menu-desc {
  font-size: 11px;
  color: var(--oe-text-muted, #78716c);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`,document.head.appendChild(e)}function Dt(e={}){let t=e.commands?e.commands:[...wt(),...e.extraCommands??[]],n=null,r=null,i=null,a=!1,o=0,s=[];function c(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0);if(!t.collapsed)return null;let r=t.startContainer;for(;r&&r.parentNode!==n;)r=r.parentNode;if(!r||r.nodeType!==Node.ELEMENT_NODE)return null;let i=r,a=i.textContent??``;return a.startsWith(`/`)?{blockEl:i,query:a.slice(1).toLowerCase()}:null}function l(e){return e?t.filter(t=>{let n=e.toLowerCase();return t.id.includes(n)||t.title.toLowerCase().includes(n)||t.keywords.some(e=>e.includes(n))}):t}function u(){let e=window.getSelection();if(e&&e.rangeCount>0){let t=e.getRangeAt(0).getBoundingClientRect();if(t.width>0||t.height>0)return{top:t.bottom+6,left:t.left}}if(n){let e=n.getBoundingClientRect();return{top:e.top+40,left:e.left+16}}return{top:100,left:100}}function d(e,t,n){let r=window.innerWidth,i=window.innerHeight,a=e.offsetWidth||240,o=e.offsetHeight||300;return n+a>r-8&&(n=r-a-8),n<8&&(n=8),t+o>i-8&&(t=t-o-28),t<8&&(t=8),{top:t,left:n}}function f(){if(i){if(s.length===0){i.innerHTML=`<div class="oe-slash-menu-empty">No matching blocks</div>`;return}i.innerHTML=s.map((e,t)=>`
          <div class="oe-slash-menu-item${t===o?` oe-slash-active`:``}" data-index="${t}">
            <div class="oe-slash-menu-icon">${e.icon}</div>
            <div class="oe-slash-menu-text">
              <div class="oe-slash-menu-title">${e.title}</div>
              ${e.description?`<div class="oe-slash-menu-desc">${e.description}</div>`:``}
            </div>
          </div>`).join(``),i.querySelector(`.oe-slash-active`)?.scrollIntoView({block:`nearest`})}}function p(){if(!i)return;a=!0,i.style.display=`block`;let{top:e,left:t}=u();i.style.top=`${e}px`,i.style.left=`${t}px`,requestAnimationFrame(()=>{if(!i)return;let n=d(i,e,t);i.style.top=`${n.top}px`,i.style.left=`${n.left}px`}),f()}function m(){i&&(a=!1,i.style.display=`none`,i.innerHTML=``,o=0,s=[])}function h(e){if(!r||!n)return;let t=c(),i=-1;if(t){let e=t.blockEl;i=Array.from(n.children).indexOf(e),e.innerHTML=``;let r=window.getSelection();if(r){let t=document.createRange();t.setStart(e,0),t.collapse(!0),r.removeAllRanges(),r.addRange(t)}}m(),e.execute(r),i>=0&&requestAnimationFrame(()=>{if(!n)return;let e=n.children[i];if(!e)return;let t=g(e),r=window.getSelection();if(!r)return;let a=document.createRange();if(t)a.setStart(t,t.length);else if(e instanceof HTMLElement&&e.tagName===`HR`){let t=n.children[i+1]??e;a.setStart(t,0)}else a.setStart(e,0);a.collapse(!0),r.removeAllRanges(),r.addRange(a)})}function g(e){for(let t=e.childNodes.length-1;t>=0;t--){let n=g(e.childNodes[t]);if(n)return n}return e.nodeType===Node.TEXT_NODE?e:null}let _=()=>{let e=c();if(!e){a&&m();return}let{query:t}=e;s=l(t),o>=s.length&&(o=0),s.length,p()},v=e=>{if(a)switch(e.key){case`ArrowDown`:e.preventDefault(),e.stopImmediatePropagation(),o=(o+1)%Math.max(s.length,1),f();break;case`ArrowUp`:e.preventDefault(),e.stopImmediatePropagation(),o=(o-1+Math.max(s.length,1))%Math.max(s.length,1),f();break;case`Enter`:s.length>0&&s[o]&&(e.preventDefault(),e.stopImmediatePropagation(),h(s[o]));break;case`Escape`:e.preventDefault(),e.stopImmediatePropagation(),m();break;case`Tab`:s.length>0&&s[o]&&(e.preventDefault(),e.stopImmediatePropagation(),h(s[o]));break}},y=e=>{!a||!i||i.contains(e.target)||m()},b=e=>{let t=e.target.closest(`.oe-slash-menu-item`);if(!t)return;let n=parseInt(t.dataset.index??`0`,10),r=s[n];r&&h(r)},x=()=>{a&&m()};return{name:`slash-commands`,onInit(e){r=e,n=e.editorEl,n&&(Et(),i=document.createElement(`div`),i.className=`oe-slash-menu`,i.style.display=`none`,document.body.appendChild(i),n.addEventListener(`keydown`,v,!0),n.addEventListener(`input`,_),i.addEventListener(`click`,b),document.addEventListener(`click`,y,!0),window.addEventListener(`scroll`,x,{passive:!0}))},onDestroy(e){n&&(n.removeEventListener(`keydown`,v,!0),n.removeEventListener(`input`,_)),i&&=(i.removeEventListener(`click`,b),i.remove(),null),document.removeEventListener(`click`,y,!0),window.removeEventListener(`scroll`,x),n=null,r=null,a=!1}}}function Ot(e,t){return new Ge({element:e,...t})}var $={create:Ot,version:`0.1.0`,locales:{en:W,de:q},plugins:{highlight:tt,emoji:at,templateTags:st,ai:dt,callout:pt,slashCommands:Dt},markdown:{serialize:O,deserialize:A}};e.Editor=Ge,e.OpenEdit=$,e.default=$,e.createAIPlugin=dt,e.createCalloutPlugin=pt,e.createEmojiPlugin=at,e.createHighlightPlugin=tt,e.createSlashCommandsPlugin=Dt,e.createTemplateTagPlugin=st,e.de=q,e.deserializeMarkdown=A,e.en=W,e.serializeToMarkdown=O});
//# sourceMappingURL=open-edit.umd.js.map