import * as vscode from 'vscode';
import { ok } from 'assert';
import { Names } from '../../Names';

export default class TextTransforms{



    activeEditor() {
       
                return vscode.window.activeTextEditor;
            }
     toSnakeCase(){
        let active= this.activeEditor();
        
        let text=active.document.getText(active.selection);
        let newText=  Names.toSnakeCase(text);
        this.render(newText,active.selection.start.line);       
    }
  
 
    render(template,lineNumber){
        let editor= this.activeEditor();

        return   editor.edit(function(edit: vscode.TextEditorEdit){
            edit.replace(
                new vscode.Position(lineNumber, 0),
                template
            );
        }).then(
            success => {
                
            },
            error => {
               // this.showErrorMessage(`Error generating functions: ` + error);
            }
        );
    }
}