// tslint:disable-next-line:quotemark
import * as vscode from 'vscode';


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

    
    static fromEditorPosition(editor: vscode.TextEditor, activePosition: vscode.Position) {
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
}