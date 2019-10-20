import * as vscode from 'vscode';
import { ok } from 'assert';
import { Names } from '../../Names';

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
    toClass(text:string){
        try {
        let json=JSON.parse(text);
        //is is an object then
        let template=  this.mapToClass(json);
        let active= this.activeEditor();

        this.render(template,active.selection.start.line)
        }catch(e){

        }
    }
    mapToClass(json,name:string=''){
        let lstclases=[];
        let template='class '+name+' {'+"\n";
        const tab="\t";
        const newLine="\n";
        const templateComment=` `
         +tab+`/**`+newLine
         +tab+`* Undocumented variable`+newLine
         +tab+`*`+newLine
         +tab+`* @var :name`+newLine
         +tab+`*/`;
        Object.getOwnPropertyNames(json).forEach(p=>{
            let type='';
            if(typeof  json[p] =='boolean'){
                type='boolean';
            }else if(typeof  json[p] =='string'){
                type='string';

            
            }else if(typeof  json[p] =='number'){
                type='float';//it can be integer but i left this 

            }
            if(json[p].constructor === Array){
                type='array';
                //here. the array can contains complex types
                //if is not emtpy I will select the first element as the model
                if(json[p].length>0){
                    if(typeof json[p][0]==='object' &&typeof json[p][0]!=null){
                        //in plural , is common that the name ends with 's' or 'es' or 'ss'
                        let pluralNounsEnds=['s','es','ss'];
                        let singularName=p;//by default I initialize with the propertyname(it will be override in case it ends with a plural termination)
                        for (let index = 0; index < pluralNounsEnds.length; index++) {
                           if(p.endsWith(pluralNounsEnds[index])){
                                singularName=p.substr(0,p.length-pluralNounsEnds[index].length);
                                break;
                           }
                            
                        }
                        type=Names.toCamelCase( singularName);
                        let classe = this.mapToClass (json[p][0],type);//recursivity
                        lstclases.push(classe);
                        //as  this an array the type must have the form Type[]
                        type+="[]"
                    }else{
                        //other wise is scalar type
                    }
                }
            }else 
            if(typeof json[p] === 'object' && json[p] !== null){
              type=Names.toCamelCase( p);
              let classe = this.mapToClass (json[p],type);//recursivity
              lstclases.push(classe);

            }
            template+=templateComment.replace(':name',type)+"\n";//in this case the prope
            template+=tab+"public $"+p+";"+"\n";
        }); 
        template+="}"+"\n";
        lstclases.forEach(clas=>{
            template+=clas;
        })
        return template;
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