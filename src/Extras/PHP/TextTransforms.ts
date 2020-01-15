import * as vscode from 'vscode';
import { ok } from 'assert';
import { Names } from '../../Names';

export default class TextTransforms{



    activeEditor() {
       
                return vscode.window.activeTextEditor;
            }
     toSnakeCase(){
        let active= this.activeEditor();
        const selections: vscode.Selection[] = active.selections;
        
       active.edit(function(edit: vscode.TextEditorEdit){
        for (const selection of selections) {
            let text=active.document.getText(selection);
            let newText=  Names.toSnakeCase(text);
            edit.replace(
                //new vscode.Position(lineNumber, 0),
                selection,
                newText
            );
        }
           
        }).then(
            success => {
                
            },
            error => {
               // this.showErrorMessage(`Error generating functions: ` + error);
            }
        );      
    }
  
 
    render(editor,template,lineNumber){
        

        return   editor.edit(function(edit: vscode.TextEditorEdit){
            edit.replace(
                //new vscode.Position(lineNumber, 0),
                lineNumber,
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