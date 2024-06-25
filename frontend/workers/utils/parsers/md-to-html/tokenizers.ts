import { marked } from 'marked';

export function rtrim(str: string, c: string, invert?: boolean) {
    const l = str.length;
    if (l === 0) {
        return '';
    }

    // Length of suffix matching the invert condition.
    let suffLen = 0;

    // Step left until we fail to match the invert condition.
    while (suffLen < l) {
        const currChar = str.charAt(l - suffLen - 1);
        if (currChar === c && !invert) {
            suffLen++;
        } else if (currChar !== c && invert) {
            suffLen++;
        } else {
            break;
        }
    }

    return str.slice(0, l - suffLen);
}

export const modifiedTokenizers: any = {
    lheading(_src: string): marked.Tokens.Heading | void {
        // ignore md heading of style
        //
        // text
        // ---
    },
    heading(src: string): marked.Tokens.Heading | false {
        const cap = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n|$)/.exec(src);
        if (cap) {
            let text = cap[2].trim();

            // remove trailing #s
            if (/#$/.test(text)) {
                const trimmed = rtrim(text, '#');
                if (this.options.pedantic) {
                    text = trimmed.trim();
                } else if (!trimmed || / $/.test(trimmed)) {
                    // CommonMark requires space before trailing #s
                    text = trimmed.trim();
                }
            }

            return {
                type: 'heading',
                raw: cap[0],
                depth: cap[1].length,
                text,
                tokens: this.lexer.inline(text),
            };
        }
        return false;
    },
    //
    // hr(src: string): marked.Tokens.Hr | false {
    //     const cap =
    //         /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n|$)/.exec(
    //             src,
    //         );
    //     if (cap) {
    //         return {
    //             type: 'hr',
    //             raw: cap[0],
    //         };
    //     }
    //     return false;
    // },
};
