import * as yaml from 'js-yaml';
import isEmpty from 'lodash/isEmpty';
import { isString } from '../../helpers/utils';

type YamlDefinition = Record<string, any> | null;
type FileMeta = { metadata: YamlDefinition; content: string };

const parseYaml = (content: string): Record<string, any> | null => {
    try {
        const yamlContent = yaml.load(content, { json: true });
        if (isString(yamlContent)) return null;
        return yamlContent;
    } catch (e) {
        return null;
    }
};

const serializeToYaml = (metadata: Record<string, any>): string => {
    let content = '';
    try {
        content = yaml.dump(metadata);
    } catch (e) {
        console.log(e);
    }
    if (content && content.trim() !== '{}') {
        return `---\n${content}---`;
    }
    return '';
};

export const serializeEntity = (
    metadata: Record<string, any>,
    content: string,
): string => {
    const metadataString = serializeToYaml(metadata);
    return [metadataString, content].filter(v => !!v).join('\n');
};

export const parseFileContent = (content: string): FileMeta => {
    const payload = {
        metadata: null,
        content,
    };

    const match = content.matchAll(/-{3,}\s*?\n?/g);
    let start = 0;
    for (const line of match) {
        const slice = content.slice(start, line.index);
        const yamlHeader = parseYaml(slice);
        start = line.index + line[0].length;
        if (yamlHeader && !isEmpty(yamlHeader)) {
            payload.metadata = yamlHeader;
            payload.content = content.slice(start, content.length);
            break;
        }
    }
    return payload;
};
