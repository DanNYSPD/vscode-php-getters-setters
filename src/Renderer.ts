import * as vscode from 'vscode';
import Redirector from './Redirector';
import { Resolver } from './extension';

export default class Renderer {
    static closingClassLine() {        
        const editor = vscode.window.activeTextEditor;
        //search starting by the last }, which in a PHP oriented style means that the last } is the end of class.
        for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
            const line = editor.document.lineAt(lineNumber);
            const text = line.text.trim();

            if (text.startsWith('}')) {
                return line;
            }
        }

        return null;
    }
    static insertLine() {
        return this.closingClassLine();
    }
    static showErrorMessage(message: string) {
        message = 'phpGettersSetters error: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showErrorMessage(message);
    }

    static showInformationMessage(message: string) {
        message = 'phpGettersSetters info: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showInformationMessage(message);
    }

   static renderTemplate(template: string,lineNumber:number,resolver:Resolver) {
        if (!template) {
            this.showErrorMessage('Missing template to render.');
            return;
        }
        if(!lineNumber){
            let insertLine = this.insertLine();
            
            if (!insertLine) {
                this.showErrorMessage('Unable to detect insert line for template.');
                return;
            }
            lineNumber=insertLine.lineNumber;
        }
        const editor = vscode.window.activeTextEditor;
        

     return   editor.edit(function(edit: vscode.TextEditorEdit){
            edit.replace(
                new vscode.Position(lineNumber, 0),
                template
            );
        }).then(
            success => {
                if (resolver.isRedirectEnabled() && success) {
                    const redirector = new Redirector(editor);
                    //redirector.goToLine(this.closingClassLine().lineNumber - 1);
                    redirector.goToLine(lineNumber);
                }
            },
            error => {
                this.showErrorMessage(`Error generating functions: ` + error);
            }
        );
        
    }
}