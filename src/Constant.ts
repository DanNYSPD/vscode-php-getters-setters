// tslint:disable-next-line:quotemark
import * as vscode from 'vscode';
import StringUtils from './StringUtils';
import Property from './Property';

import { Names } from './Names';
export default class Constant { 
    private description: string = null;
    private name: string;
    private indentation: string;
    private camelCaseName:string;
    private type:string;


    public constructor(name: string) {
        this.name = name;

    }

    static lowerCaseAt(str:string,index:number=0){
        for (; index < str.length; index++) {
            if(str[index] == str[index].toLowerCase()){
                 return index;
            }           
        }
        return -1;  
    }

    /**
     * Look for the firts character with a UpperCase
     * @param str 
     * @param index 
     */
    static upperCaseAt(str:string,index:number = 0):number{
       for (; index < str.length; index++) {
           if(str[index] == str[index].toUpperCase()){
                return index;
           }           
       }
       return -1;
    }
    static hasUpperCase(str:string){
        //if after tranform it to lower case is diferrente it means it has at least one character
         return str.toLowerCase()!=str;   
    }

    /**
     * returns the constant declared in the active position
     * @param editor 
     * @param activePosition 
     */
    static fromEditorPosition(editor: vscode.TextEditor, activePosition: vscode.Position) :Constant{
        const wordRange = editor.document.getWordRangeAtPosition(activePosition);
        
        if (wordRange === undefined) {
            throw new Error('No property found. Please select a property to use this extension.');
        }

        const selectedWord = editor.document.getText(wordRange);
        
        //if(!wordRange.contains('constant')){
        //}
        if (selectedWord[0] === '$') {
            throw new Error('No constant found. Please select a constant to use this extension.');
        }
        let constant = new Constant(selectedWord);
        const activeLineNumber = activePosition.line;
        const activeLine = editor.document.lineAt(activeLineNumber);

        constant.indentation = activeLine.text.substring(0, activeLine.firstNonWhitespaceCharacterIndex);

        const previousLineNumber = activeLineNumber - 1;
        //if there is nothing before just return the constant
        if (previousLineNumber <= 0) {
            return constant;
        }
        const previousLine = editor.document.lineAt(previousLineNumber);
        // No doc block found
        if (!previousLine.text.endsWith('*/')) {
            return constant;
        }



        //since the line number where we found the constant up to above(we decrease the line number):
        for (let lineNumber = previousLineNumber - 1; lineNumber > 0; lineNumber--) {
            // Everything found (it has all properties)
            if (constant.name 
               // && constant.type 
                 && constant.description) {
                break;
            }

            const text = editor.document.lineAt(lineNumber).text;
            //:::note here, some peope usea comments in line son for the future this must be considere
            // Reached the end of the doc block (multiline comments)
            if (text.includes('/**') || !text.includes('*')) {
                break;
            }

            // Remove spaces & tabs
            const lineParts = text.split(' ').filter(function(value){
                return value !== '' && value !== "\t" && value !== "*";
            });
            //we look for the @const annotation:
            const varPosition = lineParts.indexOf('@const');//note const is not a standard

            // Found @const line
            if (-1 !== varPosition) {
                //property.setType(lineParts[varPosition + 1]);

                var descriptionParts = lineParts.slice(varPosition + 2);

                if (descriptionParts.length) {
                    constant.description = descriptionParts.join(` `);
                }

                continue;
            }

            const posibleDescription = lineParts.join(` `);

            if (posibleDescription[0] !== '@') {
                constant.description = posibleDescription;
            }
        }

        return constant;
        
    }
    
    getName(){
        return this.name;
    }
    getDescription(){
        return this.description;
    }

    getIndentation() : string {
        return this.indentation;
    }
    getType(){
        return this.type;
    }
    /**
     * Returns all the constants that are declared in single lines:
     * @param text 
     */
    static getConstants(text :vscode.TextDocument):Constant[]{
        var i=0;
        //let lstConstants:string[]=[];
        let lstConstants:Constant[]=[];
        while(i<text.lineCount){
            var line=text.lineAt(i);

            if(
                !line.text.includes('$')&&
                line.text.includes('const')//keyword const

             && line.text.includes(';')
            &&!line.isEmptyOrWhitespace){//with this I descart the line, improving performance too
                if(
                    
                 !line.text.includes('function') //discard function declartion
                && !line.text.includes('__construct') //discard constructor
                ){//note: this doesnt consider the php 7.4 that was realeased in november  and which will allow hint type
                    
                    if(line.text.includes('=')){ //it means that there is a asignation and because it's a constant it must have a declaration
                        let cleanedLine=line.text.trim();
                        if(StringUtils.startsWithOr(cleanedLine,['public','protected','private'])){
                            //this means this constant has a scope, so the line has the next expression "scope const CONSTANT_NAME="";"
                            
                        }else{
                            //the line has the form const CONSTANT_NAME=
                        }
                        let name=StringUtils.getTextBetween("const","=",cleanedLine);
                       
                        let constantObj= new Constant(name.trim());
                        constantObj.indentation="    ";//four spaces
                        constantObj.type="";//(si despues del igual existen comillas simples o dobles antes del ; entonces es un string, en otro caso es un numerico(si incluye punto es un float, en caso contrario un int), false y true son booleanos, )
                    
                       lstConstants.push(constantObj);


                    }
                }
            }
            i++
        }
        return lstConstants;
    }
    getPascalCaseName():string{
        return Names.toCamelCase(this.name);
    }
    /**
     * This method returns the appropiated predicate function isPropertyConstant name
     * @param property 
     */
    getIsConstantFunctionName(property:Property):string{
        //first to ensure the the name of the const is not repeated, I will check if the property ends with the constant name, in this case I will avoid the constant name repetition

        //example isParameterSearchModeSearchModeLike. where SearchMode is duplicated because the property name is ParameterSearchMode and the comparable constnat name is SEARCH_MODE_LIKE
        
        let propertyName=property.getPascalCaseName();
        let constName=this.getPascalCaseName();
        let isConstantName="is"

        
        if(propertyName.endsWith(constName)){
            isConstantName+= propertyName.substr(0, propertyName.indexOf(constName))+constName;
        }else{
            //because I used to put CONSTANT_NAME_SUBNAME, I need to remote the "subname" part(this is because ). the format is PascalCase so O need to remove the last part (since the last Uppercase Char):
            let lastUppercaseIndex=-1
            constName.split("").reverse().some((x,index)=>{
                lastUppercaseIndex=index;
                return x.toUpperCase()==x
            })
            
            lastUppercaseIndex= constName.length-lastUppercaseIndex;
           let cleanedConstName=constName.substr(0,lastUppercaseIndex-1)
            if(propertyName.endsWith(cleanedConstName)){
                //I remove the cleanedConstName from the constName to leave only the suffix
                let constantSuffix=constName.substr(lastUppercaseIndex-1,constName.length-lastUppercaseIndex+1);
                isConstantName+=propertyName+ constantSuffix.charAt(0).toUpperCase()+constantSuffix.slice(1);  
            }else{
                //constName=constName.substr(lastUppercaseIndex,constName.length-lastUppercaseIndex);
            isConstantName+=propertyName+constName;
            }
        }
        return isConstantName;
    }

    getIsConstantDescription(property:Property):string{
       return `Checks whether the property value of ${property.getName()} is equal to the class constant value '${this.getName()}'` 
    }
}