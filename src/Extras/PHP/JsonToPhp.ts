import * as vscode from 'vscode';

export default class JsonToPhp{



    activeEditor() {
       
                return vscode.window.activeTextEditor;
            }
     jsonTo(){
        let active= this.activeEditor();
        
        let text=active.document.getText(active.selection);
        let options=['Array','Class'];
        vscode.window.showQuickPick(options).then(selectedValue=>{
            vscode.window.showInformationMessage("Seleccionaste"+selectedValue);
            if(selectedValue=='Array'){
                this.toArray(text)
            }else{
                this.toClass(text);
            }
        });
    }
    toArray(text:String){
         let newText=text.replace(/{/g,"[").replace(/}/g,"]")
          newText=newText.replace(/:/g,"=>");

         let active= this.activeEditor();
         
        this.render(newText,active.selection.start.line);

    }
    toClass(text:String){

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