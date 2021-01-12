
import * as vscode from 'vscode';

export default class ListOfNamesIntoProperties{
    activeEditor() {
       
        return vscode.window.activeTextEditor;
    }

    toClassProperties(){
        //input:
        //|"a,b,foo"            |
        //output:
        //| public $a;          |
        //| public b;           |
        //| public $foo;         |
        //
        let active= this.activeEditor();
        const selections: vscode.Selection[] = active.selections;
        
       active.edit(function(edit: vscode.TextEditorEdit){
        for (const selection of selections) {
            
            
            let text=active.document.getText(selection);
            let properties= text.split(',');

            let propertiesClass='';
            properties.forEach(x=>{
                if(x.trim().length!==0){
                    //ignore white
                    propertiesClass+=  "public $"+x.trim()+";"+"\n";
                }

            });

            edit.replace(
                //new vscode.Position(lineNumber, 0),
                selection,
                propertiesClass
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

    ddlToClassProperties(){
        //input :a SERIAL NOT NULL, date timestamp(6)
        //output:
        // /**
        // * @var int
        // *    
        // */
        //  public $a;
        //
        //

        let active= this.activeEditor();
        const selections: vscode.Selection[] = active.selections;
        
       active.edit(function(edit: vscode.TextEditorEdit){
        for (const selection of selections) {
            
            
            let text=active.document.getText(selection);
            let properties= text.split(',');

            let propertiesClass='';
            let type='[type]';
            let template=`/**\n`+` *`+`* @var `+type+`\n`+` */`;
            let tableName='';

            if(text.includes('create')||text.includes('CREATE')){
                let ddl=text.toLowerCase()
                //let res=ddl.match(/create table(.*)\(/);
                 //res=ddl.match(/create table (\W+\()/ig);//i=insensitive,g=global
                 //res=ddl.match(/create table (\W+\()/ig);//i=insensitive,g=global
                 //if the g flag is not used, only the first complete match and its related capturing groups are returned. In this case, the returned item will have additional properties as described below.
                 let res=ddl.match(/(create table) +(\w+ )\(/i);//the firts group is , the second "CREATE TABLE" and the third is the table name
                if(res){
                    tableName=res[2];
                }



            }


            properties.forEach(x=>{
                //the firts word of the line is the property/column name
                x=x.trim();
                if(/PRIMARY KEY/.test(x)){
                    return;
                }

                let pName=x.substring(0, x.indexOf(' '));
                let rest=x.substr(x.indexOf(' '));



                if(x.trim().length!==0 ){

                    if(/SERIAL|int|INT/.test(rest)){
                        type="int";
                    }else if(/var|text|string/.test(rest)){
                        type="string"   
                    }else if(/timestamp|date/.test(rest)){
                        type="Carbon"
                    }

                    let template=`/**\n`+` *`+`\n`+` * @var `+type+`\n`+` */`;
                    //ignore white
                    propertiesClass+= template+"\n"+ "public $"+pName.trim()+";"+"\n";
                }

            });
            let templateFull=propertiesClass
            if(tableName){
                let templateClass=`class ${tableName} {`+"\n"+ propertiesClass+"\n"+"}"
                templateFull=templateClass
            }else{
                //if the name wasn't resolve
                templateFull=propertiesClass

            }

            edit.replace(
                //new vscode.Position(lineNumber, 0),
                selection,
                templateFull
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
    ddlToForms(){
        //it should ask if the implementation is vue, angular,react, then if the framework is bootstrap is gonna be horizontal or vertical
          //input :a SERIAL NOT NULL, date timestamp(6)
        //output:
        //
        // <div class="">
        ///  <label>a</label>
        ///  <input class="form-control" v-model="a"/>
        //
        //</div>
        //
        //

        let active= this.activeEditor();
        const selections: vscode.Selection[] = active.selections;
        
       active.edit(function(edit: vscode.TextEditorEdit){
        for (const selection of selections) {
            
            
            let text=active.document.getText(selection);
            let properties= text.split(',');

            let divInputsTemplate='';
            let type=null;
            let template=null;
            let tableName='';

            if(text.includes('create')||text.includes('CREATE')){
                let ddl=text.toLowerCase()
                //let res=ddl.match(/create table(.*)\(/);
                 //res=ddl.match(/create table (\W+\()/ig);//i=insensitive,g=global
                 //res=ddl.match(/create table (\W+\()/ig);//i=insensitive,g=global
                 //if the g flag is not used, only the first complete match and its related capturing groups are returned. In this case, the returned item will have additional properties as described below.
                 let res=ddl.match(/(create table) +(\w+ )\(/i);//the firts group is , the second "CREATE TABLE" and the third is the table name
                if(res){
                    tableName=res[2];
                }
            }
            properties.forEach(x=>{
                //the firts word of the line is the property/column name
                x=x.trim();
                if(/PRIMARY KEY/.test(x)){
                    return;
                }
                let pName=null;
                let rest=null
                if(x.includes(' ')){

                     pName=x.substring(0, x.indexOf(' '));
                     rest =x.substr(x.indexOf(' '));
                }else{
                    pName=x
                }

                if(x.trim().length!==0 && rest){

                    if(/SERIAL|int|INT/.test(rest)){
                        type="int";
                    }else if(/var|text|string/.test(rest)){
                        type="string"   
                    }else if(/timestamp|date/.test(rest)){
                        type="Carbon"
                    }

                   
                }
                let template=`<div class="">\n<label>`+pName+`</label>`;
                //ignore white
                divInputsTemplate+= template+"\n"+ "<input class=\"form-control\" v-model=\""+pName.trim()+"\""+"/>\n <div>\n";

            });
            let templateFull=divInputsTemplate
            if(tableName){
                let templateClass=`<div>\n  ${divInputsTemplate} \n </div>`
                templateFull=templateClass
            }else{
                //if the name wasn't resolve
                templateFull=divInputsTemplate

            }

            edit.replace(
                //new vscode.Position(lineNumber, 0),
                selection,
                templateFull
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
}