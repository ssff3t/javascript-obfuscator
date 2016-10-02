import * as estraverse from 'estraverse';
import * as ESTree from 'estree';

import { AbstractNodeObfuscator } from './AbstractNodeObfuscator';
import { Nodes } from '../Nodes';
import { Utils } from '../Utils';
import { StringLiteralReplacer } from './replacers/StringLiteralReplacer';

/**
 * replaces:
 *     foo () { //... };
 *
 * on:
 *     [_0x9a4e('0x0')] { //... };
 */
export class MethodDefinitionObfuscator extends AbstractNodeObfuscator {
    /**
     * @type {string[]}
     */
    private ignoredNames: string[] = ['constructor'];

    /**
     * @param methodDefinitionNode
     * @param parentNode
     */
    public obfuscateNode (methodDefinitionNode: ESTree.MethodDefinition, parentNode: ESTree.Node): void {
        this.replaceMethodName(methodDefinitionNode);
    }

    /**
     * @param methodDefinitionNode
     */
    private replaceMethodName (methodDefinitionNode: ESTree.MethodDefinition): void {
        estraverse.replace(methodDefinitionNode.key, {
            enter: (node: ESTree.Node): any => {
                if (
                    Nodes.isIdentifierNode(node) &&
                    !Utils.arrayContains(this.ignoredNames, node.name) &&
                    methodDefinitionNode.computed === false
                ) {
                    methodDefinitionNode.computed = true;
                    node.name = new StringLiteralReplacer(this.nodes, this.options)
                        .replace(node.name);

                    return;
                }

                return estraverse.VisitorOption.Skip;
            }
        });
    }
}
